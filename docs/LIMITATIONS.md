# ASTRA-X — System Capabilities & Explicit Limitations

In accordance with the scientific transparency guidelines of Project ASTRA-X, this document defines what the platform is designed to do and, critically, what it **cannot** do.

---

## 1. What ASTRA-X Does
- **Mathematical Topographic Similarity**: Standardizes relative elevation, slope, and roughness distributions across planetary surfaces and terrestrial environments to evaluate physical morphological proximity.
- **Explainable Nearest-Neighbor Matching**: Deconstructs every candidate match into feature-level contributions, providing exact numerical differences and qualitative explanations (e.g. "Candidate has 2.4° steeper slope and similar roughness").
- **Uncertainty & Confidence Quantification**: Decreases candidate confidence when raster cells contain nodata voids, lower spatial resolution, or synthetic fills.
- **Operational Rover Pathfinding**: Computes 8-connected $A^*$ traversal routes on real DEM rasters, penalizing steep slopes and avoiding impassable zones (>25°).
- **Publication-Ready Scientific Export**: Generates ReportLab PDF dossiers with complete provenance, resolution metadata, and disclaimers.
- **Deterministic Decision Support**: Answers natural language questions strictly grounded in SQLite database records without hallucination or generative fabrication.

---

## 2. What ASTRA-X Cannot Do (Explicit Scientific Non-Goals)

### 1. No Claim of Geological Identity
- ASTRA-X evaluates morphological and topographic proxies **only**.
- High similarity score ($S > 90\%$) does **not** mean an Earth location is "identical" to Mars or the Moon. It means their slope, roughness, and relative relief distributions are mathematically comparable at the sampled scale.

### 2. No Certification of Landing or Habitation Safety
- Mission suitability scores evaluate terrain smoothness against user-configured assumptions (e.g., slope $< 10^\circ$, roughness $< 5\text{ m}$).
- These metrics are **preliminary scientific screening tools only**. They are **not certified** for spacecraft landing safety, entry/descent/landing (EDL) trajectories, or human habitat establishment.

### 3. Instrumental Non-Equivalence & Spatial Resolution Disparities
- Planetary datasets originate from differing orbital sensors:
  - Earth: SRTM 1-Arc-Second (~30 m/pixel)
  - Moon: LOLA Global Gridded Data Record (~118 m/pixel)
  - Mars: MOLA MEGDR (~463 m/pixel)
- Comparing a 463m Martian grid cell to a 30m terrestrial cell introduces inevitable aggregation effects. A small boulder field visible in 30m SRTM will be completely smoothed out in 463m MOLA.

### 4. Mineralogy and Spectral Non-Equivalence
- Orbital spectrometers across bodies (EMIT on ISS, $\text{M}^3$ on Chandrayaan-1, CRISM on MRO) feature different channel bandwidths, spatial footprints, and atmospheric correction regimes.
- Raw spectral products are **not directly comparable** across planetary bodies without an explicit, peer-reviewed harmonization pipeline. Mineral layers are therefore held in an honest `not_ingested` registry until calibrated.

### 5. Water-Ice Confirmation
- ASTRA-X elevation rasters **cannot** detect or confirm subsurface or surface water-ice.
- Unless calibrated radar sounding (SHARAD/MARSIS) or epithermal neutron spectrometer (GRS) datasets are ingested into the database, water-ice indicators display `"No water-ice dataset ingested"`.

### 6. Limited Ground Truth Benchmark Pool
- Current automated baseline validation evaluates 1 active benchmark pairing (Mare Tranquillitatis vs. Lanzarote Volcanic Field across 358 candidate cells).
- Statistical conclusions regarding retrieval power are bounded by this pool size until additional field sites (Atacama Desert, Devon Island, Kilauea, McMurdo Dry Valleys) are ingested.

