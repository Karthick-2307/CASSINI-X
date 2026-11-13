"""
Spectral and mineralogy dataset integration interface for planetary analog discovery.

Defines the contract for hyperspectral / multispectral planetary datasets:
- NASA EMIT (Earth)
- Chandrayaan-1 M3 (Moon)
- MRO CRISM (Mars)

Maintains an explicit registry of dataset statuses:
- 'ingested'
- 'not_ingested'
- 'needs_credentials'
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class SpectralDatasetProvider:
    provider_id: str
    name: str
    instrument: str
    body: str
    wavelength_min_nm: float = 380.0
    wavelength_max_nm: float = 2500.0
    num_bands: int = 285
    units: str = "surface reflectance (unitless)"
    product_level: str = "L2A"
    processing_version: str = "v1"
    status: str = "not_ingested"  # 'ingested' | 'not_ingested' | 'needs_credentials'
    portal_url: str = ""
    file_size_warning: str = ""
    credentials_required: str = ""

    def get_ingest_instructions(self) -> Dict[str, Any]:
        return {
            "provider_id": self.provider_id,
            "name": self.name,
            "instrument": self.instrument,
            "body": self.body,
            "status": self.status,
            "portal_url": self.portal_url,
            "credentials_required": self.credentials_required,
            "product_level": self.product_level,
            "file_size_warning": self.file_size_warning,
            "steps": [
                f"1. Register authenticated access at {self.portal_url} ({self.credentials_required}).",
                f"2. Search product granule by target coordinates ({self.body}).",
                f"3. Download {self.product_level} calibrated radiance/reflectance cube ({self.file_size_warning}).",
                "4. Place raw spectral cube under backend/data/spectral/<body_lowercase>/.",
                f"5. Run spectral processing pipeline: python -m app.ingest.spectral_{self.provider_id}."
            ]
        }


# Factual Registry of Mineralogical Providers
SPECTRAL_REGISTRY: Dict[str, SpectralDatasetProvider] = {
    "emit": SpectralDatasetProvider(
        provider_id="emit",
        name="EMIT Imaging Spectroscopy (Earth)",
        instrument="NASA EMIT (ISS)",
        body="Earth",
        num_bands=285,
        units="Surface Reflectance (0.0 - 1.0)",
        product_level="EMITL2ARFL v001",
        processing_version="1.0",
        status="not_ingested",
        portal_url="https://earthdata.nasa.gov / LP DAAC",
        credentials_required="NASA Earthdata Login (free account)",
        file_size_warning="Granules typically 1.5 GB to 3.0 GB per flightline cube."
    ),
    "m3": SpectralDatasetProvider(
        provider_id="m3",
        name="Moon Mineralogy Mapper (M3)",
        instrument="ISRO Chandrayaan-1 / NASA JPL M3",
        body="Moon",
        num_bands=85,
        units="Calibrated Spectral Reflectance",
        product_level="Level 2 Target Reflectance (M3G)",
        processing_version="v01",
        status="not_ingested",
        portal_url="https://pds-imaging.jpl.nasa.gov/volumes/m3.html",
        credentials_required="Open NASA PDS / ISRO ISSDC access",
        file_size_warning="Uncompressed cubes ~400 MB to 1.2 GB per strip."
    ),
    "crism": SpectralDatasetProvider(
        provider_id="crism",
        name="Compact Reconnaissance Imaging Spectrometer for Mars (CRISM)",
        instrument="NASA MRO CRISM",
        body="Mars",
        num_bands=544,
        units="I/F Photometrically Corrected Reflectance",
        product_level="MTRDR / MRDR Targeted Cube",
        processing_version="CDR v4",
        status="not_ingested",
        portal_url="https://pds-geosciences.wustl.edu/missions/mro/crism.htm",
        credentials_required="Open NASA PDS Geosciences Node access",
        file_size_warning="Targeted hyperspectral cubes ~1.8 GB to 4.5 GB per observation."
    )
}


def get_provider_for_planet(planet_name: str) -> Optional[SpectralDatasetProvider]:
    name = planet_name.lower()
    if "earth" in name:
        return SPECTRAL_REGISTRY.get("emit")
    elif "moon" in name:
        return SPECTRAL_REGISTRY.get("m3")
    elif "mars" in name:
        return SPECTRAL_REGISTRY.get("crism")
    return None
