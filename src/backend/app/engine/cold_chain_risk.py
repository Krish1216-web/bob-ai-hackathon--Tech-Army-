"""
ChainGuard AI — Sigmoid Risk Model & Diversion Cost Optimizer
Source: LiveCold-Pathway-RAG-main (decision_engine/risk_model.py & diversion_optimizer.py)
Supports:
  - Sigmoid-based dynamic spoilage calculation
  - Multi-mode economic diversion evaluation (SAFETY, BALANCED, ECO)
"""

import math
from typing import Dict, Any

def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-max(-500.0, min(500.0, x))))

def calculate_spoilage_probability(
    deviation_c: float,
    exposure_duration_mins: float,
    eta_hours: float = 18.0,
    product_type: str = "vaccines"
) -> float:
    """
    Sigmoid-based continuous dynamic spoilage probability calculation:
      - Sensitivity factor depends on product fragility (vaccines > biologics > pharma > produce)
      - Combines thermal deviation amplitude, sustained duration, and remaining transit ETA.
    """
    if deviation_c <= 0:
        return 0.02

    # Product fragility coefficients
    p_lower = product_type.lower()
    if "vaccine" in p_lower:
        k_dev = 2.2
        k_dur = 1.0
    elif "biologic" in p_lower or "insulin" in p_lower:
        k_dev = 2.0
        k_dur = 0.9
    elif "pharma" in p_lower:
        k_dev = 1.7
        k_dur = 0.8
    elif "frozen" in p_lower or "meat" in p_lower or "seafood" in p_lower:
        k_dev = 1.5
        k_dur = 0.7
    else:
        k_dev = 1.3
        k_dur = 0.6

    raw = (deviation_c * k_dev) + ((exposure_duration_mins / 30.0) * k_dur)
    prob = sigmoid(raw - 2.0)
    eta_factor = min(1.35, 1.0 + (eta_hours / 48.0) * 0.35)
    return min(0.99, max(0.01, prob * eta_factor))

def evaluate_economic_diversion(
    cargo_value_usd: float,
    spoilage_prob: float,
    detour_distance_km: float = 14.2,
    mode: str = "SAFETY",
    handling_fee_usd: float = 450.0,
    fuel_rate_per_km: float = 3.5
) -> Dict[str, Any]:
    """
    Cost-Benefit Decision Matrix:
      Mode Thresholds:
        - SAFETY: Reroute if spoilage_prob >= 0.30 (Critical biopharma protection)
        - BALANCED: Reroute if net_saving > 0 and spoilage_prob >= 0.50
        - ECO: Reroute if net_saving > $2,000 and spoilage_prob >= 0.65
    """
    diversion_cost_usd = handling_fee_usd + (detour_distance_km * fuel_rate_per_km)
    expected_loss = cargo_value_usd * spoilage_prob
    expected_loss_post_diversion = cargo_value_usd * 0.03  # Residual risk once in certified hub
    net_saving = expected_loss - (diversion_cost_usd + expected_loss_post_diversion)

    mode_upper = mode.upper()
    if mode_upper == "SAFETY":
        should_divert = spoilage_prob >= 0.30 or net_saving > 0
        threshold_desc = "Safety priority active: Reroute recommended for >30% spoilage risk."
    elif mode_upper == "ECO":
        should_divert = net_saving > 2000.0 and spoilage_prob >= 0.65
        threshold_desc = "Eco mode: Reroute only when net financial savings exceed $2,000."
    else:  # BALANCED
        should_divert = net_saving > 0 and spoilage_prob >= 0.50
        threshold_desc = "Balanced mode: Reroute when net savings are positive and risk is >=50%."

    decision = "EXECUTE_DIVERSION" if should_divert else "CONTINUE_MONITORING"
    reason = (
        f"{threshold_desc} Expected loss if continuing is ${expected_loss:,.0f} "
        f"vs diversion cost ${diversion_cost_usd:,.0f} (Net saving: ${max(0.0, net_saving):,.0f})."
    )

    return {
        "should_divert": should_divert,
        "mode": mode_upper,
        "spoilage_probability": round(spoilage_prob, 3),
        "spoilage_risk_pct": f"{spoilage_prob * 100:.1f}%",
        "expected_loss_usd": round(expected_loss, 2),
        "diversion_cost_usd": round(diversion_cost_usd, 2),
        "expected_loss_post_diversion_usd": round(expected_loss_post_diversion, 2),
        "net_saving_usd": round(max(0.0, net_saving), 2),
        "decision": decision,
        "reason": reason
    }
