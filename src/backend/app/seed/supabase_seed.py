"""
Supabase PostgreSQL CLI Seeding & Migration Utility
Executes table creation and seeds all 10 authoritative operational tables.
"""

import sys
import os
import argparse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.config import settings
from app.db.supabase import Base
from app.seed.seed_data import seed_database
import app.models  # Register all ORM models

def main():
    parser = argparse.ArgumentParser(description="ChainGuard AI Supabase PostgreSQL Seeder")
    parser.add_argument("--db-url", type=str, default=None, help="PostgreSQL connection string")
    args = parser.parse_args()

    db_url = args.db_url or os.environ.get("DATABASE_URL") or settings.DATABASE_URL or "sqlite:///./chainguard.db"
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    print("=" * 70)
    print("ChainGuard AI — Supabase PostgreSQL Schema Initialization & Seeder")
    print("=" * 70)

    engine_kwargs = {}
    if "sqlite" in db_url:
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        engine_kwargs["pool_pre_ping"] = True

    target_engine = create_engine(db_url, **engine_kwargs)
    print(f"Connecting to database: {target_engine.url.render_as_string(hide_password=True)}")

    print("Creating all relational tables (Shipments, Disruptions, Fleet, Containers, Alerts, Hubs, Recommendations)...")
    Base.metadata.create_all(bind=target_engine)
    print("All relational tables verified & created successfully!")

    print("Seeding database with operational logistics records...")
    TargetSession = sessionmaker(autocommit=False, autoflush=False, bind=target_engine)
    db = TargetSession()
    try:
        seed_database(db)
        print("Database seeded successfully with initial operational datasets.")
    finally:
        db.close()

    print("=" * 70)
    print("MIGRATION & SEEDING COMPLETE!")
    print("=" * 70)

if __name__ == "__main__":
    main()
