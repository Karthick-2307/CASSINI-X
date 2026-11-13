import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  GlassPanel,
  Badge,
  SectionHeading,
  CassinXLogo,
} from "../components/ui";
import { api, Dataset, AnalogMatch } from "../api/client";

export const Home: React.FC = () => {
  const [featuredAnalogs, setFeaturedAnalogs] = useState<AnalogMatch[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    // 5. Featured discoveries: loads from GET /api/analogs?limit=3.
    // If empty, hidden completely.
    api.getFeaturedAnalogs(3).then((data) => {
      setFeaturedAnalogs(data);
    });

    // 6. Real datasets response for status indicators
    api.getDatasets().then((data) => {
      setDatasets(data);
    }).catch(() => {
      setDatasets([]);
    });
  }, []);

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Helper to determine dataset status badge from real dataset records
  const getDatasetStatus = (datasetName: string): "active" | "planned" | "unavailable" => {
    const found = datasets.find((d) => d.name.toLowerCase().includes(datasetName.toLowerCase()));
    if (found) return "active";
    return "planned";
  };

  return (
    <div className="space-y-24 py-6">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-panel border border-border">
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-xs font-mono text-text-muted">A</span>
                <CassinXLogo />
                <span className="text-xs font-mono text-text-muted">project</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-text-primary tracking-tight leading-[1.1]">
                Discover Earth.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-blue to-cyan-300">
                  Understand Other Worlds.
                </span>{" "}
                Prepare for Exploration.
              </h1>

              <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
                An AI-powered planetary intelligence platform for discovering terrestrial analog environments through open scientific data.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Link to="/discovery">
                  <Button variant="primary" size="lg">
                    Launch Explorer
                  </Button>
                </Link>
                <Button variant="secondary" size="lg" onClick={scrollToHowItWorks}>
                  How it works
                </Button>
              </div>

              <div className="pt-4 flex items-center space-x-6 text-xs font-mono text-text-muted/80">
                <div className="flex items-center space-x-2">
                  <span className="text-accent-cyan font-bold">100%</span>
                  <span>Open Science Data</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-2">
                  <span className="text-accent-blue font-bold">Transparent</span>
                  <span>Weighted Metric</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-2">
                  <span className="text-status-ok font-bold">Explainable</span>
                  <span>Scoring</span>
                </div>
              </div>
            </div>

            {/* Right Visual: Three Planetary Spheres (Earth, Moon, Mars) */}
            <div className="lg:col-span-5 relative flex justify-center items-center min-h-[340px] sm:min-h-[420px]">
              <GlassPanel className="relative w-full max-w-md p-8 border border-border/80 flex flex-col items-center justify-center overflow-hidden">
                {/* Background planetary glow */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* SVG & CSS Procedural Planetary Spheres */}
                <div className="relative w-72 h-72 flex items-center justify-center">
                  {/* Orbit track ring */}
                  <div className="absolute w-64 h-64 rounded-full border border-border/40 border-dashed animate-[spin_60s_linear_infinite]" />

                  {/* EARTH (Center Primary) */}
                  <div className="relative z-20 w-32 h-32 rounded-full shadow-[0_0_35px_rgba(34,211,238,0.35)] animate-float-slow flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#0284C7] to-[#064E3B] border border-cyan-400/40">
                    <svg className="w-full h-full opacity-60 mix-blend-screen" viewBox="0 0 100 100">
                      <path d="M20,35 Q40,15 65,30 Q80,45 60,65 Q45,75 25,60 Z" fill="#10B981" />
                      <path d="M55,60 Q75,70 85,55 Q95,80 70,85 Q50,90 55,60 Z" fill="#059669" />
                      <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    </svg>
                    <span className="absolute bottom-2 text-[10px] font-mono font-bold tracking-widest text-cyan-200 uppercase bg-black/40 px-1.5 rounded">
                      Earth
                    </span>
                  </div>

                  {/* MOON (Floating Upper Left) */}
                  <div className="absolute -top-1 -left-1 z-30 w-16 h-16 rounded-full shadow-[0_0_20px_rgba(203,213,225,0.25)] animate-float-medium flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#64748B] via-[#475569] to-[#1E293B] border border-slate-400/40">
                    <svg className="w-full h-full opacity-40" viewBox="0 0 50 50">
                      <circle cx="15" cy="18" r="4" fill="#334155" />
                      <circle cx="32" cy="28" r="6" fill="#1E293B" />
                      <circle cx="24" cy="38" r="3" fill="#334155" />
                    </svg>
                    <span className="absolute bottom-1 text-[8px] font-mono font-semibold tracking-wider text-slate-300 uppercase">
                      Moon
                    </span>
                  </div>

                  {/* MARS (Floating Lower Right) */}
                  <div className="absolute -bottom-2 -right-2 z-10 w-24 h-24 rounded-full shadow-[0_0_25px_rgba(234,88,12,0.3)] animate-float-slow flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#EA580C] via-[#C2410C] to-[#7C2D12] border border-orange-400/40">
                    <svg className="w-full h-full opacity-50 mix-blend-overlay" viewBox="0 0 80 80">
                      <path d="M10,25 Q30,10 60,35 Q70,55 45,70 Q20,65 10,25 Z" fill="#78350F" />
                      <circle cx="45" cy="30" r="5" fill="#451A03" />
                    </svg>
                    <span className="absolute bottom-1.5 text-[9px] font-mono font-bold tracking-widest text-amber-200 uppercase bg-black/40 px-1 rounded">
                      Mars
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-xs font-mono text-text-muted">
                    Reference Planetary System
                  </div>
                  <div className="text-[11px] text-text-muted/60 mt-0.5">
                    Original procedural rendering • No agency imagery
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RESEARCH OBJECTIVE SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassPanel className="text-center py-10 px-6 sm:px-12 space-y-4 border-accent-cyan/30 bg-gradient-to-b from-panel/90 to-raised/60">
          <span className="text-xs font-mono font-bold tracking-widest text-accent-cyan uppercase px-3 py-1 rounded bg-cyan-950/60 border border-cyan-800">
            Primary Scientific Objective
          </span>
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-text-primary leading-tight pt-2">
            "Given a selected region on Mars or the Moon, which locations on Earth have comparable terrain characteristics?"
          </blockquote>
          <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed pt-2">
            ASTRA-X extracts quantitative topographic morphology—relative elevation, slope, and roughness—from open orbital altimetry, performing transparent multi-attribute similarity matching against terrestrial terrains.
          </p>
        </GlassPanel>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
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

      {/* 4. CORE CAPABILITIES (6 MODULES) */}
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

      {/* 5. FEATURED DISCOVERIES SECTION (HIDDEN COMPLETELY WHEN EMPTY) */}
      {featuredAnalogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeading
            kicker="Curated Matches"
            title="Featured Terrestrial Discoveries"
            subtitle="Verified terrestrial analog matches derived from open elevation dataset comparisons."
            align="center"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAnalogs.map((item) => (
              <Card key={item.id} className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-text-muted">
                  <span>Target: {item.target_planet}</span>
                  <Badge variant="derived">Score: {(item.similarity_score * 100).toFixed(1)}%</Badge>
                </div>
                <h3 className="text-lg font-heading font-bold text-text-primary">{item.earth_analog_name}</h3>
                <p className="text-xs text-text-muted">Analog for {item.target_region_name}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 6. DATASET SOURCES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          kicker="Provenance & Integrity"
          title="Open Planetary Dataset Sources"
          subtitle="Every terrain feature is computed exclusively from publicly accessible elevation and imagery archives. Status is linked to active database ingestion."
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Earth Datasets */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold text-text-primary flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Earth Observation</span>
              </h3>
              <span className="text-xs font-mono text-text-muted">Reference Planet</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">NASADEM / SRTM</div>
                  <div className="text-xs text-text-muted">Global 30m Digital Elevation Model</div>
                </div>
                <Badge variant={getDatasetStatus("NASADEM")}>{getDatasetStatus("NASADEM")}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">Copernicus GLO-30</div>
                  <div className="text-xs text-text-muted">High-precision 30m global DSM</div>
                </div>
                <Badge variant={getDatasetStatus("Copernicus")}>{getDatasetStatus("Copernicus")}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">Landsat & ASTER</div>
                  <div className="text-xs text-text-muted">Multispectral and thermal surface baseline</div>
                </div>
                <Badge variant={getDatasetStatus("Landsat")}>{getDatasetStatus("Landsat")}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">MODIS & EMIT</div>
                  <div className="text-xs text-text-muted">Surface mineralogy and spectral reflectance</div>
                </div>
                <Badge variant={getDatasetStatus("EMIT")}>{getDatasetStatus("EMIT")}</Badge>
              </li>
            </ul>
          </Card>

          {/* Moon Datasets */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold text-text-primary flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Lunar Observations</span>
              </h3>
              <span className="text-xs font-mono text-text-muted">Moon</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">LOLA (LRO)</div>
                  <div className="text-xs text-text-muted">Lunar Orbiter Laser Altimeter DEM</div>
                </div>
                <Badge variant={getDatasetStatus("LOLA")}>{getDatasetStatus("LOLA")}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">LROC NAC / WAC</div>
                  <div className="text-xs text-text-muted">High-resolution surface morphology</div>
                </div>
                <Badge variant={getDatasetStatus("LROC")}>{getDatasetStatus("LROC")}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">Diviner Radiometer</div>
                  <div className="text-xs text-text-muted">Thermal properties and rock abundance</div>
                </div>
                <Badge variant={getDatasetStatus("Diviner")}>{getDatasetStatus("Diviner")}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">Moon Mineralogy Mapper (M³)</div>
                  <div className="text-xs text-text-muted">Hyperspectral mineral characterization</div>
                </div>
                <Badge variant={getDatasetStatus("M3")}>{getDatasetStatus("M3")}</Badge>
              </li>
            </ul>
          </Card>

          {/* Mars Datasets */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold text-text-primary flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Martian Observations</span>
              </h3>
              <span className="text-xs font-mono text-text-muted">Mars</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">MOLA (MGS)</div>
                  <div className="text-xs text-text-muted">Mars Orbiter Laser Altimeter DEM (463m/px)</div>
                </div>
                <Badge variant={getDatasetStatus("MOLA")}>{getDatasetStatus("MOLA")}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">CTX (MRO)</div>
                  <div className="text-xs text-text-muted">Context Camera 6m/pixel regional DEMs</div>
                </div>
                <Badge variant={getDatasetStatus("CTX")}>{getDatasetStatus("CTX")}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">HiRISE (MRO)</div>
                  <div className="text-xs text-text-muted">Sub-meter micro-topography & boulder fields</div>
                </div>
                <Badge variant={getDatasetStatus("HiRISE")}>{getDatasetStatus("HiRISE")}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">THEMIS & CRISM</div>
                  <div className="text-xs text-text-muted">Infrared thermal inertia and mineralogy</div>
                </div>
                <Badge variant={getDatasetStatus("CRISM")}>{getDatasetStatus("CRISM")}</Badge>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassPanel className="text-center py-12 px-6 sm:px-12 space-y-6 border-accent-cyan/40 bg-gradient-to-r from-panel via-raised to-panel">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
            Ready to Discover Analog Terrains?
          </h2>
          <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto leading-relaxed">
            Begin by selecting a reference crater, plain, or volcanic structure on Mars or the Moon to evaluate against Earth's topography.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link to="/discovery">
              <Button variant="primary" size="lg">
                Launch the explorer
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg">
                Explore Scientific Methodology
              </Button>
            </Link>
          </div>
        </GlassPanel>
      </section>
    </div>
  );
};
