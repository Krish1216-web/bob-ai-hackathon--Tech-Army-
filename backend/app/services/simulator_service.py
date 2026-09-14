from sqlalchemy.orm import Session
from typing import Dict, Any
from app.schemas.simulation import SimulationRequest, SimulationResponse, StrategyMetric, ProjectedRouteStep
from app.services.watsonx_service import watsonx_service

class SimulatorService:
    @staticmethod
    def run_simulation(db: Session, req: SimulationRequest) -> SimulationResponse:
        duration = req.duration_hours
        severity_lower = req.severity.lower()

        if severity_lower == "critical":
            reduction = 28 if duration == 72 else max(18, round(duration * 0.3888))
            ai_delay = duration - reduction # 44h
            alt_delay = duration - round(reduction * 0.72) # 52h
            exposure_without = "$1.25M"
            exposure_with = "$450K"
            alt_exposure = "$760K"
            critical_prot = 2
        elif severity_lower == "high":
            reduction = max(14, round(duration * 0.39))
            ai_delay = duration - reduction
            alt_delay = duration - round(reduction * 0.70)
            exposure_without = "$870K"
            exposure_with = "$310K"
            alt_exposure = "$520K"
            critical_prot = 1
        else:
            reduction = max(10, round(duration * 0.46))
            ai_delay = duration - reduction
            alt_delay = duration - round(reduction * 0.65)
            exposure_without = "$540K"
            exposure_with = "$180K"
            alt_exposure = "$340K"
            critical_prot = 1

        comparison_data = [
            StrategyMetric(
                name="Current",
                delay=duration,
                delay_reduction="—",
                financial_exposure=exposure_without,
                success_probability="41%"
            ),
            StrategyMetric(
                name="AI Recommended",
                delay=ai_delay,
                delay_reduction=f"{reduction}h",
                financial_exposure=exposure_with,
                success_probability="94%"
            ),
            StrategyMetric(
                name="Alternative",
                delay=alt_delay,
                delay_reduction=f"{duration - alt_delay}h",
                financial_exposure=alt_exposure,
                success_probability="81%"
            )
        ]

        projected_route = [
            ProjectedRouteStep(name="Mumbai", status="active"),
            ProjectedRouteStep(name="Mundra", status="recommended", tag="AI recommended"),
            ProjectedRouteStep(name="Frankfurt", status="standard")
        ]

        context = {
            "disruption": req.disruption_type,
            "duration_hours": duration,
            "severity": req.severity,
            "shipment_id": "SHP-1042",
            "recommended_route": "Mundra Port",
            "carrier": "Carrier B",
            "delay_reduction_hours": reduction
        }
        explanation = watsonx_service.generate_explanation("Simulate supply chain disruption response", context)

        return SimulationResponse(
            scenario_id=f"SIM-{duration}H-{req.severity.upper()}",
            disruption_type=req.disruption_type,
            duration_hours=duration,
            severity=req.severity,
            without_ai={
                "affected_shipments": 8,
                "critical_shipments": 3,
                "expected_delay": f"{duration}h",
                "financial_exposure": exposure_without
            },
            with_ai={
                "affected_shipments": 3,
                "critical_shipments": 1,
                "expected_delay": f"{ai_delay}h",
                "financial_exposure": exposure_with
            },
            comparison_data=comparison_data,
            projected_route=projected_route,
            delay_avoided_hours=reduction,
            exposure_reduction="$800K" if severity_lower == "critical" else "$560K",
            critical_shipments_protected=critical_prot,
            watsonx_explanation=explanation,
            recommended_fleet_asset="TRK-204",
            alternative_carrier="Carrier B"
        )
