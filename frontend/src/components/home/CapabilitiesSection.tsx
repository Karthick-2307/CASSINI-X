import React from "react";
import { Link } from "react-router-dom";
import { Card, Badge, SectionHeading } from "../ui";

export const CapabilitiesSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SectionHeading
        kicker="System Architecture"
        title="Core Capabilities"
        subtitle="Explore the dedicated analysis modules designed for planetary field simulation, analog discovery, and terrain evaluation."
        align="center"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Analog Discovery */}
        <Link to="/discovery" className="group block">
          <Card variant="interactive" className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-accent-cyan uppercase">Module 01</span>
                <Badge variant="planned">Phase 6 Planned</Badge>
              </div>
              <h3 className="text-xl font-heading font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                Analog Discovery
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Interactive dual-map interface pairing lunar and Martian target zones with ranked terrestrial candidates based on topographic affinity.
              </p>
            </div>
            <span className="text-xs font-mono text-accent-cyan flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Open Discovery</span>
              <span>→</span>
            </span>
          </Card>
        </Link>

        {/* Module 2: Terrain Intelligence */}
        <Link to="/explorer" className="group block">
          <Card variant="interactive" className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-accent-cyan uppercase">Module 02</span>
                <Badge variant="planned">Phase 6 Planned</Badge>
              </div>
              <h3 className="text-xl font-heading font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                Terrain Intelligence
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                High-fidelity elevation slicing, slope inclination mapping, and surface roughness variance extraction from orbital DEM rasters.
              </p>
            </div>
            <span className="text-xs font-mono text-accent-cyan flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Open Planetary Explorer</span>
              <span>→</span>
            </span>
          </Card>
        </Link>

        {/* Module 3: Geological & Resource Intelligence */}
        <Link to="/geology" className="group block">
          <Card variant="interactive" className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-accent-cyan uppercase">Module 03</span>
                <Badge variant="planned">Phase 7 Planned</Badge>
              </div>
              <h3 className="text-xl font-heading font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                Geological & Resource Intelligence
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Contextualization of impact cratering, basaltic volcanism, permafrost polygons, and hyper-arid lithological environments.
              </p>
            </div>
            <span className="text-xs font-mono text-accent-cyan flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>View Geological Context</span>
              <span>→</span>
            </span>
          </Card>
        </Link>

        {/* Module 4: Landing & Habitat Screening */}
        <Link to="/mission" className="group block">
          <Card variant="interactive" className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-accent-cyan uppercase">Module 04</span>
                <Badge variant="planned">Phase 7 Planned</Badge>
              </div>
              <h3 className="text-xl font-heading font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                Landing & Habitat Screening
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Preliminary decision-support screening evaluating slope limits, boulder/roughness hazards, and surface mobility constraints.
              </p>
            </div>
            <span className="text-xs font-mono text-accent-cyan flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Evaluate Mission Constraints</span>
              <span>→</span>
            </span>
          </Card>
        </Link>

        {/* Module 5: Mission Explorer & AI Analysis */}
        <Link to="/analysis" className="group block">
          <Card variant="interactive" className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-accent-cyan uppercase">Module 05</span>
                <Badge variant="planned">Phase 5-6 Planned</Badge>
              </div>
              <h3 className="text-xl font-heading font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                Mission Explorer
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Transparent weighted distance models, multivariate feature clustering, and PCA projections of planetary terrain spaces.
              </p>
            </div>
            <span className="text-xs font-mono text-accent-cyan flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Explore Similarity Models</span>
              <span>→</span>
            </span>
          </Card>
        </Link>

        {/* Module 6: Scientific Assistant & Reports */}
        <Link to="/reports" className="group block">
          <Card variant="interactive" className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-accent-cyan uppercase">Module 06</span>
                <Badge variant="planned">Phase 7 Planned</Badge>
              </div>
              <h3 className="text-xl font-heading font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                Scientific Assistant & Reports
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Automated publication-ready PDF dossiers documenting full feature attribution, coordinate bounds, and validation metrics.
              </p>
            </div>
            <span className="text-xs font-mono text-accent-cyan flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>View Reports Dossier</span>
              <span>→</span>
            </span>
          </Card>
        </Link>
      </div>
    </section>
  );
};

