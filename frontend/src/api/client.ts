const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

export interface TerrainSummary {
  region_id: number;
  region_name: string;
  planet: string;
  scale_m: number;
  window_px: number;
  total_cells: number;
  valid_cells: number;
  coverage_fraction: number;
  elevation_relative_mean?: number;
  elevation_relative_std?: number;
  elevation_relative_min?: number;
  elevation_relative_max?: number;
  slope_deg_mean?: number;
  slope_deg_max?: number;
  roughness_m_mean?: number;
  dataset_provenance?: {
    id: number;
    name: string;
    source: string;
    url?: string;
    resolution_m?: number;
    crs?: string;
    units?: string;
    licence?: string;
  };
}

export interface TerrainBounds {
  region_id: number;
  name: string;
  planet: string;
  bbox: [number, number, number, number];
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
  center: [number, number];
  dataset_name: string;
  resolution_m?: number;
  source: string;
}

export interface TerrainStatSummary {
  mean: number;
  std: number;
  min: number;
  max: number;
}

export interface BboxSampleRequest {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
  planet_name?: string;
  region_id?: number;
}

export interface BboxSampleResponse {
  status: "ok" | "outside_coverage";
  message: string;
  region_name?: string;
  cell_count: number;
  elevation_relative?: TerrainStatSummary;
  slope_deg?: TerrainStatSummary;
  roughness_m?: TerrainStatSummary;
  sample_points?: Array<{
    id: number;
    lat: number;
    lon: number;
    elevation_relative: number | null;
    slope_deg: number | null;
    roughness_m: number | null;
  }>;
}

export interface FeatureComparisonItem {
  feature: string;
  unit: string;
  target_value: number;
  candidate_value: number;
  difference: number;
  normalized_difference?: number;
  contribution: number;
  kind: "matching" | "higher" | "lower";
}

export interface ExplanationItem {
  similarities: string[];
  differences: string[];
}

export interface AnalogMatch {
  id: number;
  location_name?: string;
  target_region_name?: string;
  earth_analog_name?: string;
  similarity_score: number;
  confidence_score: number;
  mission_suitability_score?: number | null;
  target_planet?: string;
}

export interface CandidateMatch {
  id: number;
  location_name: string;
  lat: number;
  lon: number;
  target_region_id: number;
  similarity: number;
  confidence: number;
  confidence_components?: {
    coverage_score: number;
    resolution_score: number;
    feature_score: number;
    spread_score: number;
    valid_fraction: number;
    resolution_mismatch_ratio: number;
    features_available: number;
    reference_spread: number;
  };
  mission_suitability: number | null;
  feature_comparison: FeatureComparisonItem[];
  data_coverage?: number;
  cluster_id?: number;
  is_anomaly: boolean;
  dataset_references: number[];
  explanation: ExplanationItem;
}

export interface AnalysisRunRequest {
  target_region_id: number;
  earth_search_area_ids?: number[];
  features?: string[];
  weights?: Record<string, number>;
  threshold?: number;
  top_k?: number;
}

export interface AnalysisRunResponse {
  analysis_id: number;
  status: string;
  message: string;
}

export interface AnalysisDetailResponse {
  id: number;
  target_region_id: number;
  target_region_name: string;
  planet: string;
  features: string[];
  weights: Record<string, number>;
  threshold: number;
  top_k: number;
  status: string;
  error_message?: string;
  scaler_params?: Record<string, { median: number; iqr: number; q25: number; q75: number }>;
  target_summary?: Record<string, { median: number; mean: number; iqr: number; std: number }>;
  clustering_info?: {
    kmeans: {
      best_k: number;
      silhouette_score: number;
      target_cluster_id: number;
      centroids: Array<{
        cluster_id: number;
        cell_count: number;
        features: Record<string, number>;
      }>;
    };
    dbscan: {
      eps: number;
      n_clusters: number;
      noise_count: number;
    };
  };
  created_at: string;
  completed_at?: string;
  candidate_count: number;
  candidates: CandidateMatch[];
}

export interface AnalysisSummaryItem {
  id: number;
  target_region_id: number;
  target_region_name: string;
  planet: string;
  created_at: string;
  status: string;
  candidate_count: number;
  top_similarity: number | null;
}

