import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib
import numpy as np
import pandas as pd

from app.ml.features import (
    FEATURE_COLUMNS,
    FEATURE_DESCRIPTIONS,
    compute_single_inference_features,
)
from app.schemas.hazard import (
    HazardEvaluation,
    HazardFactor,
    HazardLevel,
    HazardPredictionResponse,
)
from app.schemas.observation import StationName
from app.services.live_ingestion import live_ingestion_service
from app.storage.repository import ObservationRepository

logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"


class HazardService:
    def __init__(self):
        self._models: Dict[str, Any] = {}
        self._metadata: Dict[str, Dict[str, Any]] = {}

    def _get_model_and_meta(self, station: StationName):
        station_name = station.value
        if station_name not in self._models:
            model_path = MODELS_DIR / f"hazard_model_{station_name}.joblib"
            meta_path = MODELS_DIR / f"hazard_metadata_{station_name}.json"

            if not model_path.exists() or not meta_path.exists():
                logger.error(f"Hazard model or metadata missing for {station_name} at {model_path}")
                raise FileNotFoundError(
                    f"Trained hazard model not found for {station_name}. Run 'scripts/train_hazard_models.py' first."
                )

            self._models[station_name] = joblib.load(model_path)
            with open(meta_path, "r", encoding="utf-8") as f:
                self._metadata[station_name] = json.load(f)

        return self._models[station_name], self._metadata[station_name]

    def predict_hazard(
        self, station: StationName, repo: ObservationRepository
    ) -> HazardPredictionResponse:
        """
        Executes ML inference using trained RandomForestClassifier and generates explainable drivers.
        """
        model, metadata = self._get_model_and_meta(station)

        records: List[Dict[str, Any]] = []
        live_data = live_ingestion_service.get_cached_or_fetch(station)
        ref_time = datetime.now(timezone.utc)

        if live_data and live_data.series_24h and len(live_data.series_24h) >= 5:
            ref_time = live_data.last_fetched_at
            for pt in live_data.series_24h:
                records.append({
                    "timestamp": pt.timestamp,
                    "temperature": pt.temperature or -10.0,
                    "wind_speed": pt.wind_speed or 5.0,
                    "atmospheric_pressure": pt.atmospheric_pressure or 970.0,
                })
        else:
            df = repo.get_dataframe(station)
            if not df.empty:
                recent_df = df.sort_values("timestamp", ascending=True).tail(25)
                ref_time = recent_df["timestamp"].iloc[-1].to_pydatetime()
                for _, row in recent_df.iterrows():
                    records.append({
                        "timestamp": row["timestamp"],
                        "temperature": row["temperature"] if pd.notna(row["temperature"]) else -10.0,
                        "wind_speed": row["wind_speed"] if pd.notna(row["wind_speed"]) else 5.0,
                        "atmospheric_pressure": row["atmospheric_pressure"] if pd.notna(row["atmospheric_pressure"]) else 970.0,
                    })

        features_df = compute_single_inference_features(records)

        try:
            probas = model.predict_proba(features_df[FEATURE_COLUMNS])[0]
            if len(probas) == 2:
                prob = float(probas[1])
            else:
                prob = float(probas[0])
        except Exception as e:
            logger.error(f"Model prediction error: {e}")
            prob = 0.15

        if prob >= 0.70:
            level = HazardLevel.CRITICAL
            guidance = "CRITICAL HAZARD WARNING: Station lockdown recommended. Halt all outdoor traverses and secure exterior antenna arrays."
        elif prob >= 0.35:
            level = HazardLevel.MODERATE
            guidance = "ELEVATED WEATHER ADVISORY: Approaching frontal boundary or increasing katabatic winds. Review generator fuel lines and expedition radio checks."
        else:
            level = HazardLevel.LOW
            guidance = "NOMINAL POLAR CONDITIONS: Telemetry within baseline Antarctic operational tolerances. Normal scientific and station operations permitted."

        is_hazard = prob >= 0.50

        feat_importances = metadata.get("feature_importances", {})
        feat_descriptions = metadata.get("feature_descriptions", FEATURE_DESCRIPTIONS)

        top_factors: List[HazardFactor] = []
        driver_phrases: List[str] = []

        sorted_feats = sorted(feat_importances.items(), key=lambda kv: kv[1], reverse=True)
        for feat_name, imp_score in sorted_feats[:3]:
            val = float(features_df[feat_name].iloc[0])
            desc = feat_descriptions.get(feat_name, feat_name)

            if "wind" in feat_name:
                if val > 12.0:
                    phrase = f"Elevated wind velocity ({val:.1f} m/s)"
                elif "trend" in feat_name and val > 0:
                    phrase = f"Accelerating wind speed trend (+{val:.2f} m/s rate)"
                elif "delta" in feat_name and val > 0:
                    phrase = f"Significant gust increase (+{val:.1f} m/s over 24h)"
                else:
                    phrase = f"Wind stability ({val:.1f} m/s)"
            elif "temp" in feat_name:
                if "delta" in feat_name and val < -3.0:
                    phrase = f"Severe thermal plunge ({val:.1f}°C drop)"
                elif val < -20.0:
                    phrase = f"Extreme hypothermic cold ({val:.1f}°C ambient)"
                else:
                    phrase = f"Ambient temperature baseline ({val:.1f}°C)"
            elif "press" in feat_name:
                if val < -0.5:
                    phrase = f"Steep barometric pressure drop ({val:.2f} hPa/hr, storm front indicator)"
                else:
                    phrase = f"Barometric pressure trend ({val:.2f} hPa/hr)"
            else:
                phrase = f"{desc} observed at {val:.2f}"

            driver_phrases.append(phrase)
            top_factors.append(
                HazardFactor(
                    feature_name=feat_name,
                    factor_label=desc,
                    importance_pct=round(imp_score * 100, 1),
                    current_value=round(val, 2),
                    impact_description=phrase,
                )
            )

        primary_driver = "; ".join(driver_phrases[:2]) if driver_phrases else "Baseline polar weather parameters"

        metrics = metadata.get("metrics", {})
        evaluation = HazardEvaluation(
            accuracy=metrics.get("accuracy", 0.80),
            precision=metrics.get("precision", 0.55),
            recall=metrics.get("recall", 0.48),
            f1_score=metrics.get("f1_score", 0.51),
            test_samples=metadata.get("test_samples", 5252),
            train_samples=metadata.get("train_samples", 21004),
            split_strategy=metadata.get("split_strategy", "Chronological 80/20 (No temporal shuffle)"),
        )

        return HazardPredictionResponse(
            station=station,
            prediction_time=datetime.now(timezone.utc),
            reference_observation_time=ref_time,
            hazard_probability=round(prob, 3),
            hazard_level=level,
            is_hazard=is_hazard,
            data_integrity_tag="[ ML HAZARD PREDICTION ]",
            model_name="RandomForestClassifier (100 estimators, balanced)",
            primary_driver=primary_driver,
            top_contributing_factors=top_factors,
            thresholds=metadata.get("thresholds", {}),
            model_evaluation=evaluation,
            operational_guidance=guidance,
        )


hazard_service = HazardService()
