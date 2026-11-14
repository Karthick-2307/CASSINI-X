// --- Geological & Resource Intelligence Interfaces ---
export interface SpectralEvidenceItem {
  dataset: string;
  product: string;
  kind: "observed" | "derived" | "inferred";
  citation: string;
  description: string;
  confidence_note?: string | null;
  inference_rule?: string | null;
}

export interface ResourceIntelligenceResponse {
  region_id: number;
  region_name: string;
  planet: string;
  status: "no_data_ingested" | "ingested";
  observed_evidence: SpectralEvidenceItem[];
  derived_indices: SpectralEvidenceItem[];
  inferred_resources: SpectralEvidenceItem[];
  water_ice_status: string;
  available_provider?: {
    instrument: string;
    target_body: string;
    data_provider: string;
    product_level: string;
    status: string;
    documentation_url: string;
  } | null;
  ingest_instructions?: {
    target_instrument: string;
    data_source: string;
    credential_requirement: string;
    raw_file_size_warning: string;
    supported_format: string;
    ingest_cli_command: string;
  } | null;
}

export interface ResourceComparisonRequest {
  region_a_id: number;
  region_b_id: number;
}

export interface ResourceComparisonResponse {
  region_a_name: string;
  region_b_name: string;
  common_features: Array<Record<string, unknown>>;
  harmonisation_warning: string;
}

// --- Mission Analysis & Rover Pathfinding Interfaces ---
export interface LandingScreeningRequest {
  region_id: number;
  max_slope_deg?: number;
  max_roughness_m?: number;
  min_elevation_m?: number;
  max_elevation_m?: number;
}

export interface LandingScreeningResponse {
  region_id: number;
  region_name: string;
  planet: string;
  total_cells: number;
  passing_cells: number;
  pass_fraction: number;
  mission_suitability_score: number;
  criteria_breakdown: Record<string, unknown>;
  flagged_hazards: Array<{
    type: string;
    threshold: number;
    flagged_cells: number;
    hazard_fraction: number;
    severity: string;
  }>;
  environmental_factors: Record<string, string>;
  disclaimer_banner: string;
}

export interface RoutePlanRequest {
  region_id: number;
  start_coords: [number, number]; // [lon, lat]
  goal_coords: [number, number];  // [lon, lat]
  optimization_mode?: "shortest" | "safest" | "balanced";
  max_slope_deg?: number;
}

export interface ElevationPoint {
  distance_m: number;
  elevation_m: number;
  slope_deg: number;
  lat: number;
  lon: number;
}

export interface RouteOptionItem {
  route_id?: number | null;
  name: string;
  mode: string;
  coordinates: number[][]; // [[lon, lat], ...]
  elevation_profile: ElevationPoint[];
  length_m: number;
  total_ascent_m: number;
  total_descent_m: number;
  max_slope_deg: number;
  mean_slope_deg: number;
  difficulty_score: number;
}

export interface RoutePlanResponse {
  status: string;
  message: string;
  routes: RouteOptionItem[];
  impassable_zones_count: number;
}

// --- Scientific Reports Interfaces ---
export interface ReportGenerateRequest {
  analysis_id: number;
  candidate_ids?: number[];
  route_id?: number | null;
  title?: string;
}

export interface ReportItemResponse {
  id: number;
  analysis_id: number;
  title: string;
  file_path: string;
  file_size_bytes: number;
  created_at: string;
}

// --- Scientific Assistant Interfaces ---
export interface AssistantQueryRequest {
  query: string;
  region_id?: number;
  analysis_id?: number;
}

export interface AssistantQueryResponse {
  answer: string;
  intent: string;
  sources: Array<{ title: string; ref: string }>;
  engine: string;
}

