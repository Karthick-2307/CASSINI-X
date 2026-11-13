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

export interface HealthStatus {
  status: string;
  version: string;
  demo_mode: boolean;
}

export interface AnalogMatch {
  id: number;
  target_region_name: string;
  earth_analog_name: string;
  similarity_score: number;
  confidence_score: number;
  mission_suitability_score: number;
  target_planet: string;
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
  getHealth: () => apiClient<HealthStatus>("/api/health"),
  getPlanets: () => apiClient<Planet[]>("/api/planets"),
  getDatasets: () => apiClient<Dataset[]>("/api/datasets"),
  // Safe fetch for featured discoveries: returns [] if endpoint is unimplemented/empty
  getFeaturedAnalogs: async (limit: number = 3): Promise<AnalogMatch[]> => {
    try {
      return await apiClient<AnalogMatch[]>(`/api/analogs?limit=${limit}`);
    } catch {
      // Empty by design in Phase 2
      return [];
    }
  },
};
