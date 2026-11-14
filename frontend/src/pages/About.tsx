import React from "react";
import {
  SectionHeading,
  Card,
  Badge,
  AstraXLogo,
  CassinXLogo,
} from "../components/ui";

export const About: React.FC = () => {
  return (
    <div className="space-y-12 py-2 max-w-[960px] mx-auto">
      {/* 1. Header & Platform Overview */}
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AstraXLogo size="lg" />
          <div className="flex items-center space-x-2 text-xs text-text-muted">
            <span>Developed by</span>
            <CassinXLogo />
          </div>
        </div>
        <p className="text-base text-text-muted leading-relaxed font-sans">
          ASTRA-X is an explainable, data-driven system for discovering terrestrial analog environments to support robotic and human planetary surface exploration missions.
        </p>
      </div>

      {/* 2. Research Question */}
      <Card className="space-y-3 bg-surface border-border p-6">
        <span className="text-xs font-sans font-medium uppercase tracking-wider text-accent">
          Research Question
        </span>
        <blockquote className="text-xl sm:text-2xl font-heading font-semibold text-text-primary leading-snug">
          "Given a selected region on Mars or the Moon, which locations on Earth have comparable terrain characteristics?"
        </blockquote>
        <p className="text-sm text-text-muted leading-relaxed font-sans pt-1">
          Historically, analog field test sites were chosen ad hoc or by tradition. ASTRA-X establishes a repeatable, quantitative methodology: extracting measurable topographic and texture attributes from open datasets, calculating weighted distances across candidate locations, and providing a verifiable explanation for every match.
        </p>
      </Card>

      {/* 3. Scientific Methodology */}
      <section className="space-y-6">
        <SectionHeading
          kicker="Methodology"
          title="How it works"
          subtitle="Mathematical formulation, feature extraction baselines, and scoring models."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-3 bg-surface border-border p-5">
            <h3 className="text-base font-heading font-semibold text-text-primary">
              1. Physical Terrain Features
            </h3>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              To compare topography across planets fairly, raw elevations cannot be matched directly due to planetary datum differences. We standardize to a 500m spatial grid and compute:
            </p>
            <ul className="text-xs text-text-muted space-y-1.5 list-disc list-inside font-sans">
              <li><strong>Relative Elevation:</strong> Detrended residual elevation (z - mean_z) in meters.</li>
              <li><strong>Horn Slope:</strong> Two-dimensional finite-difference surface gradient in degrees.</li>
              <li><strong>Roughness:</strong> Standard deviation of residual elevation within a 5x5 window (m).</li>
            </ul>
          </Card>

          <Card className="space-y-3 bg-surface border-border p-5">
            <h3 className="text-base font-heading font-semibold text-text-primary">
              2. Similarity Formulation
            </h3>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Similarity is formulated as an inverted normalized weighted Euclidean distance in standardized feature space:
            </p>
            <div className="p-3 bg-raised rounded border border-border font-mono text-[11px] text-accent">
              d = &radic;(&sum; w_i &times; ((x_target,i - x_cand,i) / &sigma;_i)&sup2;)<br />
              Similarity (%) = max(0, 100 &times; (1 - d / d_max))
            </div>
            <p className="text-[11px] text-text-muted font-sans">
              Model weights start equal (1/3 each). Weights are exploratory, not calibrated.
            </p>
          </Card>

          <Card className="space-y-3 bg-surface border-border p-5">
            <h3 className="text-base font-heading font-semibold text-text-primary">
              3. Independent Confidence Score
            </h3>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Similarity and confidence are kept strictly separate. Confidence measures data reliability and diagnostic quality:
            </p>
            <ul className="text-xs text-text-muted space-y-1.5 list-disc list-inside font-sans">
              <li><strong>Coverage fraction:</strong> Proportion of valid, unmasked cells in the target area.</li>
              <li><strong>Resolution ratio:</strong> Scale disparity between candidate and target altimetry.</li>
              <li><strong>Feature completeness:</strong> Number of physical dimensions evaluated.</li>
            </ul>
          </Card>

          <Card className="space-y-3 bg-surface border-border p-5">
            <h3 className="text-base font-heading font-semibold text-text-primary">
              4. Baseline Validation
            </h3>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              The model is validated against established benchmark literature analogs (e.g. Devon Island for Jezero Crater; Lanzarote volcanic fields for Lunar maria). Performance is evaluated using rank percentile recovery and Euclidean feature residuals.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. Open Datasets & Licences */}
      <section className="space-y-4">
        <SectionHeading
          kicker="Provenance"
          title="Datasets, resolutions, and licences"
        />

        <div className="border border-border rounded-card overflow-hidden bg-surface">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-raised text-text-muted font-medium border-b border-border">
              <tr>
                <th className="py-2.5 px-4">Dataset</th>
                <th className="py-2.5 px-4">Body</th>
                <th className="py-2.5 px-4">Resolution</th>
                <th className="py-2.5 px-4">Instrument / Agency</th>
                <th className="py-2.5 px-4">Licence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2.5 px-4 font-medium text-text-primary">SRTM / NASADEM</td>
                <td className="py-2.5 px-4 text-text-muted">Earth</td>
                <td className="py-2.5 px-4 font-mono text-text-muted">30 m</td>
                <td className="py-2.5 px-4 text-text-muted">NASA JPL / USGS</td>
                <td className="py-2.5 px-4 text-text-muted">Public Domain</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-text-primary">MOLA MEGDR</td>
                <td className="py-2.5 px-4 text-text-muted">Mars</td>
                <td className="py-2.5 px-4 font-mono text-text-muted">463 m</td>
                <td className="py-2.5 px-4 text-text-muted">NASA PDS / MGS</td>
                <td className="py-2.5 px-4 text-text-muted">Public Domain</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-text-primary">LOLA DEM</td>
                <td className="py-2.5 px-4 text-text-muted">Moon</td>
                <td className="py-2.5 px-4 font-mono text-text-muted">118 m</td>
                <td className="py-2.5 px-4 text-text-muted">NASA PDS / LRO</td>
                <td className="py-2.5 px-4 text-text-muted">Public Domain</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-text-primary">Copernicus GLO-30</td>
                <td className="py-2.5 px-4 text-text-muted">Earth</td>
                <td className="py-2.5 px-4 font-mono text-text-muted">30 m</td>
                <td className="py-2.5 px-4 text-text-muted">ESA Copernicus</td>
                <td className="py-2.5 px-4 text-text-muted">Open Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Honest Scientific Limitations */}
      <section className="space-y-4">
        <SectionHeading
          kicker="Scientific Integrity"
          title="Known limitations in plain language"
          subtitle="Transparent scientific boundaries regarding morphological discovery."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="space-y-2 bg-surface border-border p-4">
            <Badge variant="warn">Morphology vs Process</Badge>
            <h4 className="text-sm font-heading font-semibold text-text-primary">
              Shape vs Formation Process
            </h4>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Similar topographic shapes do not guarantee identical formation mechanisms. Wind erosion, volcanic collapse, and water action can create similar relief patterns.
            </p>
          </Card>

          <Card className="space-y-2 bg-surface border-border p-4">
            <Badge variant="warn">Model Weights</Badge>
            <h4 className="text-sm font-heading font-semibold text-text-primary">
              Weights Are Exploratory
            </h4>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Feature weights start equal and reflect user research priorities. They are exploratory, not physically calibrated ground-truth constants.
            </p>
          </Card>

          <Card className="space-y-2 bg-surface border-border p-4">
            <Badge variant="warn">Benchmark Scope</Badge>
            <h4 className="text-sm font-heading font-semibold text-text-primary">
              Curated Benchmark List
            </h4>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Validation is performed against a modest curated catalog of peer-reviewed analog sites. "Under-characterized" means absent from our catalog, not new to science.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. Team Attribution */}
      <Card className="space-y-6 bg-surface border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              The CASSIN X Team
            </h3>
            <p className="text-xs text-text-muted">
              Originators and core developers of the ASTRA-X platform.
            </p>
          </div>
          <CassinXLogo />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-raised rounded border border-border space-y-1 font-sans">
            <div className="font-semibold text-text-primary text-xs">
              [TEAM MEMBER NAME]
            </div>
            <div className="text-[11px] text-accent font-medium">Team Lead & Systems Architecture</div>
            <p className="text-[11px] text-text-muted">CASSIN X Research Contributor</p>
          </div>

          <div className="p-4 bg-raised rounded border border-border space-y-1 font-sans">
            <div className="font-semibold text-text-primary text-xs">
              [TEAM MEMBER NAME]
            </div>
            <div className="text-[11px] text-accent font-medium">Planetary Geology & Remote Sensing</div>
            <p className="text-[11px] text-text-muted">CASSIN X Research Contributor</p>
          </div>

          <div className="p-4 bg-raised rounded border border-border space-y-1 font-sans">
            <div className="font-semibold text-text-primary text-xs">
              [TEAM MEMBER NAME]
            </div>
            <div className="text-[11px] text-accent font-medium">Algorithms & Spatial ML Engineering</div>
            <p className="text-[11px] text-text-muted">CASSIN X Research Contributor</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default About;
