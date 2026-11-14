import React from "react";
import { Card } from "../ui";
import { AnalysisDetailResponse } from "../../api/client";

interface RankingTabProps {
  analysisDetail: AnalysisDetailResponse;
}

export const RankingTab: React.FC<RankingTabProps> = ({ analysisDetail }) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
          Ranked Analog Sites Comparison
        </h3>
        <span className="text-xs font-mono text-text-muted">
          Strictly separate Similarity, Confidence, and Mission Suitability
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-raised text-text-muted uppercase text-[10px] border-b border-border">
            <tr>
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Coordinates</th>
              <th className="py-2.5 px-3 text-accent-cyan font-bold">Similarity</th>
              <th className="py-2.5 px-3 text-status-ok font-bold">Confidence</th>
              <th className="py-2.5 px-3 text-text-muted/60">Suitability</th>
              <th className="py-2.5 px-3">Coverage</th>
              <th className="py-2.5 px-3">Cluster</th>
              <th className="py-2.5 px-3">Classification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {analysisDetail.candidates.map((c, i) => (
              <tr key={c.id} className="hover:bg-raised/50">
                <td className="py-2 px-3 font-bold">{i + 1}</td>
                <td className="py-2 px-3 text-text-primary font-medium">{c.location_name}</td>
                <td className="py-2 px-3 text-text-muted">
                  {c.lat.toFixed(3)}°, {c.lon.toFixed(3)}°
                </td>
                <td className="py-2 px-3 text-accent-cyan font-bold">
                  {c.similarity.toFixed(1)}%
                </td>
                <td className="py-2 px-3 text-status-ok font-bold">
                  {c.confidence.toFixed(1)}%
                </td>
                <td className="py-2 px-3 text-text-muted/50 italic">&mdash;</td>
                <td className="py-2 px-3">{((c.data_coverage || 1.0) * 100).toFixed(0)}%</td>
                <td className="py-2 px-3">C{c.cluster_id ?? 0}</td>
                <td className="py-2 px-3">
                  {c.is_anomaly ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-status-warn/20 text-status-warn border border-status-warn/30">
                      Unusual Combination
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-raised text-text-muted">
                      Nominal Analogy
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

