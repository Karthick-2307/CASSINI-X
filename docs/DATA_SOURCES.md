# ASTRA-X — Data Sources & Ingestion Registry

This document catalogues the official provenance, access endpoints, spatial resolutions, coordinate reference systems, and licensing for all open planetary and terrestrial datasets integrated into the ASTRA-X platform.

---

## 1. Earth Datasets

### SRTM 1-Arc-Second Global DEM (AWS Open Data / NASA / USGS)
- **Official Portal:** [AWS Open Data Registry — Terrain Tiles](https://registry.opendata.aws/terrain-tiles/)
- **Direct Tile URL:** `https://elevation-tiles-prod.s3.amazonaws.com/skadi/{N|S}{lat}/{N|S}{lat}{E|W}{lon}.hgt.gz`
- **Native Resolution:** 1 arc-second (~30 meters/pixel at equator)
- **Vertical Units:** Meters (orthometric elevation relative to WGS84 EGM96 geoid)
- **Coverage:** Global land areas between 60°N and 56°S
- **Licence:** Public Domain / Open Data (NASA / NGA / USGS)
- **Credentials:** None required for public AWS HTTPS bucket.
- **Processing Steps in ASTRA-X:**
  1. Automated retrieval of target 1° x 1° HGT tile via HTTPS.
  2. 16-bit big-endian raster decoding with nodata void masking (`-32768`).
  3. Resampling to standardized 500-meter metric grid using local equirectangular projection.
  4. Non-overlapping 5x5 cell (2.5 km) feature extraction.

### Optional Earth Dataset: NASA NASADEM
- **Official Portal:** [NASA LP DAAC — NASADEM Merged DEM Global 1 arc second NC](https://lpdaac.usgs.gov/products/nasadem_hgtv001/)
- **Credentials:** Free NASA Earthdata Login required (`EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD` in `.env`).

---

## 2. Mars Datasets

### Mars Global Surveyor (MGS) MOLA MEGDR Topography
- **Official Astropedia Page:** [USGS Astrogeology — Mars MGS MOLA DEM 463m](https://astrogeology.usgs.gov/search/map/mars_mgs_mola_dem_463m)
- **Direct Cloud-Optimized GeoTIFF (COG) URL:** `https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif`
- **NASA PDS Node Archive:** [NASA PDS Geosciences MGS MOLA MEGDR](https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/)
- **Native Resolution:** 463.09 meters/pixel (128 pixels/degree)
- **Vertical Units:** Meters (relative to Mars areoid / gravity datum defined by Goddard Mars Potential Model GMM-2B)
- **Coordinate System:** Equirectangular Mars (Sphere Radius: $R = 3,396,190$ m, Mean Radius: $R = 3,389,500$ m)
- **Licence:** Public Domain (NASA / USGS Astrogeology Science Center)
- **Credentials:** None required.
- **Access Protocol:**
  - Automated window streaming via GDAL/Rasterio virtual filesystem (`/vsicurl/`) using HTTP Range requests.
  - Manual local file override: `--file <path_to_local_mola.tif>`.

---

## 3. Moon Datasets

### Lunar Reconnaissance Orbiter (LRO) LOLA Global DEM
- **Official Astropedia Page:** [USGS Astrogeology — Moon LRO LOLA DEM 118m](https://astrogeology.usgs.gov/search/map/moon_lro_lola_dem_118m)
- **Direct Cloud-Optimized GeoTIFF (COG) URL:** `https://planetarymaps.usgs.gov/mosaic/Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014.tif`
- **NASA PDS Node Archive:** [NASA PDS Geosciences LRO LOLA RDR/GDR](https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/)
- **Native Resolution:** 118.45 meters/pixel (256 pixels/degree)
- **Vertical Units:** Meters (planetary radius relative to reference lunar sphere $R = 1,737,400$ m)
- **Coordinate System:** SimpleCylindrical Moon (Sphere Radius: $R = 1,737,400$ m)
- **Licence:** Public Domain (NASA / USGS Astrogeology Science Center)
- **Credentials:** None required.
- **Access Protocol:**
  - Automated window streaming via GDAL/Rasterio virtual filesystem (`/vsicurl/`) using HTTP Range requests.
  - Manual local file override: `--file <path_to_local_lola.tif>`.

---

## 4. Mineralogy & Hyperspectral Datasets (Provider Registry)

Per Part 7 specifications, mineralogical datasets across planetary bodies rely on distinct imaging spectrometers with non-equivalent calibration pipelines:

### NASA Earth Surface Mineral Dust Source Investigation (EMIT) — Earth
- **Platform:** International Space Station (ISS)
- **Spectral Range:** 381–2493 nm (285 bands across VNIR/SWIR)
- **Spatial Resolution:** ~60 meters/pixel GSD
- **Product Level:** L2A Surface Reflectance (`EMITL2ARFL`)
- **Credentials:** Free NASA Earthdata Login required
- **Raw File Size:** ~1.8 GB per netCDF4 granule cube
- **Licence:** NASA Open Data Policy (Public Access)
- **Status in Catalog:** `not_ingested` (Prerequisite for Phase 9)

### Chandrayaan-1 Moon Mineralogy Mapper ($\text{M}^3$) — Moon
- **Platform:** ISRO Chandrayaan-1 / NASA Instrument
- **Spectral Range:** 430–3000 nm (85 spectral channels)
- **Spatial Resolution:** ~140 meters/pixel (Global mode)
- **Product Level:** Level 2 Target Reflectance
- **Credentials:** NASA PDS Geosciences Node (Public PDS Archive)
- **Raw File Size:** ~450 MB per observation strip (IMG/LBL)
- **Licence:** NASA / ISRO Open Planetary Archive
- **Status in Catalog:** `not_ingested` (Prerequisite for Phase 9)

### MRO Compact Reconnaissance Imaging Spectrometer for Mars (CRISM) — Mars
- **Platform:** NASA Mars Reconnaissance Orbiter (MRO)
- **Spectral Range:** 362–3920 nm (544 channels)
- **Spatial Resolution:** 18–36 meters/pixel (Targeted mode)
- **Product Level:** MTRDR / TRDR Calibrated Spectral Cubes
- **Credentials:** NASA Planetary Data System (PDS)
- **Raw File Size:** 1.2–4.5 GB per observation cube
- **Licence:** NASA Open Planetary Data
- **Status in Catalog:** `not_ingested` (Prerequisite for Phase 9)

---

## 5. Manual Ingestion Workflow (Offline / Air-Gapped)

If network access to USGS or AWS servers is unavailable or blocked:
1. **Download the target raster manually** from the official links above.
2. **Execute the corresponding ingestion script** pointing to the local file:
   ```powershell
   # Earth SRTM Tile
   python -m app.ingest.earth_srtm --region lanzarote --file "path/to/N29W014.hgt"

   # Mars MOLA DEM
   python -m app.ingest.mars_mola --region jezero --file "path/to/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif"

   # Moon LOLA DEM
   python -m app.ingest.moon_lola --region tranquillitatis --file "path/to/Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014.tif"
   ```
3. Processed 500m rasters and extracted terrain features will automatically populate `backend/data/processed/` and the SQLite database.

