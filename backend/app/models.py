from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
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
    crs = Column(String(100), nullable=True)
    units = Column(String(50), nullable=True)
    acquisition_date = Column(String(50), nullable=True)
    processing_steps = Column(Text, nullable=True)
    licence = Column(String(100), nullable=True)
    local_path = Column(String(255), nullable=True)
    status = Column(String(50), default="active")
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
    bbox_json = Column(Text, nullable=True)  # [min_lon, min_lat, max_lon, max_lat]
    geometry_geojson = Column(Text, nullable=True)
    elevation_m = Column(Float, nullable=True)
    slope_deg = Column(Float, nullable=True)
    roughness_m = Column(Float, nullable=True)
    source_dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    description = Column(Text, nullable=True)
    is_curated = Column(Boolean, default=False)
    citation = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    planet = relationship("Planet", back_populates="regions")
    source_dataset = relationship("Dataset", back_populates="regions")
    terrain_features = relationship("TerrainFeature", back_populates="region")


class TerrainFeature(Base):
    __tablename__ = "terrain_features"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)
    scale_m = Column(Float, nullable=False, default=500.0)
    window_px = Column(Integer, nullable=False, default=5)
    cell_index = Column(Integer, nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    elevation_relative = Column(Float, nullable=True)
    slope_deg = Column(Float, nullable=True)
    roughness_m = Column(Float, nullable=True)
    valid_fraction = Column(Float, nullable=False, default=1.0)
    native_res_m = Column(Float, nullable=True)
    kind = Column(String(50), default="derived")
    processing_params_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    region = relationship("Region", back_populates="terrain_features")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    target_region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)
    features_json = Column(Text, nullable=True)
    weights_json = Column(Text, nullable=False)
    threshold = Column(Float, nullable=True, default=0.0)
    top_k = Column(Integer, nullable=True, default=20)
    scaler_params_json = Column(Text, nullable=True)
    target_summary_json = Column(Text, nullable=True)
    clustering_info_json = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, running, completed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    target_region = relationship("Region")
    candidate_matches = relationship("CandidateMatch", back_populates="analysis", cascade="all, delete-orphan")


class CandidateMatch(Base):
    __tablename__ = "candidate_matches"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False, index=True)
    earth_region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)
    terrain_feature_id = Column(Integer, ForeignKey("terrain_features.id"), nullable=True)
    target_region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    location_name = Column(String(100), nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)

    # Metric scores - strictly separated
    similarity_score = Column(Float, nullable=False)  # 0-100
    confidence_score = Column(Float, nullable=False)  # 0-100
    confidence_components_json = Column(Text, nullable=True)
    mission_suitability_score = Column(Float, nullable=True)  # Strictly null until Part 7

    data_coverage = Column(Float, nullable=True)
    cluster_id = Column(Integer, nullable=True)
    is_anomaly = Column(Boolean, default=False)

    feature_comparison_json = Column(Text, nullable=True)
    dataset_references_json = Column(Text, nullable=True)
    explanation_json = Column(Text, nullable=True)
    score_breakdown_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analysis = relationship("Analysis", back_populates="candidate_matches")
    earth_region = relationship("Region", foreign_keys=[earth_region_id])
    target_region = relationship("Region", foreign_keys=[target_region_id])
    terrain_feature = relationship("TerrainFeature")


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

    planet = relationship("Planet")


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(Integer, primary_key=True, index=True)
    run_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    metrics_json = Column(Text, nullable=False)
    benchmark_results_json = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)


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
