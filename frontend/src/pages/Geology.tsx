import React, { useState, useEffect } from "react";
import {
  SectionHeading,
  Card,
  Badge,
  Button,
  LoadingSpinner,
  EmptyState,
} from "../components/ui";
import {
  api,
  Region,
  ResourceIntelligenceResponse,
  ResourceComparisonResponse,
} from "../api/client";

export const Geology: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [resourceData, setResourceData] = useState<ResourceIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [resourceLoading, setResourceLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Comparison state
  const [compareRegionAId, setCompareRegionAId] = useState<number | null>(null);
  const [compareRegionBId, setCompareRegionBId] = useState<number | null>(null);
  const [comparisonData, setComparisonData] = useState<ResourceComparisonResponse | null>(null);
  const [comparing, setComparing] = useState<boolean>(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Initial load: regions
  useEffect(() => {
    async function loadRegions() {
      try {
        setLoading(true);
        const data = await api.getRegions();
        setRegions(data);
        if (data.length > 0) {
          setSelectedRegionId(data[0].id);
          setCompareRegionAId(data[0].id);
          if (data.length > 1) {
            setCompareRegionBId(data[1].id);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load planetary regions.");
      } finally {
        setLoading(false);
      }
    }
    loadRegions();
  }, []);

  // Fetch resources when region changes
  useEffect(() => {
    if (!selectedRegionId) return;
    async function fetchResources() {
      try {
        setResourceLoading(true);
        const res = await api.getResources(selectedRegionId!);
        setResourceData(res);
      } catch (err: unknown) {
        console.error("Resource fetch error:", err);
      } finally {
        setResourceLoading(false);
      }
    }
    fetchResources();
  }, [selectedRegionId]);

  // Handle comparison
  const handleRunComparison = async () => {
    if (!compareRegionAId || !compareRegionBId) return;
    try {
      setComparing(true);
      setCompareError(null);
      const res = await api.compareResources({
        region_a_id: compareRegionAId,
        region_b_id: compareRegionBId,
      });
      setComparisonData(res);
    } catch (err: unknown) {
      setCompareError(err instanceof Error ? err.message : "Failed to run resource comparison.");
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-mono text-text-muted">Loading geological & spectral providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          title="Failed to Load Geology Data"
          description={error}
          action={
            <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Planetary Geology & Resources"
          title="Geological & Resource Intelligence"
          subtitle="Observed spectroscopic evidence, derived mineralogical indices, and inferred resource possibilities with full provenance."
        />
        <div className="flex items-center space-x-2">
          <Badge variant="ok">Part 7 Active</Badge>
          <Badge variant="neutral">Deterministic</Badge>
        </div>
      </div>

      {/* Mandatory Water-Ice & Volatiles Status Banner */}
      <Card className="border-blue-900/60 bg-blue-950/20 p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse" />
            <h3 className="text-sm font-heading font-bold text-text-primary tracking-wide">
              Water-Ice & Volatiles Status Protocol
            </h3>
          </div>
          <Badge variant="neutral">Instrument Truth Rule</Badge>
        </div>
        <div className="text-xs text-text-muted leading-relaxed space-y-2">
          <p className="font-mono text-status-warn text-sm">
            {resourceData?.water_ice_status || "No water-ice dataset ingested"}
          </p>
          <p>
            Per project transparency constraints, water-ice indicators are strictly suppressed unless a calibrated subsurface radar sounding (e.g. SHARAD, MARSIS), epithermal neutron spectrometer (e.g. Odyssey GRS), or permanent shadow thermal model is ingested into the database. Ingested elevation grids (SRTM, MOLA, LOLA) characterize topography and slope only.
          </p>
        </div>
      </Card>

      {/* Region Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-panel border border-border rounded-panel">
        <div className="space-y-1">
          <label className="text-xs font-mono font-semibold uppercase text-text-muted">
            Target Planetary Region
          </label>
          <p className="text-xs text-text-secondary">
            Select a target region to inspect verified spectral and mineral evidence.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedRegionId || ""}
            onChange={(e) => setSelectedRegionId(Number(e.target.value))}
            className="bg-raised border border-border text-text-primary text-xs font-mono rounded-btn px-4 py-2 focus:outline-none focus:border-accent-cyan"
          >
            {regions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name} ({reg.planet_id === 1 ? "Earth" : reg.planet_id === 2 ? "Mars" : "Moon"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Clearly Labelled Groups: Observed, Derived, Inferred */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Group 1: Observed Evidence */}
        <Card className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-heading font-bold text-text-primary">
                  1. Observed Evidence
                </h3>
                <span className="text-[11px] font-mono text-text-muted">
                  Direct instrument calibration
                </span>
              </div>
              <Badge variant="measured">Level 1/2 Data</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Direct physical measurements recorded by calibrated spectrometers (calibrated spectral radiance, reflectance curves, band absorption).
            </p>

            {resourceLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : resourceData && resourceData.observed_evidence.length > 0 ? (
              <div className="space-y-3">
                {resourceData.observed_evidence.map((item, idx) => (
                  <div key={idx} className="p-3 bg-raised/70 border border-border rounded-btn space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-accent-cyan">{item.product}</span>
                      <Badge variant="measured">Observed</Badge>
                    </div>
                    <p className="text-xs text-text-secondary">{item.description}</p>
                    <div className="text-[10px] font-mono text-text-muted">
                      Source: {item.dataset} | Citation: {item.citation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 px-4 border border-dashed border-border rounded-btn text-center space-y-2">
                <div className="text-xs font-mono text-text-muted">
                  No direct spectral product ingested
                </div>
                <p className="text-[11px] text-text-muted/70">
                  Elevation data ingested (DEM). Spectrometer radiance cubes (EMIT/M3/CRISM) require active credentialed ingest.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Group 2: Derived Indices */}
        <Card className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-heading font-bold text-text-primary">
                  2. Derived Indices
                </h3>
                <span className="text-[11px] font-mono text-text-muted">
                  Algorithmic parameter ratios
                </span>
              </div>
              <Badge variant="neutral">Level 3 Products</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Mathematical transforms of calibrated spectra: continuum-removed absorption depth, band ratios (BD530, BD920), and mineral index maps.
            </p>

            {resourceLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : resourceData && resourceData.derived_indices.length > 0 ? (
              <div className="space-y-3">
                {resourceData.derived_indices.map((item, idx) => (
                  <div key={idx} className="p-3 bg-raised/70 border border-border rounded-btn space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-accent-cyan">{item.product}</span>
                      <Badge variant="neutral">Derived</Badge>
                    </div>
                    <p className="text-xs text-text-secondary">{item.description}</p>
                    <div className="text-[10px] font-mono text-text-muted">
                      Algorithm: {item.dataset} | Citation: {item.citation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 px-4 border border-dashed border-border rounded-btn text-center space-y-2">
                <div className="text-xs font-mono text-text-muted">
                  No derived indices computed
                </div>
                <p className="text-[11px] text-text-muted/70">
                  Derived indices require multi-band calibrated reflectances. Topographic derivatives (slope, roughness) are available in Terrain analysis.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Group 3: Inferred Resource Possibilities */}
        <Card className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-heading font-bold text-text-primary">
                  3. Inferred Resources
                </h3>
                <span className="text-[11px] font-mono text-text-muted">
                  Scientific rule-based inference
                </span>
              </div>
              <Badge variant="inferred">Hypothetical</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Theoretical resource possibilities (ISRU feedstock, ilmenite volatiles, hydrated silicates) inferred through validated mineralogical models.
            </p>

            {resourceLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : resourceData && resourceData.inferred_resources.length > 0 ? (
              <div className="space-y-3">
                {resourceData.inferred_resources.map((item, idx) => (
                  <div key={idx} className="p-3 bg-raised/70 border border-border rounded-btn space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-accent-cyan">{item.product}</span>
                      <Badge variant="inferred">Inferred</Badge>
                    </div>
                    <p className="text-xs text-text-secondary">{item.description}</p>
                    {item.inference_rule && (
                      <div className="text-[11px] text-text-muted font-mono bg-panel p-2 rounded border border-border">
                        <strong>Rule:</strong> {item.inference_rule}
                      </div>
                    )}
                    {item.confidence_note && (
                      <div className="text-[10px] text-status-warn font-mono">
                        Note: {item.confidence_note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 px-4 border border-dashed border-border rounded-btn text-center space-y-2">
                <div className="text-xs font-mono text-text-muted">
                  Inferred possibilities empty
                </div>
                <p className="text-[11px] text-text-muted/70">
                  Per Part 7 rules, inferred items require explicit inference rules and confidence notes grounded in ingested spectral data. Empty state displayed honestly.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Spectral Provider Ingestion Guide Cards (EMIT, M3, CRISM) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
            Spectral Dataset Provider Registry & Ingestion Protocols
          </h3>
          <span className="text-xs font-mono text-text-muted">
            `backend/app/ingest/spectral_base.py`
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* EMIT */}
          <Card className="space-y-3 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-accent-cyan">EMIT (Earth)</span>
              <Badge variant="neutral">not_ingested</Badge>
            </div>
            <div className="text-xs text-text-muted space-y-1">
              <div><strong>Instrument:</strong> NASA Earth Surface Mineral Dust Source (ISS)</div>
              <div><strong>Coverage:</strong> 381–2493 nm (285 bands, ~60m GSD)</div>
              <div><strong>Credentials:</strong> NASA Earthdata Login (free account)</div>
              <div className="text-status-warn font-mono text-[11px]">
                File Size: ~1.8 GB netCDF4 cube per granule
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="text-[10px] font-mono text-text-muted bg-panel p-2 rounded overflow-x-auto">
                python -m app.ingest.cli --instrument EMIT --granule EMITL2ARFL_001
              </div>
            </div>
          </Card>

          {/* M3 */}
          <Card className="space-y-3 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-accent-blue">M³ (Moon)</span>
              <Badge variant="neutral">not_ingested</Badge>
            </div>
            <div className="text-xs text-text-muted space-y-1">
              <div><strong>Instrument:</strong> Moon Mineralogy Mapper (Chandrayaan-1)</div>
              <div><strong>Coverage:</strong> 430–3000 nm (85 bands, ~140m GSD)</div>
              <div><strong>Credentials:</strong> NASA PDS Geosciences Node</div>
              <div className="text-status-warn font-mono text-[11px]">
                File Size: ~450 MB IMG/LBL pairs per strip
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="text-[10px] font-mono text-text-muted bg-panel p-2 rounded overflow-x-auto">
                python -m app.ingest.cli --instrument M3 --target mare_tranquillitatis
              </div>
            </div>
          </Card>

          {/* CRISM */}
          <Card className="space-y-3 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-orange-400">CRISM (Mars)</span>
              <Badge variant="neutral">not_ingested</Badge>
            </div>
            <div className="text-xs text-text-muted space-y-1">
              <div><strong>Instrument:</strong> Compact Reconnaissance Imaging (MRO)</div>
              <div><strong>Coverage:</strong> 362–3920 nm (544 bands, 18–36m GSD)</div>
              <div><strong>Credentials:</strong> NASA Planetary Data System (PDS)</div>
              <div className="text-status-warn font-mono text-[11px]">
                File Size: 1.2–4.5 GB CAT/MTRDR products
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="text-[10px] font-mono text-text-muted bg-panel p-2 rounded overflow-x-auto">
                python -m app.ingest.cli --instrument CRISM --target jezero_crater
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Surface Material Comparison Between Regions with Harmonization Warning */}
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

        {/* Comparison Selector */}
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
              onClick={handleRunComparison}
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

        {/* Harmonization Warning Banner */}
        {comparisonData && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-950/20 border border-amber-800/60 rounded-btn text-xs text-text-muted space-y-1">
              <span className="font-semibold text-text-primary">Sensor Harmonization Protocol:</span>
              <p>{comparisonData.harmonisation_warning}</p>
            </div>

            {/* Comparison Table */}
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
    </div>
  );
};
