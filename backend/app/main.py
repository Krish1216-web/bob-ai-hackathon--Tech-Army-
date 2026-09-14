from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed.seed_data import seed_database
from app.routers import (
    dashboard_router,
    shipments_router,
    disruptions_router,
    fleet_router,
    cold_chain_router,
    recommendations_router,
    simulations_router,
    copilot_router
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Auto-seed realistic demo data
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="L2 Supply Chain Disruption Assistant & Fleet Utilisation Control Tower",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(shipments_router, prefix=settings.API_V1_STR)
app.include_router(disruptions_router, prefix=settings.API_V1_STR)
app.include_router(fleet_router, prefix=settings.API_V1_STR)
app.include_router(cold_chain_router, prefix=settings.API_V1_STR)
app.include_router(recommendations_router, prefix=settings.API_V1_STR)
app.include_router(simulations_router, prefix=settings.API_V1_STR)
app.include_router(copilot_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "tagline": "DETECT → UNDERSTAND → RECOMMEND → ACT → MEASURE IMPACT",
        "docs": "/docs"
    }

@app.get("/api/health")
def health():
    db_status = "supabase_postgresql_connected" if "postgresql" in str(engine.url) else "persistent_database_connected"
    return {
        "status": "healthy",
        "version": "1.0.0",
        "ai_engine": "online",
        "database": db_status
    }
