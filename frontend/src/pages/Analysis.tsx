import React, { useState, useEffect } from "react";
import {
  SectionHeading,
  Card,
  Badge,
} from "../components/ui";
import {
  api,
  AnalysisDetailResponse,
  AnalysisSummaryItem,
  CandidateMatch,
  BenchmarkValidationResponse,
} from "../api/client";
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

type AnalysisTab =
  | "features"
  | "similarity"
  | "clusters"
  | "ranking"
  | "explainability"
  | "uncertainty";

export const Analysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("features");
  const [analysesList, setAnalysesList] = useState<AnalysisSummaryItem[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [analysisDetail, setAnalysisDetail] = useState<AnalysisDetailResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(null);
  const [validationReport, setValidationReport] = useState<BenchmarkValidationResponse | null>(null);

  // Clustering tab view state: "kmeans" vs "dbscan"
  const [clusterMethod, setClusterMethod] = useState<"kmeans" | "dbscan">("kmeans");
  const [scatterAxisX, setScatterAxisX] = useState<string>("slope_deg");
  const [scatterAxisY, setScatterAxisY] = useState<string>("roughness_m");

  const tabs: { id: AnalysisTab; label: string }[] = [
    { id: "features", label: "1. Feature Comparison" },
    { id: "similarity", label: "2. Similarity Calculation" },
    { id: "clusters", label: "3. Clusters & Anomaly" },
    { id: "ranking", label: "4. Multi-Attribute Ranking" },
    { id: "explainability", label: "5. Explainability Breakdown" },
    { id: "uncertainty", label: "6. Coverage & Uncertainty" },
  ];

  // Load analyses list on mount
  useEffect(() => {
    api.getAnalyses()
      .then((list) => {
        setAnalysesList(list);
        if (list.length > 0) {
          setSelectedAnalysisId(list[0].id);
        }
      })
      .catch(() => {});

    // Also load validation report
    api.getValidationReport()
      .then((rep) => setValidationReport(rep))
      .catch(() => {});
  }, []);

  // Load detailed analysis when selectedAnalysisId changes
  useEffect(() => {
    if (selectedAnalysisId) {
      api.getAnalysisById(selectedAnalysisId)
        .then((detail) => {
          setAnalysisDetail(detail);
          if (detail.candidates.length > 0) {
            setSelectedCandidate(detail.candidates[0]);
          } else {
            setSelectedCandidate(null);
          }
        })
        .catch(() => setAnalysisDetail(null));
    }
  }, [selectedAnalysisId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header with Analysis Selector Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Mathematical Intelligence"
          title="AI & Similarity Analysis"
          subtitle="Explore multi-dimensional feature space alignments comparing elevation, slope, and roughness distributions at standardized spatial scales."
        />

        {/* Real Analysis Run Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-text-muted">Active Run:</span>
          <select
            value={selectedAnalysisId || ""}
            onChange={(e) => setSelectedAnalysisId(Number(e.target.value))}
            className="bg-panel border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary font-mono focus:outline-none"
          >
            {analysesList.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.id} &ndash; {a.target_region_name} ({a.planet}) [{new Date(a.created_at).toLocaleDateString()}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real Working Tab Switcher */}
      <div className="border-b border-border">
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-btn text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-panel text-accent-cyan border border-border border-b-transparent shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-panel/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab View Container */}
      {!analysisDetail ? (
        <Card className="min-h-[420px] flex items-center justify-center p-8">
          <div className="text-center space-y-2 text-xs font-mono text-text-muted">
            <div>No analysis loaded</div>
            <p className="text-[11px] text-text-muted/60">
              Run an analog discovery search on the Discovery page to populate real mathematical analyses.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Analysis Metadata Banner */}
          <div className="p-3 bg-panel border border-border rounded-panel flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-3">
              <span className="text-text-primary font-bold">
                Target: {analysisDetail.target_region_name} ({analysisDetail.planet})
              </span>
              <span>|</span>
              <span className="text-accent-cyan">
                {analysisDetail.candidate_count} Candidates Evaluated
              </span>
            </div>
            <div className="flex items-center space-x-3 text-text-muted text-[11px]">
              <span>Features: {analysisDetail.features.join(", ")}</span>
              <span>|</span>
              <span className="text-status-ok">Algorithm: Weighted Euclidean + Robust Scaling</span>
            </div>
          </div>

          {/* TAB 1: Feature Comparison */}
          {activeTab === "features" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
                    Normalized Topographic Alignment
                  </h3>
                  <Badge variant="derived">Standardized Units</Badge>
                </div>

                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analysisDetail.features.map((feat) => {
                        const targetSummary = analysisDetail.target_summary?.[feat];
                        const scaler = analysisDetail.scaler_params?.[feat];
                        const targetMedian = targetSummary ? targetSummary.median : 0;
                        const iqr = scaler ? scaler.iqr : 1;
                        const med = scaler ? scaler.median : 0;

                        // Normalized values
                        const normTarget = (targetMedian - med) / iqr;

                        let normCand = 0;
                        if (selectedCandidate) {
                          const candItem = selectedCandidate.feature_comparison.find(
                            (f) => f.feature === feat
                          );
                          normCand = candItem?.normalized_difference
                            ? normTarget + candItem.normalized_difference
                            : 0;
                        }

                        return {
                          feature: feat.replace("_", " "),
                          target: Number(normTarget.toFixed(3)),
                          candidate: Number(normCand.toFixed(3)),
                        };
                      })}
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                    >
                      <XAxis dataKey="feature" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0D1322",
                          borderColor: "#1E293B",
                          fontSize: "11px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="target" fill="#0284C7" name={`Reference: ${analysisDetail.target_region_name.split(" ")[0]}`} />
                      <Bar dataKey="candidate" fill="#10B981" name={`Candidate: ${selectedCandidate?.location_name.split(" ")[0] || "Selected"}`} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Candidate Selection and Scaler Params */}
              <Card className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
                    Select Candidate Point
                  </h3>
                  <Badge variant="neutral">{analysisDetail.candidate_count} Total</Badge>
                </div>

                <select
                  value={selectedCandidate?.id || ""}
                  onChange={(e) => {
                    const cand = analysisDetail.candidates.find((c) => c.id === Number(e.target.value));
                    if (cand) setSelectedCandidate(cand);
                  }}
                  className="w-full bg-raised border border-border rounded-btn px-2.5 py-1.5 text-xs text-text-primary font-mono"
                >
                  {analysisDetail.candidates.map((c, i) => (
                    <option key={c.id} value={c.id}>
                      #{i + 1} {c.location_name} ({c.similarity.toFixed(1)}%)
                    </option>
                  ))}
                </select>

                <div className="space-y-2 pt-2 border-t border-border text-xs font-mono">
                  <div className="font-bold text-text-primary text-[11px] uppercase">
                    Robust Scaler Parameters (Fit on Earth):
                  </div>
                  {analysisDetail.scaler_params &&
                    Object.entries(analysisDetail.scaler_params).map(([k, v]) => (
                      <div key={k} className="p-2 bg-raised rounded text-[11px] space-y-0.5 border border-border">
                        <div className="text-accent-cyan capitalize font-semibold">{k.replace("_", " ")}</div>
                        <div className="text-text-muted flex justify-between">
                          <span>Median: {v.median}</span>
                          <span>IQR: {v.iqr}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: Similarity Calculation & Worked Example */}
          {activeTab === "similarity" && (
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
                    <div className="text-accent-cyan text-sm p-2 bg-base rounded border border-border/80">
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
                    <div className="text-status-ok text-sm p-2 bg-base rounded border border-border/80">
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

              {/* Worked Step-by-Step Example */}
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

                    {/* Final distance and exponential result */}
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
          )}

          {/* TAB 3: Clusters & Anomaly Detection */}
          {activeTab === "clusters" && (
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

                  {/* Axes Selectors */}
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

                {/* Scatter Plot */}
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
                            color = "#EF4444"; // Red for anomaly
                          } else if (c.cluster_id === 0) {
                            color = "#10B981"; // Green cluster 0
                          } else if (c.cluster_id === 1) {
                            color = "#F59E0B"; // Amber cluster 1
                          } else {
                            color = "#8B5CF6"; // Purple cluster 2+
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

              {/* Clustering Diagnostics Card */}
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
          )}

          {/* TAB 4: Multi-Attribute Ranking Table */}
          {activeTab === "ranking" && (
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
          )}

          {/* TAB 5: Explainability Breakdown */}
          {activeTab === "explainability" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
                    Per-Feature Distance Breakdown
                  </h3>
                  {selectedCandidate && (
                    <Badge variant="derived">{selectedCandidate.location_name}</Badge>
                  )}
                </div>

                {selectedCandidate && (
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selectedCandidate.feature_comparison.map((f) => ({
                          feature: f.feature.replace("_", " "),
                          contribution: Number((f.contribution * 100).toFixed(3)),
                          difference: Number(f.difference.toFixed(2)),
                          unit: f.unit,
                        }))}
                        margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                      >
                        <XAxis dataKey="feature" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} unit="%" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0D1322",
                            borderColor: "#1E293B",
                            fontSize: "11px",
                          }}
                        />
                        <Bar dataKey="contribution" fill="#0284C7" name="Contribution to Distance (%)">
                          {selectedCandidate.feature_comparison.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? "#10B981" : i === 1 ? "#0284C7" : "#F59E0B"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              {/* Explanations text card */}
              <Card className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
                    Factual Narrative
                  </h3>
                  <Badge variant="neutral">Template-based</Badge>
                </div>

                {selectedCandidate ? (
                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-3 bg-panel border border-border rounded-btn space-y-1.5">
                      <div className="text-status-ok font-bold text-[11px] uppercase">
                        Matching Alignment Points:
                      </div>
                      <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                        {selectedCandidate.explanation.similarities.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-panel border border-border rounded-btn space-y-1.5">
                      <div className="text-status-warn font-bold text-[11px] uppercase">
                        Topographic Discrepancies:
                      </div>
                      <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                        {selectedCandidate.explanation.differences.map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2 bg-raised rounded text-[10px] text-text-muted">
                      Zero black-box claims: all sentences are derived directly from verified difference thresholds.
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-mono text-text-muted">
                    Select a candidate on Tab 1 to view narrative explainability.
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* TAB 6: Coverage & Uncertainty */}
          {activeTab === "uncertainty" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
                    Confidence Decomposition
                  </h3>
                  <Badge variant="measured">0 &ndash; 100 Score</Badge>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    Confidence measures observational integrity, data coverage, resolution mismatch penalty, and regional spread &mdash; independently of similarity.
                  </p>

                  {selectedCandidate?.confidence_components && (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-raised rounded-btn border border-border flex justify-between items-center">
                        <div>
                          <div className="font-bold text-text-primary">Data Coverage (Valid Fraction)</div>
                          <div className="text-[10px] text-text-muted">Weight: 35% | Fraction of non-nodata pixels</div>
                        </div>
                        <span className="font-bold text-status-ok text-sm">
                          {selectedCandidate.confidence_components.coverage_score}%
                        </span>
                      </div>

                      <div className="p-2.5 bg-raised rounded-btn border border-border flex justify-between items-center">
                        <div>
                          <div className="font-bold text-text-primary">Resolution Mismatch Penalty</div>
                          <div className="text-[10px] text-text-muted">
                            Weight: 25% | Mismatch Ratio: {selectedCandidate.confidence_components.resolution_mismatch_ratio}x
                          </div>
                        </div>
                        <span className="font-bold text-accent-cyan text-sm">
                          {selectedCandidate.confidence_components.resolution_score}%
                        </span>
                      </div>

                      <div className="p-2.5 bg-raised rounded-btn border border-border flex justify-between items-center">
                        <div>
                          <div className="font-bold text-text-primary">Feature Completeness</div>
                          <div className="text-[10px] text-text-muted">
                            Weight: 20% | {selectedCandidate.confidence_components.features_available} of 3 features present
                          </div>
                        </div>
                        <span className="font-bold text-text-primary text-sm">
                          {selectedCandidate.confidence_components.feature_score}%
                        </span>
                      </div>

                      <div className="p-2.5 bg-raised rounded-btn border border-border flex justify-between items-center">
                        <div>
                          <div className="font-bold text-text-primary">Reference Region Spread</div>
                          <div className="text-[10px] text-text-muted">
                            Weight: 20% | Target normalized spread: {selectedCandidate.confidence_components.reference_spread}
                          </div>
                        </div>
                        <span className="font-bold text-status-warn text-sm">
                          {selectedCandidate.confidence_components.spread_score}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Baseline Validation & Limitations */}
              <Card className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
                    Validation Against Baselines
                  </h3>
                  <Badge variant="derived">Leave-One-Region-Out</Badge>
                </div>

                {validationReport ? (
                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-3 bg-panel rounded-btn border border-border space-y-2">
                      <div className="font-bold text-text-primary text-xs">Model vs Baseline Ranks:</div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div className="p-2 bg-raised rounded border border-border">
                          <div className="text-[10px] text-text-muted">Model Mean Rank</div>
                          <div className="font-bold text-status-ok text-sm">
                            #{validationReport.metrics_summary.model.mean_rank}
                          </div>
                        </div>
                        <div className="p-2 bg-raised rounded border border-border">
                          <div className="text-[10px] text-text-muted">Slope Baseline</div>
                          <div className="font-bold text-accent-cyan text-sm">
                            #{validationReport.metrics_summary.baseline_slope.mean_rank}
                          </div>
                        </div>
                        <div className="p-2 bg-raised rounded border border-border">
                          <div className="text-[10px] text-text-muted">Random Expected</div>
                          <div className="font-bold text-text-muted text-sm">
                            #{validationReport.metrics_summary.baseline_random_expected_rank}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scientific Limitations Statement */}
                    <div className="p-3 bg-status-warn/10 border border-status-warn/30 rounded-btn space-y-1">
                      <div className="font-bold text-status-warn text-xs uppercase">
                        Statistical Power & Scientific Limitations:
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        {validationReport.statistical_power_note}
                      </p>
                    </div>

                    <div className="p-2 bg-raised rounded text-[10px] text-text-muted">
                      Evaluated on: {validationReport.timestamp} across {validationReport.benchmark_evaluations.length} curated planetary benchmark pairings.
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-mono text-text-muted">
                    Loading validation report...
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
