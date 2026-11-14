import React, { useState } from "react";
import { Card } from "../ui";
import { CandidateMatch } from "../../api/client";

interface CandidateTableProps {
  candidates: CandidateMatch[];
  selectedCandidate: CandidateMatch | null;
  onSelectCandidate: (c: CandidateMatch) => void;
  selectedForCompare: number[];
  onToggleCompare: (id: number) => void;
  sortField: "similarity" | "confidence" | "rank";
  setSortField: (f: "similarity" | "confidence" | "rank") => void;
  sortAsc: boolean;
  setSortAsc: (asc: boolean) => void;
  similarityThreshold: number;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  selectedForCompare,
  onToggleCompare,
  sortField,
  setSortField,
  sortAsc,
  setSortAsc,
  similarityThreshold,
}) => {
  const [showCombined, setShowCombined] = useState(false);
  const [terrainWeight, setTerrainWeight] = useState(0.5);

  return (
    <Card className="p-0 overflow-hidden border border-[#243044] bg-[#111826] shadow-sm">
      {/* Table Header Controls */}
      <div className="p-3 bg-[#162033] border-b border-[#243044] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-heading font-semibold text-[#F8FAFC]">
            Candidate Ranking
          </h4>
          <span className="text-[11px] text-[#94A3B8] font-sans">
            Independent similarity & confidence values (no merged score by default)
          </span>
        </div>

        {/* Exploratory combined score toggle */}
        <div className="flex items-center space-x-2 text-[11px] font-sans">
          <label className="flex items-center space-x-1.5 cursor-pointer text-[#94A3B8] hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={showCombined}
              onChange={(e) => setShowCombined(e.target.checked)}
              className="rounded text-accent"
            />
            <span>Exploratory combined score</span>
          </label>
          {showCombined && (
            <div className="flex items-center space-x-1 font-mono text-[10px] text-[#94A3B8] pl-2 border-l border-[#243044]">
              <span>Terrain: {(terrainWeight * 100).toFixed(0)}%</span>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={terrainWeight}
                onChange={(e) => setTerrainWeight(parseFloat(e.target.value))}
                className="w-16 accent-accent h-1"
                title="Exploratory weight slider"
              />
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto max-h-[300px]">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#162033] text-[#94A3B8] uppercase text-[10px] sticky top-0 z-10 border-b border-[#243044]">
            <tr>
              <th className="py-2.5 px-3 w-8">Sel</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-[#F8FAFC] font-mono"
                onClick={() => {
                  setSortField("rank");
                  setSortAsc(!sortAsc);
                }}
              >
                #{sortField === "rank" ? (sortAsc ? " ↑" : " ↓") : ""}
              </th>
              <th className="py-2.5 px-3 font-medium">Location</th>
              <th className="py-2.5 px-3 font-mono">Lat, Lon</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-[#F8FAFC] font-mono"
                onClick={() => {
                  setSortField("similarity");
                  setSortAsc(!sortAsc);
                }}
              >
                Similarity{sortField === "similarity" ? (sortAsc ? " ↑" : " ↓") : ""}
              </th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-[#F8FAFC] font-mono"
                onClick={() => {
                  setSortField("confidence");
                  setSortAsc(!sortAsc);
                }}
              >
                Confidence{sortField === "confidence" ? (sortAsc ? " ↑" : " ↓") : ""}
              </th>
              {showCombined && (
                <th className="py-2.5 px-3 font-mono text-accent">
                  Combined
                </th>
              )}
              <th className="py-2.5 px-3 font-mono">Coverage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#243044]/60">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={showCombined ? 8 : 7} className="py-8 text-center text-[#94A3B8] font-sans">
                  No candidates match active threshold ({similarityThreshold}%) or filters.
                </td>
              </tr>
            ) : (
              candidates.map((cand, idx) => {
                const isSelected = selectedCandidate?.id === cand.id;
                const isCheckedForCompare = selectedForCompare.includes(cand.id);
                const combinedScore =
                  cand.similarity * terrainWeight + cand.confidence * (1 - terrainWeight);

                return (
                  <tr
                    key={cand.id}
                    onClick={() => onSelectCandidate(cand)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#162033] text-[#F8FAFC] font-medium border-l-2 border-l-[#38BDF8]"
                        : "hover:bg-[#162033]/60 text-[#E5E7EB]"
                    }`}
                  >
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isCheckedForCompare}
                        onChange={() => onToggleCompare(cand.id)}
                        className="rounded border-[#243044] text-accent focus:ring-0 bg-[#0B0F17] cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#94A3B8]">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-[#F8FAFC] font-medium truncate max-w-[130px]">
                      {cand.location_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#94A3B8] text-[11px]">
                      {cand.lat.toFixed(2)}°, {cand.lon.toFixed(2)}°
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#38BDF8]">
                      {cand.similarity.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#34D399]">
                      {cand.confidence.toFixed(1)}%
                    </td>
                    {showCombined && (
                      <td className="py-2.5 px-3 font-mono font-bold text-[#F8FAFC]">
                        {combinedScore.toFixed(1)}%
                      </td>
                    )}
                    <td className="py-2.5 px-3 font-mono text-[#94A3B8]">
                      {((cand.data_coverage || 1.0) * 100).toFixed(0)}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
