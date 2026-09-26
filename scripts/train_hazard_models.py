import json
import os
import sys
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.ml.features import compute_hazard_features_df, FEATURE_COLUMNS, FEATURE_DESCRIPTIONS

STATIONS = {
    "Maitri": "data/training/maitri/historical_training.csv",
    "Bharati": "data/training/bharati/historical_training.csv",
}

MODELS_DIR = Path("backend/app/models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)


def train_station_model(station_name: str, csv_path: str):
    print(f"\n==========================================")
    print(f"Training Hazard Model for Station: {station_name}")
    print(f"==========================================")
    
    df = pd.read_csv(csv_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)
    
    w95 = float(df["wind_speed"].quantile(0.95))
    print(f"[{station_name}] 95th Percentile Wind Speed: {w95:.2f} m/s")
    
    df_feat = compute_hazard_features_df(df)
    n = len(df_feat)
    y = np.zeros(n, dtype=int)
    
    wind_vals = df_feat["wind_speed"].values
    temp_vals = df_feat["temperature"].values
    
    horizon = 24
    for i in range(n - horizon):
        forward_wind_max = np.max(wind_vals[i+1 : i+1+horizon])
        forward_temp_min_delta = np.min(temp_vals[i+1 : i+1+horizon] - temp_vals[i])
        if forward_wind_max >= w95 or forward_temp_min_delta <= -5.0:
            y[i] = 1
            
    valid_mask = np.arange(n) < (n - horizon)
    X = df_feat.loc[valid_mask, FEATURE_COLUMNS]
    y = y[valid_mask]
    
    total_samples = len(X)
    hazard_samples = int(np.sum(y))
    print(f"[{station_name}] Total valid samples: {total_samples}, Hazard events: {hazard_samples} ({hazard_samples/total_samples*100:.1f}%)")
    
    split_idx = int(total_samples * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    train_dates = (df_feat["timestamp"].iloc[0].isoformat(), df_feat["timestamp"].iloc[split_idx-1].isoformat())
    test_dates = (df_feat["timestamp"].iloc[split_idx].isoformat(), df_feat["timestamp"].iloc[total_samples-1].isoformat())
    
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    importances = dict(zip(FEATURE_COLUMNS, [float(x) for x in clf.feature_importances_]))
    sorted_importances = sorted(importances.items(), key=lambda kv: kv[1], reverse=True)
    
    model_file = MODELS_DIR / f"hazard_model_{station_name}.joblib"
    joblib.dump(clf, model_file)
    print(f"[{station_name}] Saved model to {model_file}")
    
    meta_file = MODELS_DIR / f"hazard_metadata_{station_name}.json"
    metadata = {
        "station": station_name,
        "model_type": "RandomForestClassifier",
        "n_estimators": 100,
        "split_strategy": "Chronological 80/20 (No temporal shuffle)",
        "train_range": train_dates,
        "test_range": test_dates,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "thresholds": {
            "wind_speed_p95_ms": round(w95, 2),
            "temp_drop_threshold_c": -5.0,
            "forecast_lead_hours": horizon,
        },
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": cm,
        },
        "feature_importances": {k: round(v, 4) for k, v in sorted_importances},
        "feature_descriptions": FEATURE_DESCRIPTIONS,
    }
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[{station_name}] Saved metadata to {meta_file}")


def main():
    for station_name, csv_path in STATIONS.items():
        train_station_model(station_name, csv_path)
    print("\nAll station hazard prediction models successfully trained and persisted.")

if __name__ == "__main__":
    main()
