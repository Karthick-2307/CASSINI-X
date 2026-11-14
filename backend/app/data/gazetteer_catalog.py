"""
Curated planetary gazetteer catalog across Mars, Moon, and Earth.
Contains accurate IAU nomenclature, USGS coordinates, diameter, elevation,
and representative topographic characteristics (slope, roughness).
"""

from typing import List, Dict, Any

PLANETARY_GAZETTEER_CATALOG: List[Dict[str, Any]] = [
    # --- MARS ---
    {
        "id": "mars-jezero", "name": "Jezero Crater Floor & Delta", "planet": "Mars",
        "feature_type": "Impact Crater / Delta", "lat": 18.38, "lon": 77.58,
        "diameter_km": 49.0, "elevation_approx_m": -2500.0, "slope_deg": 6.8, "roughness_m": 1.45,
        "description": "Perseverance rover landing site featuring ancient clay-bearing river delta fan.",
        "region_key": "Jezero Crater Floor & Delta",
    },
    {
        "id": "mars-olympus", "name": "Olympus Mons Caldera Rim", "planet": "Mars",
        "feature_type": "Shield Volcano / Caldera", "lat": 18.65, "lon": -133.80,
        "diameter_km": 624.0, "elevation_approx_m": 21287.0, "slope_deg": 18.4, "roughness_m": 4.10,
        "description": "Summit caldera complex of the solar system's tallest volcano, rising 21 km.",
        "region_key": "Olympus Mons Caldera Rim",
    },
    {
        "id": "mars-gale", "name": "Gale Crater & Mount Sharp", "planet": "Mars",
        "feature_type": "Impact Crater / Mound", "lat": -5.40, "lon": 137.80,
        "diameter_km": 154.0, "elevation_approx_m": -4500.0, "slope_deg": 11.2, "roughness_m": 2.30,
        "description": "Curiosity rover study site with a 5.5 km central sedimentary mound.",
        "region_key": "Gale Crater & Mount Sharp",
    },
    {
        "id": "mars-valles-marineris", "name": "Valles Marineris (Candor Chasma)", "planet": "Mars",
        "feature_type": "Canyon / Chasma", "lat": -14.00, "lon": -59.20,
        "diameter_km": 4000.0, "elevation_approx_m": -3000.0, "slope_deg": 24.5, "roughness_m": 5.80,
        "description": "Vast tectonic canyon network stretching over 4,000 km with depths up to 7 km.",
        "region_key": "Valles Marineris (Candor Chasma)",
    },
    {
        "id": "mars-gusev", "name": "Gusev Crater (Columbia Hills)", "planet": "Mars",
        "feature_type": "Impact Basin", "lat": -14.57, "lon": 175.47,
        "diameter_km": 166.0, "elevation_approx_m": -1900.0, "slope_deg": 7.5, "roughness_m": 1.60,
        "description": "Spirit rover exploration site featuring basaltic plains and ancient hydrothermal deposits.",
        "region_key": "Gusev Crater (Columbia Hills)",
    },
    {
        "id": "mars-meridiani", "name": "Meridiani Planum", "planet": "Mars",
        "feature_type": "Plain / Evaporite", "lat": -0.20, "lon": -2.50,
        "diameter_km": 127.0, "elevation_approx_m": -1400.0, "slope_deg": 2.1, "roughness_m": 0.65,
        "description": "Opportunity rover landing site characterized by hematite spherules and sulfate bedrock.",
        "region_key": "Meridiani Planum",
    },
    {
        "id": "mars-elysium", "name": "Elysium Planitia", "planet": "Mars",
        "feature_type": "Volcanic Plain", "lat": 3.00, "lon": 154.70,
        "diameter_km": 3000.0, "elevation_approx_m": -2600.0, "slope_deg": 3.4, "roughness_m": 0.90,
        "description": "Smooth volcanic plain and site of NASA's InSight seismological lander.",
        "region_key": "Elysium Planitia",
    },
    {
        "id": "mars-hellas", "name": "Hellas Planitia Basin", "planet": "Mars",
        "feature_type": "Impact Basin", "lat": -42.70, "lon": 70.00,
        "diameter_km": 2300.0, "elevation_approx_m": -7152.0, "slope_deg": 8.9, "roughness_m": 1.80,
        "description": "Deepest impact structure on Mars, with highest atmospheric surface pressure.",
        "region_key": "Hellas Planitia Basin",
    },
    {
        "id": "mars-korolev", "name": "Korolev Crater (Water Ice Deposit)", "planet": "Mars",
        "feature_type": "Polar Impact Crater / Glacier", "lat": 72.77, "lon": 164.58,
        "diameter_km": 81.4, "elevation_approx_m": -1900.0, "slope_deg": 9.2, "roughness_m": 1.75,
        "description": "Northern polar impact crater containing a 1.8 km thick cold-trap mound of water ice.",
        "region_key": "Korolev Crater (Water Ice Deposit)",
    },
    # --- MOON ---
    {
        "id": "moon-tranquillitatis", "name": "Mare Tranquillitatis (Apollo 11 Basin)", "planet": "Moon",
        "feature_type": "Basaltic Lunar Mare", "lat": 8.50, "lon": 31.40,
        "diameter_km": 873.0, "elevation_approx_m": -1200.0, "slope_deg": 3.8, "roughness_m": 0.75,
        "description": "Apollo 11 landing site; ancient titanium-rich basaltic lava plain.",
        "region_key": "Mare Tranquillitatis (Apollo 11 Basin)",
    },
    {
        "id": "moon-shackleton", "name": "Shackleton Crater & South Pole Rim", "planet": "Moon",
        "feature_type": "Polar Impact Crater", "lat": -89.70, "lon": 0.00,
        "diameter_km": 21.0, "elevation_approx_m": -2000.0, "slope_deg": 19.8, "roughness_m": 3.40,
        "description": "NASA Artemis target crater with permanently shadowed interior cold-traps harboring volatile water ice.",
        "region_key": "Shackleton Crater & South Pole Rim",
    },
    {
        "id": "moon-tycho", "name": "Tycho Crater", "planet": "Moon",
        "feature_type": "Complex Impact Crater", "lat": -43.31, "lon": -11.36,
        "diameter_km": 85.0, "elevation_approx_m": -4800.0, "slope_deg": 22.4, "roughness_m": 4.60,
        "description": "Prominent young lunar impact crater (108 Ma) with steep terraced walls and bright rays.",
        "region_key": "Tycho Crater",
    },
    {
        "id": "moon-copernicus", "name": "Copernicus Crater", "planet": "Moon",
        "feature_type": "Complex Impact Crater", "lat": 9.62, "lon": -20.08,
        "diameter_km": 93.0, "elevation_approx_m": -3800.0, "slope_deg": 18.6, "roughness_m": 3.90,
        "description": "Benchmark complex impact crater in eastern Oceanus Procellarum with multiple central peaks.",
        "region_key": "Copernicus Crater",
    },
    {
        "id": "moon-oceanus-procellarum", "name": "Oceanus Procellarum (Chang'e 5 Basin)", "planet": "Moon",
        "feature_type": "Lunar Mare / Basin", "lat": 18.40, "lon": -57.40,
        "diameter_km": 2568.0, "elevation_approx_m": -2100.0, "slope_deg": 2.9, "roughness_m": 0.60,
        "description": "Vast lunar maria region on the western edge of the near side with young basaltic volcanic flows.",
        "region_key": "Oceanus Procellarum (Chang'e 5 Basin)",
    },
    {
        "id": "moon-aristarchus", "name": "Aristarchus Plateau", "planet": "Moon",
        "feature_type": "Pyroclastic Plateau / Crater", "lat": 23.70, "lon": -47.40,
        "diameter_km": 40.0, "elevation_approx_m": -3000.0, "slope_deg": 14.2, "roughness_m": 2.80,
        "description": "Brightest major geological formation on the Moon, surrounded by dark volcanic pyroclastics.",
        "region_key": "Aristarchus Plateau",
    },
    {
        "id": "moon-hadley-rille", "name": "Hadley Rille & Apennine Mountains", "planet": "Moon",
        "feature_type": "Sinuous Rille / Mountain Range", "lat": 26.13, "lon": 3.63,
        "diameter_km": 80.0, "elevation_approx_m": 2500.0, "slope_deg": 16.5, "roughness_m": 3.10,
        "description": "Apollo 15 landing site along a collapsed lava tube canyon bordering Montes Apenninus.",
        "region_key": "Hadley Rille & Apennine Mountains",
    },
    # --- EARTH ANALOGS ---
    {
        "id": "earth-lanzarote", "name": "Lanzarote Volcanic Field", "planet": "Earth",
        "feature_type": "Volcanic Field / Lava Tubes", "lat": 29.05, "lon": -13.65,
        "diameter_km": 35.0, "elevation_approx_m": 250.0, "slope_deg": 12.5, "roughness_m": 2.10,
        "description": "Canary Islands basaltic flows, hornitos, and lava tubes analogous to lunar/martian terrain.",
        "region_key": "Lanzarote Volcanic Field",
    },
    {
        "id": "earth-atacama", "name": "Atacama Yungay Basin", "planet": "Earth",
        "feature_type": "Hyper-Arid Desert", "lat": -24.00, "lon": -69.50,
        "diameter_km": 60.0, "elevation_approx_m": 1050.0, "slope_deg": 4.1, "roughness_m": 0.85,
        "description": "Hyper-arid desert soil core with nitrate/perchlorate evaporites analogous to dry martian regolith.",
        "region_key": "Atacama Yungay Basin",
    },
    {
        "id": "earth-hawaii", "name": "Mauna Kea & Kilauea Flanks", "planet": "Earth",
        "feature_type": "Basaltic Shield Volcano", "lat": 19.82, "lon": -155.47,
        "diameter_km": 50.0, "elevation_approx_m": 4205.0, "slope_deg": 14.8, "roughness_m": 3.20,
        "description": "High-altitude basaltic cinder cones and tephra deposits used as Apollo/Artemis simulant sites.",
        "region_key": "Mauna Kea & Kilauea Flanks",
    },
    {
        "id": "earth-haughton", "name": "Haughton Impact Structure (Devon Island)", "planet": "Earth",
        "feature_type": "Polar Impact Crater", "lat": 75.38, "lon": -89.67,
        "diameter_km": 23.0, "elevation_approx_m": 200.0, "slope_deg": 13.6, "roughness_m": 2.70,
        "description": "Canadian High Arctic impact structure in permafrost, standard Mars/Moon exploration analog.",
        "region_key": "Haughton Impact Structure (Devon Island)",
    },
    {
        "id": "earth-meteor-crater", "name": "Meteor Crater (Barringer, Arizona)", "planet": "Earth",
        "feature_type": "Simple Impact Crater", "lat": 35.03, "lon": -111.02,
        "diameter_km": 1.2, "elevation_approx_m": 1740.0, "slope_deg": 21.0, "roughness_m": 3.80,
        "description": "Best preserved simple meteorite crater on Earth, classical test ground for impact mechanics.",
        "region_key": "Meteor Crater (Barringer, Arizona)",
    },
    {
        "id": "earth-death-valley", "name": "Death Valley (Badwater Salt Flats)", "planet": "Earth",
        "feature_type": "Playa / Evaporite Basin", "lat": 36.25, "lon": -116.82,
        "diameter_km": 40.0, "elevation_approx_m": -86.0, "slope_deg": 1.9, "roughness_m": 0.55,
        "description": "Hyper-arid salt polygon basin analogous to evaporated martian paleolake beds.",
        "region_key": "Death Valley (Badwater Salt Flats)",
    },
]
