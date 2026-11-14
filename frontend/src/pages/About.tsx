import React from "react";
import {
  SectionHeading,
  Card,
  GlassPanel,
  Badge,
  AstraXLogo,
  CassinXLogo,
} from "../components/ui";

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-6">
      {/* Brand Header */}
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AstraXLogo size="lg" />
          <div className="flex items-center space-x-2 text-xs font-mono text-text-muted">
            <span>Project Platform • Developed by</span>
            <CassinXLogo />
          </div>
        </div>
        <p className="text-base text-text-muted max-w-2xl leading-relaxed">
          An explainable, data-driven web application for discovering terrestrial analog environments to prepare for future robotic and crewed planetary exploration.
        </p>
      </div>

      {/* 1. Project Introduction & Scientific Motivation */}
      <GlassPanel className="space-y-4 border-accent-cyan/30">
        <SectionHeading
          kicker="Scientific Motivation"
          title="Why Terrestrial Analogs Matter"
        />
        <blockquote className="text-lg sm:text-xl font-heading font-semibold text-accent-cyan pl-4 border-l-2 border-accent-cyan leading-snug">
          "Given a selected region on Mars or the Moon, which locations on Earth have comparable terrain characteristics?"
        </blockquote>
        <div className="text-xs sm:text-sm text-text-muted leading-relaxed space-y-3 pt-2">
          <p>
            Field testing planetary rovers, extravehicular activity (EVA) suit ergonomics, drill assemblies, and autonomous navigation algorithms requires testing in terrestrial landscapes that mimic planetary hazards. Historically, analog site selection relied largely on ad-hoc expeditions or historical precedent.
          </p>
          <p>
            <strong className="text-text-primary">ASTRA-X</strong> addresses this research gap by providing a repeatable, quantitative methodology. By analyzing open digital elevation models at standardized spatial baselines, researchers can discover previously uncharacterized analog terrains, quantify physical morphological similarity, and understand exactly why two sites match.
          </p>
        </div>
      </GlassPanel>

      {/* 2. Objectives & Technical Approach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <h3 className="text-base font-heading font-bold text-text-primary flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-accent-cyan" />
            <span>Core Objectives</span>
          </h3>
          <ul className="space-y-2 text-xs text-text-muted leading-relaxed list-disc pl-4">
            <li><strong className="text-text-primary">Quantitative Discovery:</strong> Compute multi-attribute topographic distance vectors across global digital elevation datasets.</li>
            <li><strong className="text-text-primary">Total Explainability:</strong> Disclose mathematical weighting, feature deviations, and confidence intervals for every candidate score.</li>
            <li><strong className="text-text-primary">Separation of Attributes:</strong> Keep similarity, measurement confidence, and mission traversability as independent fields.</li>
            <li><strong className="text-text-primary">Open Science:</strong> Rely exclusively on publicly available datasets from USGS, NASA PDS, and Copernicus.</li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-base font-heading font-bold text-text-primary flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-accent-blue" />
            <span>Technical Approach</span>
          </h3>
          <ul className="space-y-2 text-xs text-text-muted leading-relaxed list-disc pl-4">
            <li><strong className="text-text-primary">Standardized Spatial Baseline:</strong> Normalization of DEM rasters to fixed spatial window scales (e.g. 1000m).</li>
            <li><strong className="text-text-primary">Morphometric Derivation:</strong> Sobel gradient slope estimation and detrended residual roughness metrics.</li>
            <li><strong className="text-text-primary">Distance Minimization:</strong> Transparent weighted Euclidean formulation with equal default component weights.</li>
            <li><strong className="text-text-primary">Zero Black-Box Scoring:</strong> Complete score decomposition without opaque neural network weights.</li>
          </ul>
        </Card>
      </div>

      {/* 3. Honest Scientific Limitations */}
      <section className="space-y-4">
        <SectionHeading
          kicker="Scientific Honesty"
          title="Known Limitations & Operational Boundaries"
          subtitle="Clear boundaries on what ASTRA-X models and what requires future research."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="space-y-2 bg-panel/70">
            <Badge variant="warn">Atmosphere & Thermal</Badge>
            <h4 className="text-xs font-heading font-bold text-text-primary">
              Atmospheric & Radiation Disparity
            </h4>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Terrestrial analogs possess Earth's thick atmosphere and 1G gravity. ASTRA-X compares terrain morphology and does not simulate vacuum or radiation flux.
            </p>
          </Card>

          <Card className="space-y-2 bg-panel/70">
            <Badge variant="warn">Cross-Sensor Mineralogy</Badge>
            <h4 className="text-xs font-heading font-bold text-text-primary">
              Spectrometer Differences
            </h4>
            <p className="text-[11px] text-text-muted leading-relaxed">
              EMIT (Earth), M³ (Moon), and CRISM (Mars) utilize different bandwidths, resolutions, and calibrations. They are not compared until peer-reviewed harmonization is implemented.
            </p>
          </Card>

          <Card className="space-y-2 bg-panel/70">
            <Badge variant="warn">Decision Support Only</Badge>
            <h4 className="text-xs font-heading font-bold text-text-primary">
              No Flight Safety Certification
            </h4>
            <p className="text-[11px] text-text-muted leading-relaxed">
              All outputs are intended for scientific exploration planning and research prioritization. Outputs are never represented as certification of landing or habitation safety.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. Team Identity (CASSIN X) */}
      <Card className="space-y-6 border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <h3 className="text-xl font-heading font-extrabold text-white tracking-wide">
              The CASSIN X Team
            </h3>
            <p className="text-xs text-slate-300">
              Originators and core developers of the ASTRA-X Planetary Analog Discovery Platform.
            </p>
          </div>
          <CassinXLogo className="self-start sm:self-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-white/10 space-y-1.5 backdrop-blur-md shadow-sm">
            <div className="font-heading font-bold text-white text-sm">
              [TEAM MEMBER NAME]
            </div>
            <div className="text-xs font-mono text-sky-400 font-semibold">Team Lead & Systems Architecture</div>
            <p className="text-[11px] text-slate-400">CASSIN X Research Contributor</p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-white/10 space-y-1.5 backdrop-blur-md shadow-sm">
            <div className="font-heading font-bold text-white text-sm">
              [TEAM MEMBER NAME]
            </div>
            <div className="text-xs font-mono text-blue-400 font-semibold">Geospatial & Planetary Science</div>
            <p className="text-[11px] text-slate-400">CASSIN X Research Contributor</p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-white/10 space-y-1.5 backdrop-blur-md shadow-sm">
            <div className="font-heading font-bold text-white text-sm">
              [TEAM MEMBER NAME]
            </div>
            <div className="text-xs font-mono text-emerald-400 font-semibold">Scientific Computing & Modeling</div>
            <p className="text-[11px] text-slate-400">CASSIN X Research Contributor</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            Original Wordmarks & Branding • No NASA/ESA Logos
          </div>
          <div className="text-white font-semibold">
            Developed by CASSIN X
          </div>
        </div>
      </Card>
    </div>
  );
};
