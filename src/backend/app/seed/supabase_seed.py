"""
Supabase PostgreSQL CLI Seeding & Migration Utility
Executes table creation (or SQL DDL) and seeds all 10 authoritative tables.
"""

import sys
import os

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.supabase import engine, Base, SessionLocal
from app.seed.seed_data import seed_database
import app.models # Register all models

def main():
    print("=" * 70)
    print("ChainGuard AI — Supabase PostgreSQL Schema Initialization & Seeder")
    print("=" * 70)
    print(f"Connecting to database engine: {engine.url.render_as_string(hide_password=True)}")

    print("Creating all relational tables...")
    Base.metadata.create_all(bind=engine)
    print("All 10 tables created or verified successfully!")

    print("Seeding database with operational hackathon records...")
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database seeded successfully with shipments, disruptions, fleet, cold-chain, and recommendations.")
    finally:
        db.close()

    print("=" * 70)
    print("MIGRATION & SEEDING COMPLETE!")
    print("=" * 70)

if __name__ == "__main__":
    main()
