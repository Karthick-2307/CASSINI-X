import React from "react";
import { Card, Badge, LoadingSpinner } from "../ui";
import { ResourceIntelligenceResponse } from "../../api/client";

interface SpectralEvidenceSectionProps {
  resourceData: ResourceIntelligenceResponse | null;
  resourceLoading: boolean;
}

export const SpectralEvidenceSection: React.FC<SpectralEvidenceSectionProps> = ({
  resourceData,
  resourceLoading,
}) => {
  return (
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
  );
};

