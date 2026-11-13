import React from "react";
import {
  SectionHeading,
  Card,
  GlassPanel,
  AstraXLogo,
  CassinXLogo,
} from "../components/ui";

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-6">
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <AstraXLogo size="lg" />
        </div>
        <div className="flex items-center space-x-2 text-sm text-text-muted">
          <span>Platform developed and maintained by</span>
          <CassinXLogo />
        </div>
      </div>

      <GlassPanel className="space-y-4 border-accent-cyan/30">
        <SectionHeading
          kicker="Mission Definition"
          title="The Core Research Question"
        />
        <blockquote className="text-xl sm:text-2xl font-heading font-semibold text-accent-cyan pl-4 border-l-2 border-accent-cyan leading-snug">
          "Given a selected region on Mars or the Moon, which locations on Earth have comparable terrain characteristics?"
        </blockquote>
        <p className="text-sm text-text-muted leading-relaxed">
          Analog environments on Earth offer critical opportunities to stress-test robotic mobility, train field geology crews, and calibrate remote sensing models prior to costly interplanetary deployment. ASTRA-X replaces subjective guesswork with verifiable, data-driven comparisons.
        </p>
      </GlassPanel>

      <section className="space-y-6">
        <SectionHeading
          kicker="Research Integrity"
          title="Scientific Honesty Protocols"
          subtitle="Mandatory principles enforced across all algorithms, interfaces, and dossiers."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-text-primary">
              1. Never Fabricate Data
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Every value displayed is computed directly from open elevation datasets (USGS, NASA PDS, Copernicus). Demo values are strictly labelled as DEMO DATA in demo mode.
            </p>
          </Card>

          <Card className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-text-primary">
              2. Strict Score Separation
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Similarity, confidence, and mission suitability remain three separate fields everywhere—in the database, API, UI, and exported reports. They are never merged into an opaque score.
            </p>
          </Card>

          <Card className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-text-primary">
              3. Physically Comparable Scales
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Topographic features (relative elevation, slope, and roughness) are computed at one fixed spatial scale to ensure true physical comparability across planetary bodies.
            </p>
          </Card>

          <Card className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-text-primary">
              4. Decision Support Only
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              ASTRA-X outputs provide preliminary screening for field researchers and mission planners. Results are never represented as certification of landing or habitation safety.
            </p>
          </Card>
        </div>
      </section>

      <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-text-muted">
        <div>Platform: ASTRA-X (v0.1.0)</div>
        <div className="flex items-center space-x-2">
          <span>Engineered by team</span>
          <span className="text-accent-cyan font-bold">CASSIN X</span>
        </div>
      </div>
    </div>
  );
};
