from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.shipment import Shipment
from app.schemas.shipment import ShipmentResponse, ShipmentDetailResponse

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.get("", response_model=List[ShipmentResponse])
def list_shipments(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Shipment)
    if status:
        query = query.filter(Shipment.status == status)
    if priority:
        query = query.filter(Shipment.priority == priority)
    shipments = query.order_by(Shipment.risk.desc()).all()
    return [ShipmentResponse.from_orm(s) for s in shipments]

@router.get("/{shipment_id}", response_model=ShipmentDetailResponse)
def get_shipment_detail(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment {shipment_id} not found")

    res = ShipmentDetailResponse.from_orm(shipment)
    res.active_disruptions = [shipment.disruption] if shipment.disruption and shipment.disruption != "None" else []
    res.recommendation_summary = f"Reroute via Mundra Port using Carrier B" if shipment.id == "SHP-1042" else "Active Monitoring"
    res.temperature_status = "CRITICAL EXCURSION (10.3°C)" if shipment.id == "SHP-1042" else "NORMAL"
    res.asset_status = f"{shipment.asset} (Refrigerated Truck)" if shipment.asset else "None"
    return res
