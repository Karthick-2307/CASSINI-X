import React from "react";
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
  return (
    <Card className="p-0 overflow-hidden border border-white/10 bg-slate-900/90 shadow-2xl">
      <div className="p-3 bg-slate-900/95 border-b border-white/10 flex items-center justify-between">
        <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
          Ranked Candidates Table
        </h4>
        <span className="text-[11px] font-mono text-slate-400">
          Separated Scores (Similarity vs Confidence vs Suitability)
        </span>
      </div>

      <div className="overflow-x-auto max-h-[300px] bg-slate-950/80">
        <table className="w-full text-left text-xs font-mono bg-slate-950/80">
          <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] sticky top-0 z-10 border-b border-white/10">
            <tr>
              <th className="py-2.5 px-3 w-8">Sel</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-white"
                onClick={() => {
                  setSortField("rank");
                  setSortAsc(!sortAsc);
                }}
              >
                #{sortField === "rank" ? (sortAsc ? " ↑" : " ↓") : ""}
              </th>
              <th className="py-2.5 px-3">Location</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-white"
                onClick={() => {
                  setSortField("similarity");
                  setSortAsc(!sortAsc);
                }}
              >
                Similarity{sortField === "similarity" ? (sortAsc ? " ↑" : " ↓") : ""}
              </th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-white"
                onClick={() => {
                  setSortField("confidence");
                  setSortAsc(!sortAsc);
                }}
              >
                Confidence{sortField === "confidence" ? (sortAsc ? " ↑" : " ↓") : ""}
              </th>
              <th className="py-2.5 px-3 text-slate-500" title="Suitability stays null until Part 7">
                Suitability
              </th>
              <th className="py-2.5 px-3">Coverage</th>
              <th className="py-2.5 px-3">Cluster</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No candidates match active threshold ({similarityThreshold}%) or filters.
                </td>
              </tr>
            ) : (
              candidates.map((cand, idx) => {
                const isSelected = selectedCandidate?.id === cand.id;
                const isCheckedForCompare = selectedForCompare.includes(cand.id);

                return (
                  <tr
                    key={cand.id}
                    onClick={() => onSelectCandidate(cand)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-sky-500/25 text-white font-semibold"
                        : "hover:bg-slate-800/60 text-slate-300"
                    }`}
                  >
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isCheckedForCompare}
                        onChange={() => onToggleCompare(cand.id)}
                        className="rounded border-white/20 text-sky-400 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-white font-medium truncate max-w-[130px]">
                      {cand.location_name}
                    </td>
                    <td className="py-2.5 px-3 text-sky-400 font-bold">
                      {cand.similarity.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                      {cand.confidence.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono italic">
                      &mdash;
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {((cand.data_coverage || 1.0) * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      C{cand.cluster_id !== undefined ? cand.cluster_id : 0}
                    </td>
                    <td className="py-2.5 px-3">
                      {cand.is_anomaly ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Unusual
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700">
                          Nominal
                        </span>
                      )}
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
