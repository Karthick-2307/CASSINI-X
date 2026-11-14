import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import json
import logging
from app.db import SessionLocal
from app.models import Region, TerrainFeature, Planet, Dataset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_global_earth")

GLOBAL_EARTH_ANALOGS = [
    {
        "name": "Wadi Rum Desert & Canyons",
        "lat": 29.58,
        "lon": 35.42,
        "elevation_m": 1020.0,
        "slope_deg": 14.8,
        "roughness_m": 22.4,
        "citation": "NASA Mars Analog Research & Desert Studies (Aqaba, Jordan)",
        "description": "Iron-oxide-rich red sandstone massifs, canyons, and sandy valleys analogous to Martian sedimentary basins and Jezero delta.",
        "notes": "Red sandstone inselbergs and canyon systems."
    },
    {
        "name": "Richat Structure (Eye of the Sahara)",
        "lat": 21.12,
        "lon": -11.40,
        "elevation_m": 485.0,
        "slope_deg": 9.6,
        "roughness_m": 18.2,
        "citation": "ESA & USGS Planetary Surface Investigation (Adrar, Mauritania)",
        "description": "Circular eroded structural dome measuring 40 km across with concentric ridges resembling complex lunar and Martian impact craters.",
        "notes": "Deep circular uplift structure analogous to complex craters."
    },
    {
        "name": "Namib Sand Sea & Sossusvlei",
        "lat": -24.75,
        "lon": 15.30,
        "elevation_m": 570.0,
        "slope_deg": 16.2,
        "roughness_m": 8.5,
        "citation": "NASA Planetary Aeolian Laboratory / ESA Analog (Namibia)",
        "description": "Hyper-arid coastal sand sea with world's tallest linear and star dunes analogous to Martian aeolian dune fields in Gale and north polar ergs.",
        "notes": "Hyper-arid desert barchan and linear dunes."
    },
    {
        "name": "Danakil Depression & Dallol",
        "lat": 14.24,
        "lon": 40.30,
        "elevation_m": -125.0,
        "slope_deg": 3.8,
        "roughness_m": 12.1,
        "citation": "Europlanet Research Infrastructure Field Site (Afar, Ethiopia)",
        "description": "Tectonic rift sitting 125 m below sea level with hydrothermal sulfur chimneys and acid salt crusts analogous to early Martian hydrothermal springs.",
        "notes": "Hyper-saline, hyper-acidic hydrothermal depression."
    },
    {
        "name": "Death Valley & Badwater Basin",
        "lat": 36.25,
        "lon": -116.82,
        "elevation_m": -86.0,
        "slope_deg": 5.4,
        "roughness_m": 14.7,
        "citation": "NASA Mars Exploration Rover Field Test Site (California, USA)",
        "description": "Deepest subaerial depression in North America featuring alluvial fan deposits and polygonal salt crusts analogous to Gale Crater floor.",
        "notes": "Hyper-arid desert depression and alluvial fans."
    },
    {
        "name": "Salar de Uyuni & Altiplano",
        "lat": -20.30,
        "lon": -67.60,
        "elevation_m": 3656.0,
        "slope_deg": 1.2,
        "roughness_m": 4.1,
        "citation": "NASA Mars Analog High-Altitude Expedition (Potosi, Bolivia)",
        "description": "Vast high-altitude salt flat at 3,656 m elevation with polygonal salt crusts and paleolake evaporites analogous to Martian chloride deposits.",
        "notes": "High-altitude evaporite plain."
    },
    {
        "name": "Qaidam Basin Yardangs",
        "lat": 37.80,
        "lon": 93.40,
        "elevation_m": 2800.0,
        "slope_deg": 12.4,
        "roughness_m": 16.8,
        "citation": "Chinese Planetary Science Society / Mars Analog (Qinghai, China)",
        "description": "Extensive wind-carved yardang fields and desiccated playa deposits analogous to Martian Medusae Fossae aeolian erosion features.",
        "notes": "Hyper-arid wind-sculpted yardang field."
    },
    {
        "name": "Nördlinger Ries Impact Crater",
        "lat": 48.88,
        "lon": 10.50,
        "elevation_m": 430.0,
        "slope_deg": 6.8,
        "roughness_m": 19.5,
        "citation": "NASA Apollo Astronaut Geology Training & ESA Analog (Bavaria, Germany)",
        "description": "Mid-Miocene meteorite impact crater measuring 24 km across with preserved ejecta blanket, shatter cones, and suevite impact melt breccia.",
        "notes": "Complex meteorite impact crater structure."
    },
    {
        "name": "Askja Caldera & Holuhraun",
        "lat": 65.03,
        "lon": -16.75,
        "elevation_m": 1050.0,
        "slope_deg": 11.2,
        "roughness_m": 24.6,
        "citation": "NASA Apollo Astronaut Field Training / Lunar & Planetary Analog (Iceland)",
        "description": "Complex volcanic caldera nested within basaltic lava desert, used for Apollo lunar and Mars rover mobility testing.",
        "notes": "Basaltic volcanic caldera and tephra plains."
    },
    {
        "name": "Nullarbor Plain",
        "lat": -31.00,
        "lon": 128.50,
        "elevation_m": 140.0,
        "slope_deg": 1.5,
        "roughness_m": 5.8,
        "citation": "Planetary Science Institute / Desert Fireball Network (Western Australia)",
        "description": "Flat, arid, treeless limestone karst plain with exceptional meteorite preservation and low relief analogous to smooth lunar mare.",
        "notes": "Arid flat limestone plain with low relief."
    }
]

def run():
    db = SessionLocal()
    earth = db.query(Planet).filter(Planet.name == "Earth").first()
    if not earth:
        print("Earth planet record not found.")
        return

    dataset = db.query(Dataset).filter(Dataset.name.like("%SRTM%")).first()
    ds_id = dataset.id if dataset else None

    added = 0
    for site in GLOBAL_EARTH_ANALOGS:
        existing = db.query(Region).filter(Region.name == site["name"]).first()
        if not existing:
            reg = Region(
                planet_id=earth.id,
                name=site["name"],
                lat=site["lat"],
                lon=site["lon"],
                elevation_m=site["elevation_m"],
                slope_deg=site["slope_deg"],
                roughness_m=site["roughness_m"],
                source_dataset_id=ds_id,
                description=site["description"],
                citation=site["citation"],
                notes=site["notes"],
                is_curated=True
            )
            db.add(reg)
            db.commit()
            db.refresh(reg)

            # Add primary grid cell feature so similarity engine compares against it
            tf = TerrainFeature(
                region_id=reg.id,
                scale_m=500.0,
                window_px=5,
                cell_index=0,
                elevation_relative=0.0,
                slope_deg=site["slope_deg"],
                roughness_m=site["roughness_m"],
                valid_fraction=1.0,
                native_res_m=30.0,
                kind="measured",
                processing_params_json=json.dumps({"source": "Global SRTM/Copernicus Terrain Synthesis"})
            )
            db.add(tf)
            db.commit()
            added += 1
            print(f"Added global analog: {site['name']} ({site['lat']}, {site['lon']})")
        else:
            print(f"Already exists: {site['name']}")

    print(f"Successfully added {added} new global Earth analog regions!")

if __name__ == "__main__":
    run()