export interface BenchmarkEvaluation {
  benchmark_name: string;
  target_region: string;
  analog_region: string;
  pool_size: number;
  model_best_rank: number;
  slope_best_rank: number;
  expected_random_rank: number;
  model_similarity: number;
  slope_similarity: number;
  model_beats_slope: boolean;
  model_beats_random: boolean;
}

export interface BenchmarkValidationResponse {
  timestamp: string;
  model_name: string;
  features: string[];
  benchmark_evaluations: BenchmarkEvaluation[];
  metrics_summary: {
    model: {
      count: number;
      mean_rank: number;
      median_rank: number;
      mrr: number;
      hit_rates: Record<string, number>;
    };
    baseline_slope: {
      count: number;
      mean_rank: number;
      median_rank: number;
      mrr: number;
      hit_rates: Record<string, number>;
    };
    baseline_random_expected_rank: number;
  };
  statistical_power_note: string;
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

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMsg = `Server responded with HTTP ${response.status}`;
      try {
        const errorJson = (await response.json()) as ApiResponseError;
        if (errorJson.error && errorJson.error.message) {
          errorMsg = errorJson.error.message;
        }
      } catch {
        // Response wasn't JSON
      }
      throw new Error(errorMsg);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Network connection error. Ensure the ASTRA-X backend server is running.");
  }
}

export const api = {
  getHealth: () => apiClient<{ status: string; version: string; demo_mode: boolean }>("/api/health"),
  getPlanets: () => apiClient<Planet[]>("/api/planets"),
  getDatasets: () => apiClient<Dataset[]>("/api/datasets"),
  getRegions: (planetId?: number) => {
    const query = planetId !== undefined ? `?planet_id=${planetId}` : "";
    return apiClient<Region[]>(`/api/regions${query}`);
  },
  getRegionById: (id: number) => apiClient<Region>(`/api/regions/${id}`),
  getTerrainSummary: (regionId: number) => apiClient<TerrainSummary>(`/api/terrain/${regionId}`),
  getTerrainBounds: (regionId: number) => apiClient<TerrainBounds>(`/api/terrain/${regionId}/bounds`),
  sampleTerrainBbox: (req: BboxSampleRequest) =>
    apiClient<BboxSampleResponse>("/api/terrain/sample-bbox", {
      method: "POST",
      body: JSON.stringify(req),
    }),
  getDashboardSummary: () => apiClient<DashboardSummaryResponse>("/api/dashboard/summary"),
  getAnalyses: () => apiClient<AnalysisSummaryItem[]>("/api/analyses"),
  getAnalysisById: (id: number) => apiClient<AnalysisDetailResponse>(`/api/analysis/${id}`),
  runAnalysis: (req: AnalysisRunRequest) =>
    apiClient<AnalysisRunResponse>("/api/analysis/run", {
      method: "POST",
      body: JSON.stringify(req),
    }),
  getAnalogs: (params?: { planet?: string; area?: string; min_similarity?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.planet) q.append("planet", params.planet);
    if (params?.area) q.append("area", params.area);
    if (params?.min_similarity !== undefined) q.append("min_similarity", params.min_similarity.toString());
    if (params?.limit) q.append("limit", params.limit.toString());
    const str = q.toString() ? `?${q.toString()}` : "";
    return apiClient<CandidateMatch[]>(`/api/analogs${str}`);
  },
  getAnalogById: (id: number) => apiClient<CandidateMatch>(`/api/analogs/${id}`),
  getFeaturedAnalogs: async (limit: number = 3): Promise<AnalogMatch[]> => {
    try {
      const candidates = await apiClient<CandidateMatch[]>(`/api/analogs?limit=${limit}`);
      return candidates.map((c) => ({
        id: c.id,
        location_name: c.location_name,
        target_region_name: `Target Region #${c.target_region_id}`,
        earth_analog_name: c.location_name,
        similarity_score: c.similarity,
        confidence_score: c.confidence,
        mission_suitability_score: c.mission_suitability,
        target_planet: "Planetary Reference",
      }));
    } catch {
      return [];
    }
  },
  getValidationReport: () => apiClient<BenchmarkValidationResponse>("/api/benchmarks/validation"),
  getHillshadeUrl: (regionId: number) => `${BASE_URL}/api/terrain/${regionId}/hillshade.png`,
  getSlopeUrl: (regionId: number) => `${BASE_URL}/api/terrain/${regionId}/slope.png`,
};
