import React from "react";
import {
  SectionHeading,
  Card,
  Badge,
} from "../components/ui";

export const Geology: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Planetary Geology"
          title="Geological Context & Surface Materials"
          subtitle="Stratigraphic, lithologic, and volcanic/impact process classification contextualizing terrestrial analog matches."
        />
        <Badge variant="planned">Phase 7 Planned</Badge>
      </div>

      {/* 3.4 REAL DATA SOURCES AND LIMITATIONS PANEL */}
      <Card className="border-amber-800/60 bg-amber-950/20 p-6 space-y-3">
        <div className="flex items-center space-x-3">
          <Badge variant="warn">Scientific Honesty Notice</Badge>
          <h3 className="text-sm font-heading font-bold text-text-primary">
            Data Sources & Spectral Limitations Protocol
          </h3>
        </div>
        <div className="text-xs text-text-muted leading-relaxed space-y-2">
          <p>
            <strong className="text-text-primary">Instrumental Non-Equivalence:</strong> Mineralogy datasets across planetary bodies rely on distinct orbital imaging spectrometers: <span className="text-accent-cyan font-mono">EMIT</span> for Earth (NASA imaging spectrometer on the ISS, 381–2493 nm), <span className="text-accent-blue font-mono">M³</span> for the Moon (Moon Mineralogy Mapper on Chandrayaan-1, 430–3000 nm), and <span className="text-orange-400 font-mono">CRISM</span> for Mars (Compact Reconnaissance Imaging Spectrometer on MRO, 362–3920 nm).
          </p>
          <p>
            <strong className="text-text-primary">Harmonization Prerequisite:</strong> Because these instruments operate with differing spectral channel bandwidths, spatial ground sampling distances (EMIT: ~60m, M³: ~140m, CRISM: 18–36m), atmospheric correction routines, and radiometric calibrations, their raw spectral products are <strong className="text-status-warn">not directly comparable</strong>.
          </p>
          <p className="text-accent-cyan font-mono text-[11px] pt-1">
            Status: Cross-planetary mineralogical comparison requires an explicit, peer-reviewed harmonization pipeline. No cross-planetary mineralogical comparisons are executed in current phases (topography only).
          </p>
        </div>
      </Card>

      {/* 3-Column Layout: Mineralogical layers, Spectral info, Surface materials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Mineralogical Layers */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-heading font-bold text-text-primary">
              Mineralogical Layers
            </h3>
            <Badge variant="neutral">Column 1</Badge>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Mineral composition mapping focusing on basaltic pyroxene/olivine absorption bands, hydrated clay phyllosilicates, and evaporite sulfates.
          </p>
          <div className="py-12 px-4 border border-dashed border-border rounded-btn text-center space-y-2">
            <div className="text-xs font-mono text-text-muted">
              No mineral layers computed
            </div>
            <p className="text-[11px] text-text-muted/60">
              Awaiting calibrated mineralogy pipeline in Part 7.
            </p>
          </div>
        </Card>

        {/* Column 2: Spectral Information */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-heading font-bold text-text-primary">
              Spectral Reflectance
            </h3>
            <Badge variant="neutral">Column 2</Badge>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Visible to shortwave infrared (VNIR/SWIR) reflectance curves, continuum removal profiles, and band depth indices.
          </p>
          <div className="py-12 px-4 border border-dashed border-border rounded-btn text-center space-y-2">
            <div className="text-xs font-mono text-text-muted">
              Spectral library inactive
            </div>
            <p className="text-[11px] text-text-muted/60">
              Laboratory and orbital library integration scheduled for Part 7.
            </p>
          </div>
        </Card>

        {/* Column 3: Surface Materials */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-heading font-bold text-text-primary">
              Surface Materials & Regolith
            </h3>
            <Badge variant="neutral">Column 3</Badge>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Grain size distributions, cohesion estimates, boulder field spatial density, and basaltic lava flow textures (aa vs pahoehoe).
          </p>
          <div className="py-12 px-4 border border-dashed border-border rounded-btn text-center space-y-2">
            <div className="text-xs font-mono text-text-muted">
              Surface material classification inactive
            </div>
            <p className="text-[11px] text-text-muted/60">
              Material categorization scheduled for Part 7.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
