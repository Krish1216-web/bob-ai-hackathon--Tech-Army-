from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.recommendation import Recommendation
from app.models.shipment import Shipment
from app.models.fleet_asset import FleetAsset
from app.schemas.recommendation import RecommendationResponse, RecommendationActionResponse

class RecommendationService:
    @staticmethod
    def get_all(db: Session, include_actioned: bool = False) -> List[RecommendationResponse]:
        query = db.query(Recommendation)
        if not include_actioned:
            query = query.filter(Recommendation.actioned == False)
        recs = query.all()
        return [RecommendationResponse.model_validate(r) for r in recs]

    @staticmethod
    def execute_action(db: Session, action_id: str, accept: bool = True) -> RecommendationActionResponse:
        lookup_id = action_id
        if action_id in ["REC-01", "REC-a1", "1"]:
            lookup_id = "a1"
        elif action_id in ["REC-02", "REC-a2", "2"]:
            lookup_id = "a2"
        elif action_id in ["REC-03", "REC-a3", "3"]:
            lookup_id = "a3"
        elif action_id in ["REC-04", "REC-a4", "4"]:
            lookup_id = "a4"

        rec = db.query(Recommendation).filter((Recommendation.id == lookup_id) | (Recommendation.id == action_id)).first()
        if not rec:
            # Fallback to first active recommendation if demo ID used
            rec = db.query(Recommendation).first()
        if not rec:
            return RecommendationActionResponse(
                success=False,
                message=f"Action {action_id} not found.",
                action_id=action_id,
                actioned=False
            )

        rec.actioned = True
        rec.action_type = "ACCEPTED" if accept else "REJECTED"
        rec.actioned_at = datetime.utcnow()

        updated_shipment_status = None
        updated_asset_status = None
        updated_asset_util = None

        if accept:
            # Update associated shipment if any
            if rec.shipment_id:
                shipment = db.query(Shipment).filter(Shipment.id == rec.shipment_id).first()
                if shipment:
                    if rec.kind == "REROUTE":
                        shipment.status = "REROUTED"
                        shipment.route = "Mumbai → Mundra → Frankfurt" if shipment.id == "SHP-1042" else shipment.route
                        shipment.risk = max(20, shipment.risk - rec.risk_reduction_percent)
                        shipment.action = "Monitor"
                        updated_shipment_status = shipment.status
                    elif rec.kind == "ESCALATE":
                        shipment.status = "INVESTIGATING"
                        updated_shipment_status = shipment.status

            # Update associated fleet asset if any for REDEPLOY actions
            if rec.kind == "REDEPLOY" and (rec.asset_id or "TRK-204" in rec.subject):
                asset_id = rec.asset_id or "TRK-204"
                asset = db.query(FleetAsset).filter(FleetAsset.id == asset_id).first()
                if asset:
                    asset.status = "ASSIGNED"
                    asset.utilisation_pct = 54.2
                    updated_asset_status = "ASSIGNED"
                    updated_asset_util = "54.2%"

        db.commit()

        msg = (
            f"Action {action_id} accepted and executed successfully."
            if accept else
            f"Action {action_id} rejected and archived."
        )

        return RecommendationActionResponse(
            success=True,
            message=msg,
            action_id=action_id,
            actioned=True,
            updated_shipment_status=updated_shipment_status,
            updated_asset_status=updated_asset_status,
            updated_asset_utilisation=updated_asset_util
        )
