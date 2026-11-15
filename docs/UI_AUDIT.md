# ASTRA-X — UI Refactor Step 1: System & Interface Audit

**Date:** 2026-11-14  
**Team:** CASSINI-X | **Platform:** ASTRA-X  
**Branch:** `ui-refactor`

---

## 1. Executive Summary

ASTRA-X is a full-stack scientific web application designed to evaluate Earth analog environments for planetary regions on Mars and the Moon. The existing system contains 10 top-level navigation routes, extensive telemetry overlays, complex animations, and separate pages for functions that naturally belong together.

This audit catalogues every route, page, button, and API endpoint to guide a clean refactoring into a restrained, 4-link scientific application (**Home | Discovery | Reports | About**).

---

## 2. Backend API Inventory & Status

| Endpoint | Method | Exists in Backend? | Status & Behavior |
|---|---|---|---|
| `/api/health` | GET | Yes | Healthy, version 0.1.0, demo_mode flag. |
| `/api/planets` | GET | Yes | Real data from SQLite (`Planet` table: Earth, Moon, Mars). |
| `/api/datasets` | GET | Yes | Real data from SQLite (`Dataset` table: MOLA, LOLA, SRTM). |
| `/api/dashboard/summary` | GET | Yes | Real data (counts, data coverage %, recent analyses). |
| `/api/regions` | GET | Yes | Real planetary study areas from SQLite (`Region` table). |
| `/api/regions/{id}` | GET | Yes | Real region details. |
| `/api/terrain/{id}` | GET | Yes | Real aggregate terrain statistics (mean elevation, slope, roughness). |
| `/api/terrain/{id}/bounds` | GET | Yes | Real bounding box and MapLibre image quadruplet coordinates. |
| `/api/terrain/{id}/hillshade.png` | GET | Yes | Dynamic PIL hillshade rendering from GeoTIFF rasters. |
| `/api/terrain/{id}/slope.png` | GET | Yes | Dynamic PIL slope rendering from GeoTIFF rasters. |
| `/api/terrain/sample-bbox` | POST | Yes | Real topographic cell statistics within a query bounding box. |
| `/api/gazetteer/search` | GET | Yes | IAU planetary nomenclature catalog search. |
| `/api/gazetteer/activate/{id}` | POST | Yes | Dynamically synthesizes derived terrain cells for unrasterized IAU landmarks. |
| `/api/analyses` | GET | Yes | Real analysis run history from SQLite. |
| `/api/analysis/run` | POST | Yes | Real multi-attribute similarity pipeline execution (weighted distance, clustering, anomaly detection). |
| `/api/analysis/{id}` | GET | Yes | Real analysis detail with candidate matches, feature deltas, and explanations. |
| `/api/analogs` | GET | Yes | Real candidate matches query. |
| `/api/analogs/{id}` | GET | Yes | Real single match query. |
| `/api/benchmarks/validation` | GET/POST | Yes | Real benchmark validation pipeline against literature sites. |
| `/api/mission/screening` | POST | Yes | Real slope/roughness terrain threshold screening. |
| `/api/mission/route` | POST | Yes | Real 8-directional A* pathfinding on Horn slope grids. |
| `/api/mission/routes/{id}` | GET | Yes | Cached rover routes from SQLite. |
| `/api/reports/generate` | POST | Yes | Real ReportLab PDF report generation. |
| `/api/reports` | GET | Yes | Real generated report records. |
| `/api/reports/{id}/download` | GET | Yes | Direct PDF file streaming from disk. |
| `/api/assistant/query` | POST | Yes | Deterministic database inquiry engine. |
| `/api/resources/{id}` | GET | Yes | Honest empty state (`status: "no_data_ingested"` with spectral cube notice). |
| `/api/resources/compare` | POST | Yes | Honest empty comparison with cross-instrument harmonization warning. |
| **`/api/analysis/image/upload`** | **POST** | **NO** | **Missing Endpoint:** No image ingestion endpoint exists. |
| **`/api/analysis/image/compare`** | **POST** | **NO** | **Missing Endpoint:** No visual texture or image embedding model is integrated. |

---

## 3. Frontend Routes, Pages & Components Audit

