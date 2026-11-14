import { geoOrthographic, geoPath, geoGraticule10 } from "d3-geo";
import * as topojson from "topojson-client";
import landJson from "world-atlas/land-110m.json";

export type GlobePlanet = "earth" | "moon" | "mars";

// Pre-convert TopoJSON land to GeoJSON FeatureCollection once
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const earthLand = topojson.feature(landJson as any, (landJson as any).objects.land);
const graticule = geoGraticule10();
const sphere = { type: "Sphere" as const };

export interface GlobeState {
  yaw: number;
  pitch: number;
  isDragging: boolean;
  activePlanet: GlobePlanet;
}

export function drawAmChartsGlobe(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: GlobeState
): void {
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.40;

  // Orthographic projection configured like amCharts Rotating Globe
  const projection = geoOrthographic()
    .translate([cx, cy])
    .scale(r)
    .clipAngle(90)
    .rotate([state.yaw, state.pitch, 0]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const path = geoPath(projection as any, ctx);

  // 1. Atmosphere Halo / External Glow (amCharts distinctive glow)
  ctx.save();
  const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.15);
  if (state.activePlanet === "earth") {
    glowGrad.addColorStop(0, "rgba(59, 130, 246, 0.35)");
    glowGrad.addColorStop(0.5, "rgba(14, 165, 233, 0.15)");
    glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  } else if (state.activePlanet === "mars") {
    glowGrad.addColorStop(0, "rgba(234, 88, 12, 0.35)");
    glowGrad.addColorStop(0.5, "rgba(249, 115, 22, 0.15)");
    glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  } else {
    glowGrad.addColorStop(0, "rgba(148, 163, 184, 0.3)");
    glowGrad.addColorStop(0.5, "rgba(203, 213, 225, 0.1)");
    glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  }
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Ocean / Sphere Background
  ctx.save();
  ctx.beginPath();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  path(sphere as any);
  if (state.activePlanet === "earth") {
    // amCharts Clean Ocean Gradient
    const oceanGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    oceanGrad.addColorStop(0, "#eff6ff"); // soft azure highlight
    oceanGrad.addColorStop(0.6, "#dbeafe"); // crisp amCharts ocean
    oceanGrad.addColorStop(1, "#bfdbfe"); // shaded limb
    ctx.fillStyle = oceanGrad;
  } else if (state.activePlanet === "mars") {
    const marsGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    marsGrad.addColorStop(0, "#ffedd5");
    marsGrad.addColorStop(0.6, "#fed7aa");
    marsGrad.addColorStop(1, "#fdba74");
    ctx.fillStyle = marsGrad;
  } else {
    const moonGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    moonGrad.addColorStop(0, "#f8fafc");
    moonGrad.addColorStop(0.6, "#f1f5f9");
    moonGrad.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = moonGrad;
  }
  ctx.fill();
  ctx.restore();

  // 3. Graticule (Latitude & Longitude Grid Lines)
  ctx.save();
  ctx.beginPath();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  path(graticule as any);
  ctx.lineWidth = 0.75;
  ctx.strokeStyle =
    state.activePlanet === "earth"
      ? "rgba(37, 99, 235, 0.22)"
      : state.activePlanet === "mars"
      ? "rgba(194, 65, 12, 0.22)"
      : "rgba(100, 116, 139, 0.22)";
  ctx.stroke();
  ctx.restore();

  // 4. Continents / Vector Landmasses
  ctx.save();
  ctx.beginPath();
  if (state.activePlanet === "earth") {
    // Exact amCharts Earth Continent polygons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    path(earthLand as any);
    ctx.fillStyle = "#2563eb"; // amCharts royal blue continents
    ctx.fill();

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#1d4ed8";
    ctx.stroke();
  } else if (state.activePlanet === "mars") {
    // Martian procedural craters and Tharsis volcanic highlands
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    path(earthLand as any);
    ctx.fillStyle = "#c2410c"; // Martian oxide orange/red
    ctx.fill();

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#9a3412";
    ctx.stroke();
  } else {
    // Lunar basaltic maria polygons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    path(earthLand as any);
    ctx.fillStyle = "#475569"; // Lunar dark basalt maria
    ctx.fill();

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#334155";
    ctx.stroke();
  }
  ctx.restore();

  // 5. 3D Spherical Shadow Overlay (amCharts smooth day/night terminator shading)
  ctx.save();
  ctx.beginPath();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  path(sphere as any);
  ctx.clip();

  const shadowGrad = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.45, r * 0.1, cx, cy, r);
  shadowGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
  shadowGrad.addColorStop(0.4, "rgba(255, 255, 255, 0)");
  shadowGrad.addColorStop(0.75, "rgba(15, 23, 42, 0.08)");
  shadowGrad.addColorStop(1, "rgba(15, 23, 42, 0.38)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Crisp Sphere Perimeter Border
  ctx.save();
  ctx.beginPath();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  path(sphere as any);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle =
    state.activePlanet === "earth"
      ? "#3b82f6"
      : state.activePlanet === "mars"
      ? "#f97316"
      : "#94a3b8";
  ctx.stroke();
  ctx.restore();
}

