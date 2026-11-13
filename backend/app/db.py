import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./astrax.db")

# SQLite requires check_same_thread=False when accessed from multiple threads in FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    seed_factual_planets()


def seed_factual_planets():
    from app.models import Planet
    db = SessionLocal()
    try:
        # Seed ONLY factual reference planetary data if empty
        if db.query(Planet).count() == 0:
            factual_planets = [
                Planet(
                    name="Earth",
                    mean_radius_m=6371008.8,
                    gravity_ms2=9.80665,
                    description="Reference terrestrial environment for analog identification."
                ),
                Planet(
                    name="Moon",
                    mean_radius_m=1737400.0,
                    gravity_ms2=1.62,
                    description="Lunar body featuring impact craters, regolith, and basaltic maria."
                ),
                Planet(
                    name="Mars",
                    mean_radius_m=3389500.0,
                    gravity_ms2=3.71,
                    description="Martian body featuring shield volcanoes, canyon networks, and impact basins."
                )
            ]
            db.add_all(factual_planets)
            db.commit()
    finally:
        db.close()
