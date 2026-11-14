import React from "react";
import { Card, SectionHeading } from "../ui";

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
      <SectionHeading
        kicker="Scientific Workflow"
        title="How It Works"
        subtitle="Four transparent, deterministic steps connecting planetary surface observations to verified terrestrial analogs."
        align="center"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Step 1 */}
        <Card className="flex flex-col justify-between space-y-4 relative border-border hover:border-accent-cyan/50 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-accent-cyan">01</span>
              <span className="w-8 h-8 rounded-full bg-cyan-950/50 border border-cyan-800 flex items-center justify-center text-accent-cyan text-xs font-mono">
                SEL
              </span>
            </div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Select Reference Region
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Choose a candidate region on Mars (e.g. Jezero Crater, Olympus Mons) or the Moon (e.g. Shackleton, Mare Tranquillitatis) from open planetary catalogs.
            </p>
          </div>
          <div className="text-xs font-mono text-accent-cyan/80 pt-2 border-t border-border">
            Target coordinate isolation
          </div>
        </Card>

        {/* Step 2 */}
        <Card className="flex flex-col justify-between space-y-4 relative border-border hover:border-accent-blue/50 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-accent-blue">02</span>
              <span className="w-8 h-8 rounded-full bg-blue-950/50 border border-blue-800 flex items-center justify-center text-accent-blue text-xs font-mono">
                EXT
              </span>
            </div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Extract Terrain Features
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Compute physical features at a fixed spatial scale: relative elevation distribution, mean/maximum slope, and surface roughness dispersion.
            </p>
          </div>
          <div className="text-xs font-mono text-accent-blue/80 pt-2 border-t border-border">
            Standardized raster metrics
          </div>
        </Card>

        {/* Step 3 */}
        <Card className="flex flex-col justify-between space-y-4 relative border-border hover:border-accent-violet/50 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-accent-violet">03</span>
              <span className="w-8 h-8 rounded-full bg-purple-950/50 border border-purple-800 flex items-center justify-center text-accent-violet text-xs font-mono">
                CMP
              </span>
            </div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Compare Against Earth
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Query global terrestrial digital elevation models using an explainable weighted physical distance model with equal initial weighting.
            </p>
          </div>
          <div className="text-xs font-mono text-accent-violet/80 pt-2 border-t border-border">
            Vector distance minimization
          </div>
        </Card>

        {/* Step 4 */}
        <Card className="flex flex-col justify-between space-y-4 relative border-border hover:border-status-ok/50 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-status-ok">04</span>
              <span className="w-8 h-8 rounded-full bg-emerald-950/50 border border-emerald-800 flex items-center justify-center text-status-ok text-xs font-mono">
                RNK
              </span>
            </div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Explain and Rank
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Generate independent similarity, confidence, and mission suitability scores with complete mathematical breakdowns for every match.
            </p>
          </div>
          <div className="text-xs font-mono text-status-ok/80 pt-2 border-t border-border">
            Separated multi-attribute audit
          </div>
        </Card>
      </div>
    </section>
  );
};

