import React from "react";
import { Card, Badge, Button } from "../ui";
import { TerrainSummary } from "../../api/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RegionComparisonDrawerProps {
  isComparing: boolean;
  setIsComparing: (val: boolean) => void;
  compareRegionId: number | null;
  setCompareRegionId: (id: number) => void;
  regionSummary: TerrainSummary | null;
  compareSummary: TerrainSummary | null;
}

export const RegionComparisonDrawer: React.FC<RegionComparisonDrawerProps> = ({
  isComparing,
  setIsComparing,
  compareRegionId,
  setCompareRegionId,
  regionSummary,
  compareSummary,
}) => {
  return (
    <div className="space-y-4">
      <div className="pt-2">
        <Button
          variant={isComparing ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setIsComparing(!isComparing)}
          className="w-full text-xs font-mono"
        >
          {isComparing ? "Close Region Comparison" : "Compare With Another Region"}
        </Button>
      </div>

      {isComparing && (
        <Card className="space-y-4 border-accent-cyan/50 bg-raised/80">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h4 className="text-xs font-heading font-bold text-text-primary uppercase">
              Select Comparison Target
            </h4>
            <Badge variant="planned">Side-by-Side</Badge>
          </div>

          <select
            value={compareRegionId || ""}
            onChange={(e) => setCompareRegionId(Number(e.target.value))}
            className="w-full bg-panel border border-border rounded-btn px-2.5 py-1.5 text-xs text-text-primary font-mono"
          >
            <option value="">Select second region to compare...</option>
            <option value={1}>Lanzarote Volcanic Field (Earth)</option>
            <option value={2}>Jezero Crater Floor & Delta (Mars)</option>
            <option value={3}>Mare Tranquillitatis Basin (Moon)</option>
          </select>

          {compareSummary && regionSummary && (
            <div className="space-y-3 text-xs font-mono">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-panel text-text-muted text-[10px]">
                  <tr>
                    <th className="p-1.5">Metric</th>
                    <th className="p-1.5 text-right">{regionSummary.region_name.split(" ")[0]}</th>
                    <th className="p-1.5 text-right">{compareSummary.region_name.split(" ")[0]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-1.5 text-text-muted">Slope Mean</td>
                    <td className="p-1.5 text-right font-bold text-accent-cyan">
                      {regionSummary.slope_deg_mean?.toFixed(2)}°
                    </td>
                    <td className="p-1.5 text-right font-bold text-status-ok">
                      {compareSummary.slope_deg_mean?.toFixed(2)}°
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-text-muted">Slope Max</td>
                    <td className="p-1.5 text-right">{regionSummary.slope_deg_max?.toFixed(1)}°</td>
                    <td className="p-1.5 text-right">{compareSummary.slope_deg_max?.toFixed(1)}°</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-text-muted">Roughness</td>
                    <td className="p-1.5 text-right">{regionSummary.roughness_m_mean?.toFixed(2)} m</td>
                    <td className="p-1.5 text-right">{compareSummary.roughness_m_mean?.toFixed(2)} m</td>
                  </tr>
                </tbody>
              </table>

              <div className="h-32 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Mean Slope",
                        regionA: regionSummary.slope_deg_mean,
                        regionB: compareSummary.slope_deg_mean,
                      },
                      {
                        name: "Roughness",
                        regionA: regionSummary.roughness_m_mean,
                        regionB: compareSummary.roughness_m_mean,
                      },
                    ]}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0D1322",
                        borderColor: "#1E293B",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="regionA" fill="#0284C7" name={regionSummary.region_name.split(" ")[0]} />
                    <Bar dataKey="regionB" fill="#10B981" name={compareSummary.region_name.split(" ")[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

