import React from "react";
import { Card, Badge, Button } from "../ui";
import { Region, ResourceComparisonResponse } from "../../api/client";

interface CrossRegionCompareCardProps {
  regions: Region[];
  compareRegionAId: number | null;
  setCompareRegionAId: (id: number) => void;
  compareRegionBId: number | null;
  setCompareRegionBId: (id: number) => void;
  comparisonData: ResourceComparisonResponse | null;
  comparing: boolean;
  compareError: string | null;
  onRunComparison: () => void;
}

export const CrossRegionCompareCard: React.FC<CrossRegionCompareCardProps> = ({
  regions,
  compareRegionAId,
  setCompareRegionAId,
  compareRegionBId,
  setCompareRegionBId,
  comparisonData,
  comparing,
  compareError,
  onRunComparison,
}) => {
  return (
    <Card className="space-y-5 border-border">
      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
            Cross-Region Surface Material Comparison
          </h3>
          <p className="text-xs text-text-muted">
            Compares shared topographic and morphologic proxies between any two planetary regions.
          </p>
        </div>
        <Badge variant="warn">Harmonization Rules Enforced</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
        <div className="sm:col-span-5 space-y-1">
          <label className="text-xs font-mono text-text-muted">Region A (Baseline)</label>
          <select
            value={compareRegionAId || ""}
            onChange={(e) => setCompareRegionAId(Number(e.target.value))}
            className="w-full bg-raised border border-border text-text-primary text-xs font-mono rounded-btn px-3 py-2"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-5 space-y-1">
          <label className="text-xs font-mono text-text-muted">Region B (Candidate)</label>
          <select
            value={compareRegionBId || ""}
            onChange={(e) => setCompareRegionBId(Number(e.target.value))}
            className="w-full bg-raised border border-border text-text-primary text-xs font-mono rounded-btn px-3 py-2"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={onRunComparison}
            disabled={comparing || !compareRegionAId || !compareRegionBId || compareRegionAId === compareRegionBId}
          >
            {comparing ? "Comparing..." : "Compare"}
          </Button>
        </div>
      </div>

      {compareRegionAId === compareRegionBId && (
        <p className="text-xs text-status-warn font-mono">
          Please select two distinct planetary regions for cross-region comparison.
        </p>
      )}

      {compareError && (
        <p className="text-xs text-status-danger font-mono">{compareError}</p>
      )}

      {comparisonData && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-950/20 border border-amber-800/60 rounded-btn text-xs text-text-muted space-y-1">
            <span className="font-semibold text-text-primary">Sensor Harmonization Protocol:</span>
            <p>{comparisonData.harmonisation_warning}</p>
          </div>

          <div className="overflow-x-auto border border-border rounded-panel">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-raised border-b border-border text-text-muted font-mono text-[11px]">
                  <th className="px-4 py-2.5">Feature Property</th>
                  <th className="px-4 py-2.5">{comparisonData.region_a_name}</th>
                  <th className="px-4 py-2.5">{comparisonData.region_b_name}</th>
                  <th className="px-4 py-2.5">Harmonized Metric</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-xs">
                {comparisonData.common_features.map((item, idx) => (
                  <tr key={idx} className="hover:bg-panel/40">
                    <td className="px-4 py-2.5 font-sans font-medium text-text-primary">
                      {String(item.feature || "")}
                    </td>
                    <td className="px-4 py-2.5 text-accent-cyan">
                      {String(item.region_a_value ?? "N/A")} {String(item.unit || "")}
                    </td>
                    <td className="px-4 py-2.5 text-accent-blue">
                      {String(item.region_b_value ?? "N/A")} {String(item.unit || "")}
                    </td>
                    <td className="px-4 py-2.5 text-text-muted">
                      {String(item.harmonization_status || "Standardized")}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="ok">Co-registered</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};

