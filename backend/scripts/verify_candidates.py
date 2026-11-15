import urllib.request
import json

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/analysis/run',
    data=json.dumps({
        'target_region_id': 2,
        'features': ['elevation_relative', 'slope_deg', 'roughness_m'],
        'threshold': 0.0,
        'top_k': 10
    }).encode(),
    headers={'Content-Type': 'application/json'}
)
res = urllib.request.urlopen(req)
data = json.loads(res.read())
aid = data['analysis_id']

res = urllib.request.urlopen(f'http://127.0.0.1:8000/api/analysis/{aid}')
detail = json.loads(res.read())
print(f"Analysis ID {aid} - Total candidates: {len(detail['candidates'])}")
for i, c in enumerate(detail['candidates']):
    print(f"{i+1}. {c['location_name']} (Lat: {c['lat']:.3f}, Lon: {c['lon']:.3f}) - Similarity: {c['similarity']*100:.1f}%, Confidence: {c['confidence']*100:.1f}%")
