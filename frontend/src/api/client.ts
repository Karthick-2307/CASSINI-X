import {
  ApiResponseError,
  Planet,
  Dataset,
  Region,
  TerrainSummary,
  TerrainBounds,
  BboxSampleRequest,
  BboxSampleResponse,
  DashboardSummaryResponse,
  AnalysisSummaryItem,
  AnalysisDetailResponse,
  AnalysisRunRequest,
  AnalysisRunResponse,
  CandidateMatch,
  AnalogMatch,
  BenchmarkValidationResponse,
  ResourceIntelligenceResponse,
  ResourceComparisonRequest,
  ResourceComparisonResponse,
  LandingScreeningRequest,
  LandingScreeningResponse,
  RoutePlanRequest,
  RoutePlanResponse,
  RouteOptionItem,
  ReportGenerateRequest,
  ReportItemResponse,
  AssistantQueryRequest,
  AssistantQueryResponse,
  GazetteerItem,
} from "./types";

export * from "./types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiClient<T>(endpoint: string, options?: RequestInit, retries = 2): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
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
      const isLastAttempt = attempt === retries;
      const isFetchError =
        err instanceof Error &&
        (err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError") ||
          err.message.includes("HTTP 502"));

      if (!isLastAttempt && isFetchError) {
        // Wait 2.5s before retrying to give backend time to warm up
        await new Promise((resolve) => setTimeout(resolve, 2500));
        continue;
      }

      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch")) {
          throw new Error("Server is waking up. Please wait a moment and click Retry.");
        }
        throw err;
      }
      throw new Error("Network connection error. Ensure the ASTRA-X backend server is running.");
    }
  }
  throw new Error("Request failed after retries.");
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
  searchByImage: (req: { image_base64: string; filename?: string; target_body?: string; ground_resolution_m?: number }) =>
    apiClient<AnalysisDetailResponse>("/api/analysis/search-by-image", {
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

  // --- Part 7A: Geology & Resource Intelligence ---
  getResources: (regionId: number) =>
    apiClient<ResourceIntelligenceResponse>(`/api/resources/${regionId}`),
  compareResources: (req: ResourceComparisonRequest) =>
    apiClient<ResourceComparisonResponse>("/api/resources/compare", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // --- Part 7B: Mission Analysis & Rover Pathfinding ---
  runLandingScreening: (req: LandingScreeningRequest) =>
    apiClient<LandingScreeningResponse>("/api/mission/screening", {
      method: "POST",
      body: JSON.stringify(req),
    }),
  planRoverRoute: (req: RoutePlanRequest) =>
    apiClient<RoutePlanResponse>("/api/mission/route", {
      method: "POST",
      body: JSON.stringify(req),
    }),
  getRegionRoutes: (regionId: number) =>
    apiClient<RouteOptionItem[]>(`/api/mission/routes/${regionId}`),

  // --- Part 7C: Scientific Reports ---
  generateReport: (req: ReportGenerateRequest) =>
    apiClient<ReportItemResponse>("/api/reports/generate", {
      method: "POST",
      body: JSON.stringify(req),
    }),
  getReports: () => apiClient<ReportItemResponse[]>("/api/reports"),
  getReportDownloadUrl: (id: number) => `${BASE_URL}/api/reports/${id}/download`,

  // --- Part 7D: Scientific Assistant ---
  queryAssistant: (req: AssistantQueryRequest) =>
    apiClient<AssistantQueryResponse>("/api/assistant/query", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // --- Planetary Gazetteer & Location Search ---
  searchGazetteer: (query?: string, planet?: string) => {
    const q = new URLSearchParams();
    if (query) q.append("query", query);
    if (planet) q.append("planet", planet);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return apiClient<GazetteerItem[]>(`/api/gazetteer/search${qs}`);
  },
  activateGazetteerFeature: (itemId: string) =>
    apiClient<GazetteerItem>(`/api/gazetteer/activate/${itemId}`, {
      method: "POST",
    }),
};
