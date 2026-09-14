"""
ChainGuard AI — Integrated Supply Chain Business Rules Engine
Source: supply-chain-control-tower-main (src/supply_chain/rules.py, freight_rules.py, investigation_rules.py, recommendation_engine.py)
"""

from datetime import date, datetime
from typing import Dict, Any, List, Optional

EXCLUDED_STATUSES = {"CANCELLED", "CLOSED", "SHIPPED"}

def parse_date(value: Any) -> Optional[date]:
    if value is None or str(value).strip() == "":
        return None
    try:
        return datetime.strptime(str(value).strip()[:10], "%Y-%m-%d").date()
    except ValueError:
        return None

def calculate_delay_days(scheduled_date: Optional[date], current_date: date) -> int:
    if scheduled_date is None:
        return 0
    return max((current_date - scheduled_date).days, 0)

def assign_delay_status(order_status: str, delay_days: int) -> str:
    status_clean = str(order_status or "").upper()
    if status_clean in {"SHIPPED", "CLOSED", "DELIVERED"}:
        return "ON_TRACK"
    if status_clean == "CANCELLED":
        return "CANCELLED"
    if delay_days == 0:
        return "ON_TRACK"
    if 1 <= delay_days <= 3:
        return "DELAYED"
    return "AT_RISK"

def score_investigation_severity(delay_days: int, has_disruption: bool, is_cold_chain: bool, risk_score: int) -> str:
    if has_disruption and (is_cold_chain or risk_score >= 80 or delay_days > 5):
        return "CRITICAL"
    if has_disruption or risk_score >= 60 or delay_days >= 3:
        return "HIGH"
    if delay_days >= 1 or risk_score >= 40:
        return "MEDIUM"
    return "LOW"

def resolve_root_cause(disruption_title: str, carrier_status: str, is_cold_chain: bool) -> str:
    if disruption_title and disruption_title.upper() != "NONE":
        return f"ACTIVE_DISRUPTION: {disruption_title}"
    if is_cold_chain:
        return "COLD_CHAIN_TEMPERATURE_RISK"
    if carrier_status == "DELAYED":
        return "CARRIER_CAPACITY_BOTTLENECK"
    return "OPERATIONAL_DELAY"

def calculate_priority_score(delay_days: int, severity: str, has_disruption: bool, is_cold_chain: bool, value_usd: float) -> int:
    score = 0
    score += min(delay_days * 3, 30)

    severity_points = {
        "CRITICAL": 35,
        "HIGH": 25,
        "MEDIUM": 15,
        "LOW": 5
    }
    score += severity_points.get(severity, 10)

    if has_disruption:
        score += 20
    if is_cold_chain:
        score += 15
    if value_usd >= 1000000.0:
        score += 10

    return min(score, 100)

def generate_recommendation_action(
    shipment_id: str,
    cargo: str,
    disruption: str,
    origin: str,
    destination: str,
    carrier: str,
    value: str
) -> Dict[str, Any]:
    """
    Synthesizes supply-chain rules into structured, explainable action plans.
    """
    if "Mumbai" in disruption:
        return {
            "type": "REROUTE",
            "priority": "CRITICAL",
            "title": f"Reroute Shipment — {shipment_id}",
            "recommended_route": "Mundra → Frankfurt",
            "recommended_carrier": "Carrier B",
            "delay_reduction_hours": 28,
            "risk_reduction_percent": 64,
            "confidence": 94,
            "financial_saving": "$800K",
            "recommendation": "Reroute via Mundra Port and assign Carrier B with verified cold-chain telemetry.",
            "why_reasons": [
                f"Active disruption '{disruption}' blocking West Coast maritime corridor.",
                f"Cargo value {value} for {cargo} carries high spoilage & delay penalty.",
                "Mundra Port currently maintains verified open berth capacity.",
                "Carrier B possesses certified reefer capability for 2–8°C thermal monitoring."
            ]
        }
    elif "Chennai" in disruption:
        return {
            "type": "REROUTE",
            "priority": "HIGH",
            "title": f"Reroute Shipment — {shipment_id}",
            "recommended_route": "Colombo → Singapore",
            "recommended_carrier": "Carrier D",
            "delay_reduction_hours": 18,
            "risk_reduction_percent": 45,
            "confidence": 87,
            "financial_saving": "$320K",
            "recommendation": "Reroute via Colombo maritime feeder and assign Carrier D alternate vessel.",
            "why_reasons": [
                f"Cyclone warning in Bay of Bengal impacting Chennai corridor.",
                f"High-priority pharmaceutical consignment ({value}).",
                "Colombo feeder route provides immediate cyclone bypass."
            ]
        }
    else:
        return {
            "type": "MONITOR",
            "priority": "MEDIUM",
            "title": f"Active Telemetry Tracking — {shipment_id}",
            "recommended_route": f"{origin} → {destination}",
            "recommended_carrier": carrier,
            "delay_reduction_hours": 0,
            "risk_reduction_percent": 10,
            "confidence": 82,
            "financial_saving": "$0",
            "recommendation": f"Maintain real-time GPS and temperature monitoring with {carrier}.",
            "why_reasons": [
                "Standard in-transit monitoring.",
                "No critical corridor blockage currently detected."
            ]
        }
