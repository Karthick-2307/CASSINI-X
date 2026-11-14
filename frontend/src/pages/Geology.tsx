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
import {
  SpectralEvidenceSection,
  SpectralProviderRegistry,
  CrossRegionCompareCard,
} from "../components/geology";

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
      <SpectralEvidenceSection
        resourceData={resourceData}
        resourceLoading={resourceLoading}
      />

      {/* Spectral Provider Ingestion Guide Cards (EMIT, M3, CRISM) */}
      <SpectralProviderRegistry />

      {/* Surface Material Comparison Between Regions with Harmonization Warning */}
      <CrossRegionCompareCard
        regions={regions}
        compareRegionAId={compareRegionAId}
        setCompareRegionAId={setCompareRegionAId}
        compareRegionBId={compareRegionBId}
        setCompareRegionBId={setCompareRegionBId}
        comparisonData={comparisonData}
        comparing={comparing}
        compareError={compareError}
        onRunComparison={handleRunComparison}
      />
    </div>
  );
};
