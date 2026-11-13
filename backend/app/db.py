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
    seed_factual_benchmarks()


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


def seed_factual_benchmarks():
    from app.models import BenchmarkSite, Planet
    db = SessionLocal()
    try:
        if db.query(BenchmarkSite).count() == 0:
            mars = db.query(Planet).filter(Planet.name == "Mars").first()
            moon = db.query(Planet).filter(Planet.name == "Moon").first()
            if mars and moon:
                benchmarks = [
                    BenchmarkSite(
                        name="Devon Island (Haughton Crater)",
                        target_region_name="Jezero Crater Floor & Delta",
                        earth_analog_name="Devon Island, Nunavut, Canada",
                        planet_id=mars.id,
                        lat=75.38,
                        lon=-89.67,
                        known_analog_type="Mars polar desert and impact geology",
                        description="Haughton impact structure set in a cold, hyper-arid polar desert environment."
                    ),
                    BenchmarkSite(
                        name="Atacama Desert (Yungay)",
                        target_region_name="Jezero Crater Floor & Delta",
                        earth_analog_name="Atacama Desert, Chile",
                        planet_id=mars.id,
                        lat=-24.08,
                        lon=-69.95,
                        known_analog_type="Hyper-arid Mars soil and dry environment",
                        description="Extreme arid terrestrial environment with low organic matter resembling Martian soils."
                    ),
                    BenchmarkSite(
                        name="Lanzarote Volcanic Field (Canaries)",
                        target_region_name="Mare Tranquillitatis (Apollo 11 Basin)",
                        earth_analog_name="Lanzarote Volcanic Field",
                        planet_id=moon.id,
                        lat=29.03,
                        lon=-13.63,
                        known_analog_type="Lunar and Martian basaltic lava tubes and volcanic terrain",
                        description="Basaltic lava flows, volcanic cones, and lava tubes analogous to lunar and martian volcanic features."
                    ),
                    BenchmarkSite(
                        name="Mauna Kea & Mauna Loa",
                        target_region_name="Mare Tranquillitatis (Apollo 11 Basin)",
                        earth_analog_name="Mauna Kea, Hawaii, USA",
                        planet_id=moon.id,
                        lat=19.82,
                        lon=-155.47,
                        known_analog_type="Lunar regolith and basaltic shield terrain",
                        description="Hawaiian basaltic tephra and weathered volcanic materials used as standard lunar simulant sources."
                    ),
                    BenchmarkSite(
                        name="Svalbard Archipelago",
                        target_region_name="Jezero Crater Floor & Delta",
                        earth_analog_name="Svalbard, Norway",
                        planet_id=mars.id,
                        lat=78.22,
                        lon=15.65,
                        known_analog_type="Mars permafrost, hydrothermal, and arctic terrain",
                        description="Arctic polygonal patterned ground, pingos, and permafrost features analogous to Martian mid-latitude terrain."
                    ),
                    BenchmarkSite(
                        name="McMurdo Dry Valleys",
                        target_region_name="Jezero Crater Floor & Delta",
                        earth_analog_name="McMurdo Dry Valleys, Antarctica",
                        planet_id=mars.id,
                        lat=-77.50,
                        lon=162.50,
                        known_analog_type="Mars cold-arid permafrost and Antarctic desert",
                        description="Cold desert environment with extreme dryness, patterned ground, and subsurface ice."
                    ),
                ]
                db.add_all(benchmarks)
                db.commit()
    finally:
        db.close()

