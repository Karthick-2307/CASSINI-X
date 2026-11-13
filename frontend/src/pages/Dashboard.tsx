import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, DashboardSummaryResponse } from "../api/client";
import {
  Card,
  StatCard,
  Badge,
  Button,
  LoadingSpinner,
  ErrorMessage,
  SectionHeading,
  EmptyState,
} from "../components/ui";
import { EarthMap } from "../components/EarthMap";

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to query dashboard statistics.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      {/* DEMO MODE BANNER (Shown ONLY if ASTRAX_DEMO_MODE=true) */}
      {summary?.demo_mode && (
        <div className="rounded-panel border-2 border-status-warn bg-amber-950/60 p-4 text-amber-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <Badge variant="demo">DEMO MODE ACTIVE</Badge>
            <span className="text-sm font-semibold">
              Platform is running in demo mode. Synthetic data is clearly flagged for inspection.
            </span>
          </div>
          <span className="text-xs font-mono text-amber-400">ASTRAX_DEMO_MODE=true</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Mission Operations"
          title="Planetary Mission Dashboard"
          subtitle="Topographic metrics, dataset coverage, and candidate analog discovery records."
        />
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <Link to="/discovery">
            <Button variant="primary" size="sm">
              New Discovery Run
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={fetchSummary}>
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <LoadingSpinner label="Fetching verified database telemetry (/api/dashboard/summary)..." size="lg" />
      )}

      {error && (
        <ErrorMessage
          title="Telemetry Connection Offline"
          code="ERR_DASHBOARD_FETCH_FAILED"
          message={error}
          onRetry={fetchSummary}
        />
      )}

      {!loading && !error && summary && (
        <div className="space-y-8">
          {/* 1. ROW OF STATCARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Processed Locations"
              value={summary.processed_locations}
              emptyText="0"
              provenance="measured"
            />
            <StatCard
              label="Planetary Regions Analysed"
              value={summary.planetary_regions}
              emptyText="0"
              provenance="derived"
            />
            <StatCard
              label="Candidate Analogs"
              value={summary.candidate_locations}
              emptyText="0"
              provenance="derived"
            />
            <StatCard
              label="Datasets Ingested"
              value={summary.datasets_ingested}
              emptyText="0"
              provenance="measured"
            />
          </div>

          {/* Quick Note about Zero counts (Scientific Honesty Rule 3) */}
          {summary.analyses_run === 0 && (
            <div className="text-xs font-mono text-text-muted bg-panel/60 border border-border px-4 py-2 rounded-btn flex items-center justify-between">
              <span>Scientific Honesty Note: Metrics display real database counts. All counters show "0" until real DEM datasets and analyses are executed.</span>
              <span className="text-accent-cyan">No fabricated data</span>
            </div>
          )}

          {/* 4. INTERACTIVE EARTH MAP */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-bold text-text-primary">
                  Terrestrial Analog Candidate Map
                </h2>
                <p className="text-xs text-text-muted">
                  Interactive CartoDB Dark Matter projection. Markers indicate verified analog candidate coordinates.
                </p>
              </div>
              <Badge variant={summary.candidate_locations > 0 ? "active" : "neutral"}>
                {summary.candidate_locations} Active Sites
              </Badge>
            </div>
            <EarthMap candidates={[]} />
          </div>

          {/* 5. QUICK ACCESS CARDS: Earth, Moon, Mars */}
          <div className="space-y-4">
            <h2 className="text-lg font-heading font-bold text-text-primary">
              Planetary System Explorers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Earth */}
              <Link to="/explorer?body=earth" className="block group">
                <Card variant="interactive" className="h-full space-y-3 border-cyan-800/40 hover:border-accent-cyan">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-heading font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                      Earth (Reference)
                    </span>
                    <Badge variant="ok">Baseline</Badge>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Explore terrestrial DEM rasters (NASADEM, Copernicus) and benchmark analog sites.
                  </p>
                  <span className="text-xs font-mono text-accent-cyan flex items-center space-x-1 group-hover:translate-x-1 transition-transform pt-1">
                    <span>Inspect Earth terrain</span>
                    <span>→</span>
                  </span>
                </Card>
              </Link>

              {/* Moon */}
              <Link to="/explorer?body=moon" className="block group">
                <Card variant="interactive" className="h-full space-y-3 border-slate-700 hover:border-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-heading font-bold text-text-primary group-hover:text-slate-200 transition-colors">
                      The Moon
                    </span>
                    <Badge variant="planned">LOLA Altimetry</Badge>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Analyze lunar polar craters, basaltic mare terrains, and permanently shadowed regions.
                  </p>
                  <span className="text-xs font-mono text-slate-300 flex items-center space-x-1 group-hover:translate-x-1 transition-transform pt-1">
                    <span>Inspect Lunar terrain</span>
                    <span>→</span>
                  </span>
                </Card>
              </Link>

              {/* Mars */}
              <Link to="/explorer?body=mars" className="block group">
                <Card variant="interactive" className="h-full space-y-3 border-orange-800/40 hover:border-orange-500">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-heading font-bold text-text-primary group-hover:text-orange-400 transition-colors">
                      Mars
                    </span>
                    <Badge variant="planned">MOLA / CTX</Badge>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Compare shield volcanoes, canyon networks, and impact basins against terrestrial equivalents.
                  </p>
                  <span className="text-xs font-mono text-orange-400 flex items-center space-x-1 group-hover:translate-x-1 transition-transform pt-1">
                    <span>Inspect Martian terrain</span>
                    <span>→</span>
                  </span>
                </Card>
              </Link>
            </div>
          </div>

          {/* TWO COLUMN GRID: Data Coverage & Recent Analyses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 2. DATA COVERAGE PANEL */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-heading font-bold text-text-primary">
                    Dataset Ingestion Coverage
                  </h3>
                  <p className="text-xs text-text-muted">
                    Spatial raster coverage percentage by planetary body.
                  </p>
                </div>
                <Badge variant="measured">{summary.data_coverage.length} Cataloged</Badge>
              </div>

              {summary.data_coverage.length === 0 ? (
                <EmptyState
                  title="No Datasets Ingested Yet"
                  description="Raster digital elevation models (SRTM, LOLA, MOLA) have not been ingested into the raw archive yet."
                  reason="Ingestion pipelines are scheduled for Phase 4."
                  action={
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-accent-cyan hover:underline"
                    >
                      See README & Documentation for ingestion protocol →
                    </a>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {summary.data_coverage.map((ds) => (
                    <div key={ds.dataset_id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-text-primary">{ds.name} ({ds.planet})</span>
                        <span className="font-mono text-text-muted">
                          {ds.coverage_percent !== null ? `${ds.coverage_percent.toFixed(1)}%` : "Pending calculation"}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-raised overflow-hidden">
                        <div
                          className="h-full bg-accent-cyan rounded-full transition-all"
                          style={{ width: `${ds.coverage_percent || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 3. RECENT ANALYSES TABLE */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-heading font-bold text-text-primary">
                    Recent Similarity Analyses
                  </h3>
                  <p className="text-xs text-text-muted">
                    Latest executions of the weighted topographic distance engine.
                  </p>
                </div>
                <Badge variant="derived">{summary.analyses_run} Total Runs</Badge>
              </div>

              {summary.recent_analyses.length === 0 ? (
                <EmptyState
                  title="No Analyses Executed Yet"
                  description="Run an analog discovery calculation to compare target lunar or Martian topography against Earth."
                  reason="Zero similarity analyses recorded in database."
                  action={
                    <Link to="/discovery">
                      <Button variant="primary" size="sm">
                        Start First Analysis
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-text-muted border-b border-border uppercase">
                      <tr>
                        <th className="py-2 px-3">Run ID</th>
                        <th className="py-2 px-3">Target</th>
                        <th className="py-2 px-3">Top Sim</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {summary.recent_analyses.map((a) => (
                        <tr key={a.id} className="hover:bg-raised/50 transition-colors">
                          <td className="py-2 px-3 text-text-primary">#{a.id}</td>
                          <td className="py-2 px-3 text-text-primary">{a.reference_region}</td>
                          <td className="py-2 px-3 text-accent-cyan">
                            {a.top_similarity !== null ? `${(a.top_similarity * 100).toFixed(1)}%` : "N/A"}
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant={a.status === "completed" ? "ok" : "neutral"}>
                              {a.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* 6. LATEST ANALYSIS SUMMARY PANEL */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-heading font-bold text-text-primary">
                Latest Analysis Profile
              </h3>
              <Badge variant="inferred">Decision Support</Badge>
            </div>
            {summary.recent_analyses.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-text-muted space-y-2">
                <p>No active analysis runs logged in current database session.</p>
                <p className="text-[11px] text-text-muted/60">
                  Select a reference region in the Discovery Explorer to initiate comparative terrain analysis.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-raised rounded-panel text-xs space-y-2">
                <div className="font-semibold text-text-primary">
                  Latest Run #{summary.recent_analyses[0].id} - {summary.recent_analyses[0].reference_region}
                </div>
                <div className="text-text-muted font-mono">
                  Timestamp: {summary.recent_analyses[0].created_at}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
