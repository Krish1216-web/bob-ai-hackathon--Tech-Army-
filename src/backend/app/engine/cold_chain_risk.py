"""
ChainGuard AI — Sigmoid Risk Model & Diversion Cost Optimizer
Source: LiveCold-Pathway-RAG-main (decision_engine/risk_model.py & diversion_optimizer.py)
"""

import math
from typing import Dict, Any

def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-max(-500.0, min(500.0, x))))

def calculate_spoilage_probability(deviation_c: float, exposure_duration_mins: float, eta_hours: float) -> float:
    """
    Sigmoid-based probability calculation:
      risk = sigmoid(deviation * 1.8 + (exposure_mins / 30.0) * 0.8) * eta_factor
    """
    if deviation_c <= 0:
        return 0.02
    raw = deviation_c * 1.8 + (exposure_duration_mins / 30.0) * 0.8
    prob = sigmoid(raw - 2.0)
    eta_factor = min(1.3, 1.0 + (eta_hours / 48.0) * 0.3)
    return min(0.99, prob * eta_factor)

def evaluate_economic_diversion(cargo_value_usd: float, spoilage_prob: float, diversion_cost_usd: float = 1200.0) -> Dict[str, Any]:
    expected_loss = cargo_value_usd * spoilage_prob
    net_saving = expected_loss - diversion_cost_usd
    should_divert = net_saving > 0 and spoilage_prob >= 0.50

    return {
        "should_divert": should_divert,
        "spoilage_probability": round(spoilage_prob, 3),
        "expected_loss_usd": round(expected_loss, 2),
        "diversion_cost_usd": diversion_cost_usd,
        "net_saving_usd": round(max(0.0, net_saving), 2),
        "decision": "EXECUTE_DIVERSION" if should_divert else "CONTINUE_MONITORING"
    }
