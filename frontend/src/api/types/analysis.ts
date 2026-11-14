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

