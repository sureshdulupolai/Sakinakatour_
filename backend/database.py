import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import settings
from models import Base

# Database engine initialized dynamically from environment config
db_url = settings.DATABASE_URL
connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False
)

# Enable WAL mode and foreign keys for high performance SQLite concurrency
if "sqlite" in db_url:
    with engine.connect() as conn:
        conn.exec_driver_sql("PRAGMA journal_mode=WAL;")
        conn.exec_driver_sql("PRAGMA synchronous=NORMAL;")
        conn.exec_driver_sql("PRAGMA foreign_keys=ON;")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    # Safe migration for new columns across tables
    with engine.connect() as conn:
        try:
            from sqlalchemy import inspect
            insp = inspect(engine)
            
            # 1. Buses table migrations
            if 'buses' in insp.get_table_names():
                existing_cols = [c['name'] for c in insp.get_columns('buses')]
                if 'has_back_row' not in existing_cols:
                    conn.exec_driver_sql("ALTER TABLE buses ADD COLUMN has_back_row BOOLEAN DEFAULT 1;")
                if 'numbering_pattern' not in existing_cols:
                    conn.exec_driver_sql("ALTER TABLE buses ADD COLUMN numbering_pattern VARCHAR(50) DEFAULT 'continuous_rl';")
                if 'operator_id' not in existing_cols:
                    conn.exec_driver_sql("ALTER TABLE buses ADD COLUMN operator_id INTEGER DEFAULT NULL;")

            # 2. Tour trips table migrations
            if 'tour_trips' in insp.get_table_names():
                trip_cols = [c['name'] for c in insp.get_columns('tour_trips')]
                if 'operator_id' not in trip_cols:
                    conn.exec_driver_sql("ALTER TABLE tour_trips ADD COLUMN operator_id INTEGER DEFAULT NULL;")

            conn.commit()
        except Exception as e:
            print("DB Migration notice:", e)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
