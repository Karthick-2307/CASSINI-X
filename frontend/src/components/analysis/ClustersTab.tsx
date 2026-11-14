import React, { useState } from "react";
import { Card, Badge } from "../ui";
import { AnalysisDetailResponse } from "../../api/client";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ClustersTabProps {
  analysisDetail: AnalysisDetailResponse;
}

export const ClustersTab: React.FC<ClustersTabProps> = ({ analysisDetail }) => {
  const [clusterMethod, setClusterMethod] = useState<"kmeans" | "dbscan">("kmeans");
  const [scatterAxisX, setScatterAxisX] = useState<string>("slope_deg");
  const [scatterAxisY, setScatterAxisY] = useState<string>("roughness_m");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
              2D Feature Space Clustering
            </h3>
            <div className="flex space-x-1 ml-3 bg-raised p-0.5 rounded border border-border text-[11px] font-mono">
              <button
                onClick={() => setClusterMethod("kmeans")}
                className={`px-2 py-0.5 rounded ${
                  clusterMethod === "kmeans" ? "bg-accent-cyan text-white" : "text-text-muted"
                }`}
              >
                K-Means
              </button>
              <button
                onClick={() => setClusterMethod("dbscan")}
                className={`px-2 py-0.5 rounded ${
                  clusterMethod === "dbscan" ? "bg-accent-cyan text-white" : "text-text-muted"
                }`}
              >
                DBSCAN
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono">
            <span className="text-text-muted">X:</span>
            <select
              value={scatterAxisX}
              onChange={(e) => setScatterAxisX(e.target.value)}
              className="bg-raised border border-border rounded px-1.5 py-0.5 text-text-primary"
            >
              <option value="slope_deg">Slope</option>
              <option value="elevation_relative">Elevation Rel</option>
              <option value="roughness_m">Roughness</option>
            </select>
            <span className="text-text-muted">Y:</span>
            <select
              value={scatterAxisY}
              onChange={(e) => setScatterAxisY(e.target.value)}
              className="bg-raised border border-border rounded px-1.5 py-0.5 text-text-primary"
            >
              <option value="roughness_m">Roughness</option>
              <option value="slope_deg">Slope</option>
              <option value="elevation_relative">Elevation Rel</option>
            </select>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <XAxis
                type="number"
                dataKey="x"
                name={scatterAxisX.replace("_", " ")}
                unit={scatterAxisX === "slope_deg" ? "°" : "m"}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={scatterAxisY.replace("_", " ")}
                unit={scatterAxisY === "slope_deg" ? "°" : "m"}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
              />
              <ZAxis range={[50, 100]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "#0D1322",
                  borderColor: "#1E293B",
                  fontSize: "11px",
                }}
              />
              <Scatter
                name="Earth Candidates"
                data={analysisDetail.candidates.map((c) => {
                  const xItem = c.feature_comparison.find((f) => f.feature === scatterAxisX);
                  const yItem = c.feature_comparison.find((f) => f.feature === scatterAxisY);
                  return {
                    x: xItem ? xItem.candidate_value : 0,
                    y: yItem ? yItem.candidate_value : 0,
                    name: c.location_name,
                    cluster: c.cluster_id,
                    isAnomaly: c.is_anomaly,
                    similarity: c.similarity,
                  };
                })}
              >
                {analysisDetail.candidates.map((c, i) => {
                  let color = "#0284C7";
                  if (c.is_anomaly) {
                    color = "#EF4444";
                  } else if (c.cluster_id === 0) {
                    color = "#10B981";
                  } else if (c.cluster_id === 1) {
                    color = "#F59E0B";
                  } else {
                    color = "#8B5CF6";
                  }
                  return <Cell key={i} fill={color} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted p-2 bg-raised rounded">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-status-ok" />
              <span>Cluster 0</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan" />
              <span>Cluster 1</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-status-danger" />
              <span>Anomaly (Outlier)</span>
            </span>
          </div>
          <span>Points: {analysisDetail.candidate_count}</span>
        </div>
      </Card>

      <Card className="lg:col-span-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
            Cluster Optimization
          </h3>
          <Badge variant="measured">Scikit-Learn</Badge>
        </div>

        {analysisDetail.clustering_info && (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-raised rounded-btn border border-border space-y-2">
              <div className="font-bold text-text-primary text-[11px]">K-Means Optimization:</div>
              <div className="flex justify-between">
                <span className="text-text-muted">Optimal Clusters (k):</span>
                <span className="font-bold text-accent-cyan">
                  {analysisDetail.clustering_info.kmeans.best_k}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Silhouette Score:</span>
                <span className="font-bold text-status-ok">
                  {analysisDetail.clustering_info.kmeans.silhouette_score}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Target Assignment:</span>
                <span className="font-bold text-text-primary">
                  Cluster {analysisDetail.clustering_info.kmeans.target_cluster_id}
                </span>
              </div>
            </div>

            <div className="p-3 bg-raised rounded-btn border border-border space-y-2">
              <div className="font-bold text-text-primary text-[11px]">DBSCAN Diagnostics:</div>
              <div className="flex justify-between">
                <span className="text-text-muted">K-Distance &epsilon;:</span>
                <span className="font-bold text-accent-cyan">
                  {analysisDetail.clustering_info.dbscan.eps}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Clusters Found:</span>
                <span className="font-bold text-text-primary">
                  {analysisDetail.clustering_info.dbscan.n_clusters}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Noise Points:</span>
                <span className="font-bold text-status-warn">
                  {analysisDetail.clustering_info.dbscan.noise_count}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-panel border-l-2 border-status-warn rounded text-[10px] text-text-muted leading-tight">
              Anomaly nomenclature rule: Statistical outliers are flagged as &ldquo;statistically unusual feature combinations&rdquo;. Never claimed as &ldquo;undiscovered&rdquo; or &ldquo;breakthrough&rdquo;.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

