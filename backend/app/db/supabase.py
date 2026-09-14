"""
ChainGuard AI — Supabase PostgreSQL Database Layer
Provides PostgreSQL SQLAlchemy engine with SSL pooling, session lifecycle, and Supabase REST client abstraction.
"""

import logging
from typing import Optional, Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger("chainguard.db")

# -----------------------------------------------------------------------------
# 1. SQLAlchemy Engine Configuration (PostgreSQL / Supabase / SQLite)
# -----------------------------------------------------------------------------
db_url = settings.DATABASE_URL or "sqlite:///./chainguard.db"

# Format async / postgresql scheme if needed
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine_kwargs = {}
if "sqlite" in db_url:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL / Supabase connection pooling settings
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(db_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """FastAPI database dependency provider."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------------------------------------------------------
# 2. Supabase REST Client Initializer (Optional / Direct API access)
# -----------------------------------------------------------------------------
_supabase_client = None

def get_supabase_client():
    """Initializes and returns the Supabase client if configured."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if settings.SUPABASE_URL and (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY):
        try:
            from supabase import create_client, Client
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
            _supabase_client = create_client(settings.SUPABASE_URL, key)
            logger.info("Connected to Supabase REST API successfully.")
            return _supabase_client
        except Exception as e:
            logger.warning(f"Could not initialize Supabase client: {e}")
            return None
    return None
