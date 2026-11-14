import { CandidateMatch } from "../../api/client";
import { TerrainCategory } from "./DiscoveryFilters";

export function filterCandidates(
  candidates: CandidateMatch[],
  similarityThreshold: number,
  terrainCategory: TerrainCategory
): CandidateMatch[] {
  return candidates.filter((cand) => {
    if (cand.similarity < similarityThreshold) return false;
    if (terrainCategory !== "all") {
      const slopeItem = cand.feature_comparison.find((f) => f.feature === "slope_deg");
      const slopeVal = slopeItem ? slopeItem.candidate_value : 0;
      if (terrainCategory === "flat" && slopeVal > 4.0) return false;
      if (terrainCategory === "rolling" && (slopeVal <= 4.0 || slopeVal > 12.0)) return false;
      if (terrainCategory === "rugged" && slopeVal <= 12.0) return false;
    }
    return true;
  });
}

export function sortCandidates(
  candidates: CandidateMatch[],
  sortField: "similarity" | "confidence" | "rank",
  sortAsc: boolean
): CandidateMatch[] {
  const list = [...candidates];
  list.sort((a, b) => {
    let diff = 0;
    if (sortField === "similarity") diff = a.similarity - b.similarity;
    else if (sortField === "confidence") diff = a.confidence - b.confidence;
    else diff = a.id - b.id;
    return sortAsc ? diff : -diff;
  });
  return list;
}

