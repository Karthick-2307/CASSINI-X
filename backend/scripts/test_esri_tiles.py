import urllib.request
import math

def get_tile(lat, lon, zoom=12):
    x = int(math.floor(((lon + 180) / 360) * math.pow(2, zoom)))
    lat_rad = math.radians(lat)
    y = int(math.floor(((1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2) * math.pow(2, zoom)))
    url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{y}/{x}"
    req = urllib.request.Request(url, headers={"User-Agent": "ASTRA-X/1.0"})
    resp = urllib.request.urlopen(req)
    return len(resp.read()), url

# Test Namib (-24.75, 15.30) and Lanzarote (28.91, -13.68)
bytes_len, url = get_tile(-24.75, 15.30, 12)
print(f"Namib Sand Sea Real Satellite Tile: {bytes_len} bytes from {url}")

bytes_len, url = get_tile(28.91, -13.68, 12)
print(f"Lanzarote Volcanic Real Satellite Tile: {bytes_len} bytes from {url}")
