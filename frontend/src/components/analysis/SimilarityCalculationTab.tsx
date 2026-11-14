import React from "react";
import { Card, Badge } from "../ui";
import { AnalysisDetailResponse, CandidateMatch } from "../../api/client";

interface SimilarityCalculationTabProps {
  analysisDetail: AnalysisDetailResponse;
  selectedCandidate: CandidateMatch | null;
}

export const SimilarityCalculationTab: React.FC<SimilarityCalculationTabProps> = ({
  analysisDetail,
  selectedCandidate,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
            Mathematical Formulation
          </h3>
          <Badge variant="measured">Euclidean Distance</Badge>
        </div>

        <div className="space-y-3 text-xs font-mono leading-relaxed text-text-muted">
          <div className="p-3 bg-raised rounded-btn border border-border space-y-2">
            <div className="text-text-primary font-bold text-sm">
              1. Normalized Feature Distance
            </div>
            <div className="text-accent-cyan text-sm p-2 bg-slate-950/80 rounded border border-border/80">
              D(x, y) = &radic;( &sum; w_i &middot; (x_i &minus; y_i)&sup2; )
            </div>
            <p className="text-[11px] text-text-muted">
              Where x and y are robustly standardized vectors scaled by median and IQR fit on the terrestrial pool.
            </p>
          </div>

          <div className="p-3 bg-raised rounded-btn border border-border space-y-2">
            <div className="text-text-primary font-bold text-sm">
              2. Similarity Score Transform
            </div>
            <div className="text-status-ok text-sm p-2 bg-slate-950/80 rounded border border-border/80">
              Similarity = 100 &middot; e<sup>&minus;D(x, y)</sup>
            </div>
            <p className="text-[11px] text-text-muted">
              Documented note: This exponential transform is an illustrative topographic proximity score, not a calibrated statistical probability.
            </p>
          </div>

          <div className="p-3 bg-panel rounded-btn border border-border space-y-1">
            <div className="text-text-primary font-bold text-[11px]">Normalized Feature Weights:</div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {Object.entries(analysisDetail.weights).map(([k, w]) => (
                <div key={k} className="p-1.5 bg-raised rounded text-center border border-border">
                  <div className="text-[10px] text-text-muted capitalize">{k.split("_")[0]}</div>
                  <div className="font-bold text-text-primary">{(w * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
            Worked Step-by-Step Example
          </h3>
          {selectedCandidate && (
            <Badge variant="derived">Score: {selectedCandidate.similarity.toFixed(1)}%</Badge>
          )}
        </div>

        {!selectedCandidate ? (
          <div className="py-12 text-center text-xs font-mono text-text-muted">
            Select a candidate to inspect numerical derivation.
          </div>
        ) : (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-2.5 bg-raised rounded-btn border border-border">
              <div className="font-bold text-text-primary">
                Evaluating Candidate: {selectedCandidate.location_name}
              </div>
              <div className="text-[11px] text-text-muted">
                Lat: {selectedCandidate.lat.toFixed(4)}°, Lon: {selectedCandidate.lon.toFixed(4)}°
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-text-primary text-[11px] uppercase">
                Feature Component Calculations:
              </div>
              <table className="w-full text-[11px] border border-border rounded">
                <thead className="bg-raised text-text-muted text-[10px]">
                  <tr>
                    <th className="p-1.5 text-left">Feature</th>
                    <th className="p-1.5 text-right">Norm Diff</th>
                    <th className="p-1.5 text-right">Weight</th>
                    <th className="p-1.5 text-right">w &middot; (&Delta;)&sup2;</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedCandidate.feature_comparison.map((f) => (
                    <tr key={f.feature}>
                      <td className="p-1.5 capitalize">{f.feature.split("_")[0]}</td>
                      <td className="p-1.5 text-right">{f.normalized_difference?.toFixed(3) ?? "--"}</td>
                      <td className="p-1.5 text-right">
                        {(analysisDetail.weights[f.feature] ?? 0.33).toFixed(2)}
                      </td>
                      <td className="p-1.5 text-right font-bold text-accent-cyan">
                        {f.contribution.toFixed(5)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-panel border border-border rounded-btn space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Total Sum of Weighted Sq Diff:</span>
                <span className="font-bold text-text-primary">
                  {selectedCandidate.feature_comparison
                    .reduce((sum, item) => sum + item.contribution, 0)
                    .toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Euclidean Distance D:</span>
                <span className="font-bold text-accent-cyan">
                  &radic;
                  {Math.sqrt(
                    selectedCandidate.feature_comparison.reduce(
                      (sum, item) => sum + item.contribution,
                      0
                    )
                  ).toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border">
                <span className="font-bold text-text-primary">Resulting Similarity:</span>
                <span className="font-bold text-status-ok text-sm">
                  {selectedCandidate.similarity.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

