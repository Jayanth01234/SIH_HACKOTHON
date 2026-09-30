import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.database.models import Base, StationRecord, utc_now

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).resolve().parent.parent.parent / "polaris.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initializes tables and seeds initial station metadata."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        stations = [
            {
                "id": "Maitri",
                "name": "Maitri Research Station",
                "country": "India",
                "commissioned": 1989,
                "region": "Schirmacher Oasis, Queen Maud Land, East Antarctica",
                "latitude": -70.767,
                "longitude": 11.733,
                "elevation_meters": 117.0,
                "data_source": "NCPOR / NPDC & Live Sensor Simulation",
            },
            {
                "id": "Bharati",
                "name": "Bharati Research Station",
                "country": "India",
                "commissioned": 2012,
                "region": "Larsemann Hills, Princess Elizabeth Land, East Antarctica",
                "latitude": -69.407,
                "longitude": 76.190,
                "elevation_meters": 35.0,
                "data_source": "NCPOR / NPDC & Live Sensor Simulation",
            },
        ]
        for s in stations:
            existing = db.query(StationRecord).filter_by(id=s["id"]).first()
            if not existing:
                db.add(StationRecord(**s))
        db.commit()
        logger.info("Initialized POLARIS SQLite database and verified station records.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()


def get_db():
    """FastAPI dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
