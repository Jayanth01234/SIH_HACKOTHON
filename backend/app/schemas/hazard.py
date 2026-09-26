from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.observation import StationName


class HazardLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    CRITICAL = "CRITICAL"


class HazardFactor(BaseModel):
    feature_name: str
    factor_label: str
    importance_pct: float
    current_value: float
    impact_description: str


class HazardEvaluation(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    test_samples: int
    train_samples: int
    split_strategy: str


class HazardPredictionResponse(BaseModel):
    station: StationName
    prediction_time: datetime
    reference_observation_time: datetime
    hazard_probability: float = Field(..., description="Calibrated ML probability [0.0, 1.0] from model.predict_proba()")
    hazard_level: HazardLevel
    is_hazard: bool
    data_integrity_tag: str = Field(
        default="[ ML HAZARD PREDICTION ]",
        description="Formal provenance label"
    )
    model_name: str = Field(
        default="RandomForestClassifier (100 estimators, balanced)",
        description="Underlying scikit-learn model architecture"
    )
    primary_driver: str = Field(..., description="Human-understandable summary of chief risk driver")
    top_contributing_factors: List[HazardFactor] = Field(
        default_factory=list,
        description="Key features driving the prediction according to Gini importance and observed values"
    )
    thresholds: Dict[str, float] = Field(
        default_factory=dict,
        description="Hazard definition thresholds used during training"
    )
    model_evaluation: HazardEvaluation
    operational_guidance: str