| Route | Page Component | Visible Controls & Actions | API Calls | Status / Recommendation |
|---|---|---|---|---|
| `/` | `Home.tsx` | Hero buttons ("Explore Analogs", "How it works"), 3D Globe with rotation controls, Featured Analogs, Data Sources list. | `getFeaturedAnalogs`, `getDatasets` | **Keep, simplified:** Remove redundant CTA in nav, remove pause/speed/tilt/stats on globe, replace 100% claim with real datasets, introduce 2-column hero with image/region discovery focus. |
| `/discovery` | `Discovery.tsx` | Planet selector, region selector, IAU gazetteer search, feature checkboxes, weight sliders, run button, candidate map, table, detail panel. | `getPlanets`, `getRegions`, `runAnalysis`, `getAnalysisById`, `searchGazetteer`, `activateGazetteerFeature` | **Keep as core page:** Add Image vs Region mode tabs. In Image mode, provide drag-and-drop, ground resolution requirement, and honest disabled state for missing backend endpoint. Embed reference region viewer and analysis tabs. |
| `/dashboard` | `Dashboard.tsx` | Mission metrics, dataset coverage bars, recent runs table. | `getDashboardSummary` | **Remove from main navigation:** Retain code, gated behind `dashboard` feature flag. Show real statistics on Home only if available. |
| `/explorer` | `Explorer.tsx` | Planet body switch, hillshade/slope overlay toggles, bounding box sampler, region comparison. | `getPlanets`, `getRegions`, `getTerrainSummary`, `sampleTerrainBbox` | **Merge into Discovery:** Integrate the reference region viewer directly into Discovery. Gate standalone page behind `explorer` feature flag. |
| `/analysis` | `Analysis.tsx` | 6 Analysis tabs (Features, Similarity, Clusters, Ranking, Explainability, Coverage). | `getAnalyses`, `getAnalysisById`, `getValidationReport` | **Merge into Discovery:** Integrate tabs into Discovery's right candidate detail panel. Gate standalone page behind `analysis` feature flag. |
| `/geology` | `Geology.tsx` | Spectral data viewer, mineral comparison. | `getResources`, `compareResources` | **Hide behind flag `geology: false`:** Returns honest empty state because spectral data is not ingested. |
| `/mission` | `Mission.tsx` | Landing site screening and rover A* pathfinding. | `runLandingScreening`, `planRoverRoute`, `getRegionRoutes` | **Hide behind flag `mission: false`:** Real implementation works, but out of scope for the streamlined 4-page UI. |
| `/assistant` | `Assistant.tsx` | Deterministic assistant chat interface. | `queryAssistant` | **Hide behind flag `assistant: false`:** Real deterministic engine works, but out of scope for 4-page navigation. |
| `/reports` | `Reports.tsx` | PDF generation form, report list, download buttons. | `getAnalyses`, `getReports`, `generateReport` | **Keep, simplified:** Clean list of compiled reports, generate PDF from completed analyses, download button. |
| `/about` | `About.tsx` | Scientific motivation, mathematical approach, dataset citations, limitations, team attribution. | None | **Keep, expanded:** Include complete scientific method, dataset licences, and limitations. |
| `*` | `NotFound.tsx` | 404 message and return home button. | None | **Keep:** Update styling to classic theme. |

---

## 4. Key Architectural Decisions for Refactor

1. **Four-Link Navigation:** Exact top navigation links: `Home`, `Discovery`, `Reports`, `About`.
2. **Feature Flags:** Introduce `src/config/features.ts` with all secondary pages default `false`. Old routes redirect cleanly to `/discovery` with informative notice.
3. **Design System:** Transition from high-contrast glowing dark theme to restrained scientific aesthetic:
   - Background `#0B0F17`, Surface `#111826`, Raised `#162033`, Border `#1E293B`.
   - Text `#E5E7EB`, Muted `#94A3B8`.
   - Accent `#38BDF8`.
   - Headings in Source Serif 4, body in Inter, data/coordinates in JetBrains Mono.
4. **Honest Scientific Transparency:**
   - Image mode UI is implemented with full validation; its run trigger honestly indicates backend image processing is not yet implemented.
   - Separate similarity and confidence scores across all views.
   - External links to Google Maps and Google Earth as standard web links without embedding or scraping.
