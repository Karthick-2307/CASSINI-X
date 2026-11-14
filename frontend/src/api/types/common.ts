export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponseError {
  error: ApiError;
}

export interface Planet {
  id: number;
  name: string;
  mean_radius_m: number;
  gravity_ms2: number;
  description?: string;
}

export interface Dataset {
  id: number;
  planet_id: number;
  name: string;
  source: string;
  url?: string;
  resolution_m?: number;
  units?: string;
  acquisition_date?: string;
  processing_steps?: string;
  licence?: string;
}

export interface Region {
  id: number;
  planet_id: number;
  name: string;
  lat: number;
  lon: number;
  bbox_json?: string;
  elevation_m?: number;
  slope_deg?: number;
  roughness_m?: number;
  source_dataset_id?: number;
  description?: string;
  is_curated: boolean;
  citation?: string;
  notes?: string;
}

export interface GazetteerItem {
  id: string;
  name: string;
  planet: string;
  feature_type: string;
  lat: number;
  lon: number;
  diameter_km?: number | null;
  elevation_approx_m?: number | null;
  slope_deg?: number | null;
  roughness_m?: number | null;
  description: string;
  is_ingested: boolean;
  region_id?: number | null;
}

export interface DashboardSummaryResponse {
  processed_locations: number;
  planetary_regions: number;
  candidate_locations: number;
  datasets_ingested: number;
  analyses_run: number;
  data_coverage: Array<{
    dataset_id: number;
    name: string;
    planet: string;
    coverage_percent: number | null;
  }>;
  recent_analyses: Array<{
    id: number;
    reference_region: string;
    created_at: string;
    top_similarity: number | null;
    status: string;
  }>;
  demo_mode: boolean;
}

