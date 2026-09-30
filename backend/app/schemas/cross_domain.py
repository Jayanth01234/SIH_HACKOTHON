from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DependencyNode(BaseModel):
    id: str
    label: str
    category: str  # environment, infrastructure, energy, logistics, operations
    status: str    # NORMAL, WARNING, CRITICAL, OFFLINE
    value: str
    stress_level: float = 0.0  # 0 to 100


class DependencyEdge(BaseModel):
    source: str
    target: str
    relationship: str
    impact_magnitude: float  # 0.0 to 1.0
    active: bool = False
    description: str


class CausalChainStep(BaseModel):
    step_number: int
    system: str
    event: str
    consequence: str
    severity: str
    recommended_check: str


class CrossDomainImpactAnalysis(BaseModel):
    station_id: str
    primary_event: str
    overall_system_stress: float
    affected_domains: List[str]
    nodes: List[DependencyNode]
    edges: List[DependencyEdge]
    causal_chain: List[CausalChainStep]
    operator_checklist: List[str]
