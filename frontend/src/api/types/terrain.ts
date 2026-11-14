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

