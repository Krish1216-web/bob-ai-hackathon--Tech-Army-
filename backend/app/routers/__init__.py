from app.routers.dashboard import router as dashboard_router
from app.routers.shipments import router as shipments_router
from app.routers.disruptions import router as disruptions_router
from app.routers.fleet import router as fleet_router
from app.routers.cold_chain import router as cold_chain_router
from app.routers.recommendations import router as recommendations_router
from app.routers.simulations import router as simulations_router
from app.routers.copilot import router as copilot_router

__all__ = [
    "dashboard_router",
    "shipments_router",
    "disruptions_router",
    "fleet_router",
    "cold_chain_router",
    "recommendations_router",
    "simulations_router",
    "copilot_router"
]
