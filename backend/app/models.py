from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base


class Planet(Base):
    __tablename__ = "planets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    mean_radius_m = Column(Float, nullable=False)
    gravity_ms2 = Column(Float, nullable=False)
    description = Column(Text, nullable=True)

    regions = relationship("Region", back_populates="planet")
    datasets = relationship("Dataset", back_populates="planet")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    planet_id = Column(Integer, ForeignKey("planets.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    source = Column(String(100), nullable=False)
    url = Column(String(255), nullable=True)
    resolution_m = Column(Float, nullable=True)
    units = Column(String(50), nullable=True)
    acquisition_date = Column(String(50), nullable=True)
    processing_steps = Column(Text, nullable=True)
    licence = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    planet = relationship("Planet", back_populates="datasets")
    regions = relationship("Region", back_populates="source_dataset")


class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    planet_id = Column(Integer, ForeignKey("planets.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    geometry_geojson = Column(Text, nullable=True)
    elevation_m = Column(Float, nullable=True)
    slope_deg = Column(Float, nullable=True)
    roughness_m = Column(Float, nullable=True)
    source_dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    planet = relationship("Planet", back_populates="regions")
    source_dataset = relationship("Dataset", back_populates="regions")
    terrain_features = relationship("TerrainFeature", back_populates="region")


class TerrainFeature(Base):
    __tablename__ = "terrain_features"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)
    scale_m = Column(Float, nullable=False)
    elevation_min = Column(Float, nullable=True)
    elevation_max = Column(Float, nullable=True)
    elevation_mean = Column(Float, nullable=True)
    elevation_std = Column(Float, nullable=True)
    slope_mean = Column(Float, nullable=True)
    slope_max = Column(Float, nullable=True)
    roughness_mean = Column(Float, nullable=True)
    nodata_fraction = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    region = relationship("Region", back_populates="terrain_features")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    target_region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)
    weights_json = Column(Text, nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    target_region = relationship("Region")
    candidate_matches = relationship("CandidateMatch", back_populates="analysis")


class CandidateMatch(Base):
    __tablename__ = "candidate_matches"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False, index=True)
    earth_region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)
    # Similarity, confidence and mission suitability are 3 separate fields
    similarity_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    mission_suitability_score = Column(Float, nullable=False)
    score_breakdown_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analysis = relationship("Analysis", back_populates="candidate_matches")
    earth_region = relationship("Region")


class BenchmarkSite(Base):
    __tablename__ = "benchmark_sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    target_region_name = Column(String(100), nullable=False)
    earth_analog_name = Column(String(100), nullable=False)
    planet_id = Column(Integer, ForeignKey("planets.id"), nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    known_analog_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)


class MissionProfile(Base):
    __tablename__ = "mission_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    constraints_json = Column(Text, nullable=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    file_path = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analysis = relationship("Analysis")

