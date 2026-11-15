import urllib.request

SATELLITE_IMAGES = {
    "namib": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Sossusvlei_satellite.jpg/1280px-Sossusvlei_satellite.jpg",
    "richat": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Richat_Structure_ISS030-E-12548.jpg/1280px-Richat_Structure_ISS030-E-12548.jpg",
    "lanzarote": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Lanzarote_Sentinel-2.jpg/1280px-Lanzarote_Sentinel-2.jpg",
    "atacama": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Atacama_Large_Millimeter_Array_%28ALMA%29_-_NASA_Earth_Observatory.jpg/1280px-Atacama_Large_Millimeter_Array_%28ALMA%29_-_NASA_Earth_Observatory.jpg",
    "haughton": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Haughton_Crater_Devon_Island_NASA.jpg/1280px-Haughton_Crater_Devon_Island_NASA.jpg",
    "death_valley": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Death_Valley_NASA.jpg/1280px-Death_Valley_NASA.jpg",
    "salar_de_uyuni": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Salar_de_Uyuni%2C_Bolivia_from_space.jpg/1280px-Salar_de_Uyuni%2C_Bolivia_from_space.jpg",
    "askja": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Askja_caldera.jpg/1280px-Askja_caldera.jpg",
    "ries": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Noerdlinger_Ries_from_space.jpg/1280px-Noerdlinger_Ries_from_space.jpg"
}

for name, url in SATELLITE_IMAGES.items():
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"OK ({resp.status}): {name} -> {len(resp.read())} bytes")
    except Exception as e:
        print(f"FAILED: {name} -> {e}")
