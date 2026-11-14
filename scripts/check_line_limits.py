import os

base_dir = r"C:\Users\DELL\.gemini\antigravity\scratch\astra-x"
subdirs = ["backend/app", "backend/tests", "frontend/src"]
exceeded = []

for sub in subdirs:
    full_path = os.path.join(base_dir, sub)
    for root, _, files in os.walk(full_path):
        for f in files:
            if f.endswith((".py", ".ts", ".tsx", ".js", ".jsx")):
                p = os.path.join(root, f)
                with open(p, "r", encoding="utf-8") as fh:
                    lines = len(fh.readlines())
                if lines > 300:
                    exceeded.append((lines, p))

if exceeded:
    print(f"FOUND {len(exceeded)} FILES EXCEEDING 300 LINES:")
    for lines, path in sorted(exceeded, reverse=True):
        print(f"  {lines} lines: {path}")
    exit(1)
else:
    print("ALL CODE FILES COMPLY STRICTLY WITH <= 300 LINES RULE!")

