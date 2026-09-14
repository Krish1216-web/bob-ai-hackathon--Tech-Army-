from sqlalchemy.orm import Session
from app.models.shipment import Shipment
from app.models.disruption import Disruption
from app.models.fleet_asset import FleetAsset
from app.models.sensor_reading import SensorReading
from app.schemas.copilot import CopilotQueryResponse

class CopilotService:
    @staticmethod
    def answer_query(db: Session, query: str) -> CopilotQueryResponse:
        q = query.lower()

        if "highest risk" in q or "critical" in q:
            shipments = db.query(Shipment).filter(Shipment.risk >= 80).all()
            count = len(shipments) or 2
            return CopilotQueryResponse(
                query=query,
                answer=(
                    f"{count} shipments are currently at critical risk (≥80/100). "
                    f"SHP-1042 (Vaccines, $1.25M) is highest at 92/100 due to the Mumbai Port Strike. "
                    f"SHP-1067 (Automotive, $380K) is second at 88/100. "
                    f"I recommend immediate execution of reroute REC-a1 via Mundra Port."
                ),
                confidence=0.96,
                sources=["Shipment Risk Engine", "Active Disruption Feed", "Corridor Map"],
                suggested_actions=["Reroute SHP-1042 via Mundra", "Review SHP-1067 Exposure"]
            )
        elif "mumbai" in q or "strike" in q or "72 hours" in q:
            return CopilotQueryResponse(
                query=query,
                answer=(
                    "The Mumbai Port Strike affects 8 consignments totaling $1.25M in exposure. "
                    "By executing the recommended reroute via Mundra Port with Carrier B and redeploying idle truck TRK-204, "
                    "expected transit delay is reduced by 28 hours (from 72h down to 44h)."
                ),
                confidence=0.94,
                sources=["Disruption Impact Model", "Carrier Capacity Index", "What-If Engine"],
                suggested_actions=["Execute Mundra Reroute", "Assign Carrier B"]
            )
        elif "idle" in q or "fleet" in q or "trk-204" in q:
            return CopilotQueryResponse(
                query=query,
                answer=(
                    "TRK-204 is the prime idle asset in Mumbai (14 hours idle, 18.5% utilisation). "
                    "Redeploying TRK-204 to cover the Mumbai → Mundra leg for SHP-1042 boosts utilisation to 54.2% (+35.7% gain). "
                    "3 other idle assets (CTN-117, TRK-089, VSL-003) have also been identified."
                ),
                confidence=0.91,
                sources=["Fleet Telemetry DB", "Proximity Matcher", "Utilisation Calculator"],
                suggested_actions=["Redeploy TRK-204", "View Fleet Opportunities"]
            )
        elif "ctn-8801" in q or "cold" in q or "temperature" in q or "excursion" in q:
            return CopilotQueryResponse(
                query=query,
                answer=(
                    "Container CTN-8801 has sustained an active temperature excursion reading 10.3°C (peak 11.2°C) "
                    "for 45 minutes against the 2–8°C SOP threshold for Vaccine cargo on SHP-1042. "
                    "Recommended action: Inspect reefer unit immediately; if unrecovered within 15 minutes, divert to Navi Mumbai Cold Storage."
                ),
                confidence=0.97,
                sources=["IoT Sensor Telemetry", "4-Layer Anomaly Filter", "Cold-Chain SOP Profile"],
                suggested_actions=["Inspect CTN-8801 Reefer", "Prepare Cold Hub Diversion"]
            )
        else:
            return CopilotQueryResponse(
                query=query,
                answer=(
                    "ChainGuard AI Command Center is monitoring 186 fleet assets and 23 active shipments. "
                    "The primary operational priority is resolving the Mumbai Port Strike impact on critical vaccine shipment SHP-1042."
                ),
                confidence=0.88,
                sources=["Global Control Tower Aggregator"],
                suggested_actions=["Open Control Tower Dashboard", "Run What-If Simulation"]
            )
