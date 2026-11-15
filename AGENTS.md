# ASTRA-X — PART 0: MASTER RULES

## 0.1 What we are building
**ASTRA-X** is a web application by team **CASSINI-X**. It answers one research question:

> "Given a selected region on Mars or the Moon, which locations on Earth have comparable terrain characteristics?"

It does this by extracting measurable terrain features from open elevation datasets, comparing them with a transparent weighted-distance model, ranking Earth candidate locations, and explaining every score.

Tagline: "Discover Earth. Understand Other Worlds. Prepare for Exploration."
Primary contribution: explainable, data-driven discovery of terrestrial analog environments using open Earth, Moon and Mars datasets.

## 0.2 How you must work
1. Use **Planning mode**. Before writing code for a part, write a short plan (under 40 lines) and then proceed.
2. I will paste **one part at a time**. Build ONLY the part I paste. Do not start the next phase early.
3. When a part is finished, STOP and report in this format:
   - What was implemented
   - Files created or changed
   - Exact commands to run it
   - What works / what is a documented placeholder
   - Test results (paste real output)
   - Anything you could not do and why
4. Wait for me to say "continue" before doing anything else.
5. Run the app and the tests yourself before reporting. Do not say something works unless you ran it.
6. If something is ambiguous, pick the simplest reasonable option, note it in the report, and keep going. Ask me only if you are truly blocked.

## 0.3 Environment
- OS: Windows
- Python: 3.11 or newer
- Node: 20 LTS or newer
- No Docker, no PostgreSQL required for the MVP
- Editor: Antigravity

## 0.4 Tech stack (MVP)
- Frontend: React + TypeScript + Vite + Tailwind CSS + MapLibre GL JS + Recharts
- Backend: Python + FastAPI + Pydantic + SQLAlchemy + SQLite
- Analysis: numpy, pandas, scipy, scikit-learn, rasterio
- Reports: reportlab (PDF) + matplotlib (charts)
- OPTIONAL, only when a part explicitly says so: CesiumJS, PostGIS, PyTorch, GDAL, geopandas, xarray, an LLM
- Install problems with rasterio/GDAL on my OS: use the pip wheel; if that fails, tell me the fallback you chose.

## 0.5 Keep it simple (important)
- Build the smallest working implementation that satisfies the part. No extra architecture.
- Use plain functions and plain modules. Do NOT add repository / service / factory / dependency-injection layers.
- No file longer than about 300 lines. Split by feature, not by technical layer.
- Do not add libraries I did not list.
- No placeholder buttons. Every visible button must work, or be hidden, or show a clear "Not available yet — reason" state.

## 0.6 Folder structure (create exactly this, extend only when a part says so)
```
astra-x/
  README.md
  .env.example
  .gitignore
  docs/                  <- I put ASTRAX_09_reference_appendix.md here
  backend/
    requirements.txt
    app/
      main.py            <- FastAPI app, CORS, router registration
      db.py              <- engine, session, create tables
      models.py          <- SQLAlchemy tables
      schemas.py         <- Pydantic schemas
      routers/           <- one file per API group
      analysis/          <- pure Python: features.py, similarity.py, clustering.py, pathfinding.py
      ingest/            <- one file per dataset
    data/
      raw/               <- downloaded rasters (git-ignored)
      processed/         <- derived features (git-ignored)
    tests/
  frontend/
    package.json
    src/
      pages/
      components/
      api/               <- fetch helpers
      lib/               <- small utilities
      styles/
```

## 0.7 Scientific honesty rules (mandatory, apply forever)
1. Never fabricate data, satellite observations, measurements, API responses, scores or "discoveries".
2. Every number shown to the user is either computed from ingested data or clearly labelled **DEMO DATA**. Demo data is allowed only in an explicit demo mode (`ASTRAX_DEMO_MODE=true`).
3. Empty state rule: if nothing has been computed, show `0`, "No analysis run yet", or a blank state. Never show invented numbers.
4. Keep and show for every dataset: source, URL, resolution, units, acquisition/version date, processing steps, licence.
5. Distinguish **measured** (read from data) from **derived** (computed by us) from **inferred** (interpretation). Show the label in the UI and API.
6. Only compare features that are physically comparable. In Phases 1-3 the ONLY model features are **elevation (relative), slope, roughness**, all computed at one fixed spatial scale (see Part 4). Temperature, aridity and mineralogy are NOT compared across planets until a later, documented step.
7. Handle missing data explicitly (nodata masks, coverage fraction). Never silently fill gaps.
8. **Similarity, confidence and mission suitability are three separate fields** everywhere (database, API, UI, reports). Never merge them.
9. Never state that an Earth location is "identical" to Mars or the Moon. Say "comparable on the selected features".
10. Never state that a site is safe for landing or habitation. Suitability output is "preliminary screening for decision support only".
11. Model weights start **equal**. They are changed only by a documented validation experiment, never hand-picked.
12. If a dataset or API is unavailable, build a clear integration interface, return an explicit "unavailable" status, and document how to obtain the data. Never pretend it works.
13. "Under-characterized" in this project only means "not in the project's curated analog list". Never claim a location is "undiscovered" or "new to science".

## 0.8 Secrets
- Never hardcode secrets. Use environment variables and a `.env` file.
- Create `.env.example` listing every variable with a comment. Never ask me to paste keys into chat.
- Known variables: `ASTRAX_DEMO_MODE`, `DATABASE_URL`, `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`, `LLM_API_KEY` (optional), `LLM_MODEL` (optional).

## 0.9 Branding
- Team: **CASSINI-X**. Platform: **ASTRA-X**.
- "Developed by CASSINI-X" must appear in the footer and the About page.
- Original text-based logos only. Do NOT use NASA, ESA or any agency logos or branding.

## 0.10 Phase map (do NOT build ahead)
- Part 1: Foundation (scaffold, backend, routing)
- Part 2: Design system + Home page
- Part 3: Dashboard + all page shells
- Part 4: Data ingestion + terrain features
- Part 5: Similarity engine + ML
- Part 6: Discovery Explorer + Planetary Explorer + AI Analysis UI
- Part 7: Geology, Mission analysis, Reports, Assistant
- Part 8: Testing, validation, documentation, deployment prep
- Reference appendix: database tables, API endpoints, benchmark sites

