import io
import base64
import json
import urllib.request
from PIL import Image, ImageDraw

# Create synthetic 64x64 crater image
img = Image.new("L", (64, 64), color=120)
draw = ImageDraw.Draw(img)
draw.ellipse([14, 14, 50, 50], outline=240, width=3)
draw.ellipse([22, 22, 42, 42], fill=40)

buf = io.BytesIO()
img.save(buf, format="PNG")
b64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")

payload = {
    "image_base64": b64,
    "filename": "test_crater_mro.png",
    "target_body": "Mars",
    "ground_resolution_m": 6.0
}

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/analysis/search-by-image",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print("Response keys:", list(res.keys()))
        print(f"Total Candidates: {len(res.get('candidates', []))}")
        for c in res.get('candidates', [])[:5]:
            print(f" - #{c.get('rank', 0)} {c.get('location_name')} (Sim: {c.get('similarity', 0):.1f}%, Conf: {c.get('confidence', 0):.1f}%)")
except Exception as e:
    print(f"FAILED: {e}")
