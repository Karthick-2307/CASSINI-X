import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CandidateMatch } from "../../api/client";
import { getAnalogSiteImage } from "../../lib/analogImages";
import { getBasemapStyle } from "../map/mapStyles";
import { Badge, Button } from "../ui";

export interface LocationImagePopoutProps {
  candidate: CandidateMatch;
  targetRegionName?: string;
  uploadedImageUrl?: string | null;
  onScrollToDetails?: () => void;
  onClose?: () => void;
}

export const LocationImagePopout: React.FC<LocationImagePopoutProps> = ({
  candidate,
  targetRegionName = "Planetary Target",
  uploadedImageUrl,
  onScrollToDetails,
  onClose,
}) => {
  const analogImg = getAnalogSiteImage(candidate.location_name, candidate.lat, candidate.lon);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [viewMode, setViewMode] = useState<"interactive" | "tile">("interactive");
  const [pitch, setPitch] = useState<number>(35);

  const googleEarthUrl = `https://earth.google.com/web/@${candidate.lat},${candidate.lon},0a,5000d,35y,0h,0t,0r`;
  const googleMapsUrl = `https://www.google.com/maps/@${candidate.lat},${candidate.lon},14z/data=!3m1!1e3`;

  // Initialize and update MapLibre satellite viewport for the selected analog candidate
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getBasemapStyle("earth", "google-satellite"),
        center: [candidate.lon, candidate.lat],
        zoom: 12.5,
        pitch: pitch,
        bearing: 0,
        attributionControl: false,
      });

      // Standard map location pin icon pointing to candidate coordinates
      const el = document.createElement("div");
      el.className = "analog-map-pin";
      el.innerHTML = `
        <div style="cursor: pointer; pointer-events: auto; transform: translateY(0); transition: transform 0.2s ease;">
          <svg width="30" height="40" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.7)); display: block;">
            <path d="M12 0C5.372 0 0 5.372 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.372 18.628 0 12 0Z" fill="#EF4444"/>
            <circle cx="12" cy="11.5" r="4.5" fill="#FFFFFF"/>
            <circle cx="12" cy="11.5" r="2.2" fill="#EF4444"/>
          </svg>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([candidate.lon, candidate.lat])
        .addTo(map);

      markerRef.current = marker;
      mapRef.current = map;
    } else {
      mapRef.current.flyTo({
        center: [candidate.lon, candidate.lat],
        zoom: 12.5,
        pitch: pitch,
        essential: true,
      });

      if (markerRef.current) {
        markerRef.current.setLngLat([candidate.lon, candidate.lat]);
      }
    }

    return () => {
      // Cleanup on unmount
    };
  }, [candidate.lat, candidate.lon]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleZoom = (delta: number) => {
    if (mapRef.current) {
      mapRef.current.zoomTo(mapRef.current.getZoom() + delta);
    }
  };

  const handleTogglePitch = () => {
    if (mapRef.current) {
      const nextPitch = pitch === 0 ? 45 : 0;
      setPitch(nextPitch);
      mapRef.current.easeTo({ pitch: nextPitch });
    }
  };

  return (
    <div className="relative bg-[#111826] border-2 border-[#38BDF8]/60 rounded-card p-4 sm:p-5 shadow-2xl animate-fadeIn space-y-4">
      {/* Header with Title, Similarity Badge & Direct External Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#243044]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider flex items-center space-x-1.5">
              <span>🛰️</span>
              <span>Matched Orbital Satellite Observation</span>
            </span>
            <Badge variant="active">
              {candidate.similarity.toFixed(1)}% Physical Match
            </Badge>
          </div>
          <h3 className="text-lg font-heading font-bold text-[#F8FAFC] mt-0.5">
            {candidate.location_name}
          </h3>
          <div className="text-xs font-mono text-[#94A3B8]">
            Coordinates: {candidate.lat.toFixed(4)}°N, {candidate.lon.toFixed(4)}°E • Confidence: {candidate.confidence.toFixed(1)}%
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center">
          <a
            href={googleEarthUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#162033] hover:bg-[#243044] border border-[#243044] text-[#38BDF8] text-xs font-mono transition-colors shadow-sm"
          >
            <span>Google Earth 3D</span>
            <span>↗</span>
          </a>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#162033] hover:bg-[#243044] border border-[#243044] text-[#E5E7EB] text-xs font-mono transition-colors shadow-sm"
          >
            <span>Google Maps</span>
            <span>↗</span>
          </a>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#F8FAFC] text-base p-1 leading-none rounded hover:bg-[#162033]"
              title="Close pop-out"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Real Satellite Observation (MapLibre Live View + Satellite Imagery) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="relative rounded-card overflow-hidden border border-[#243044] bg-[#070B14] shadow-lg h-72 sm:h-80">
            {/* View Mode Toggle Controls */}
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center space-x-1.5 bg-[#0B0F19]/85 backdrop-blur-md p-1 rounded border border-[#243044]">
              <button
                type="button"
                onClick={() => setViewMode("interactive")}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  viewMode === "interactive"
                    ? "bg-[#38BDF8] text-[#0B0F19] font-bold"
                    : "text-[#94A3B8] hover:text-[#F8FAFC]"
                }`}
              >
                Interactive Satellite View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("tile")}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  viewMode === "tile"
                    ? "bg-[#38BDF8] text-[#0B0F19] font-bold"
                    : "text-[#94A3B8] hover:text-[#F8FAFC]"
                }`}
              >
                Direct Tile Observation
              </button>
            </div>

            {/* Interactive Navigation Overlay (Zoom In, Zoom Out, 3D Tilt) */}
            {viewMode === "interactive" && (
              <div className="absolute top-2.5 right-2.5 z-10 flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => handleZoom(1)}
                  className="w-7 h-7 bg-[#0B0F19]/85 hover:bg-[#162033] border border-[#243044] text-[#F8FAFC] font-mono font-bold text-sm rounded flex items-center justify-center transition-colors shadow"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom(-1)}
                  className="w-7 h-7 bg-[#0B0F19]/85 hover:bg-[#162033] border border-[#243044] text-[#F8FAFC] font-mono font-bold text-sm rounded flex items-center justify-center transition-colors shadow"
                  title="Zoom Out"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={handleTogglePitch}
                  className="px-1.5 h-7 bg-[#0B0F19]/85 hover:bg-[#162033] border border-[#243044] text-[#38BDF8] font-mono text-[10px] rounded flex items-center justify-center transition-colors shadow"
                  title="Toggle 3D Tilt"
                >
                  3D
                </button>
              </div>
            )}

            {/* Interactive Satellite Canvas Container */}
            <div
              ref={mapContainerRef}
              className={`w-full h-full ${viewMode === "interactive" ? "block" : "hidden"}`}
            />

            {/* Fallback / Static High-Resolution Satellite Tile Image */}
            {viewMode === "tile" && (
              <div className="w-full h-full relative group">
                <img
                  src={analogImg.primarySatelliteUrl}
                  alt={candidate.location_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}

            {/* Bottom Overlay Gradient & Scientific Metadata */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 pointer-events-none flex flex-col justify-end">
              <div className="flex items-center justify-between text-xs font-mono text-[#F8FAFC]">
                <span className="font-semibold flex items-center space-x-1.5">
                  <span className="text-[#EF4444]">📍</span>
                  <span>{candidate.location_name}</span>
                </span>
                <span className="text-[#38BDF8] font-bold">{analogImg.resolution}</span>
              </div>
              <div className="text-[11px] font-mono text-[#94A3B8] mt-0.5 truncate">
                Source: {analogImg.provider}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#162033] border border-[#243044] text-xs font-sans text-[#E5E7EB] leading-relaxed">
            <span className="text-[#38BDF8] font-mono font-bold block mb-0.5">Geological Classification:</span>
            <span>{analogImg.geologicalFeature}</span>
          </div>
        </div>

        {/* Right Column: Comparison with Planetary Target & Morphometrics */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          {/* Target Comparison Tile */}
          <div className="p-3 rounded-card bg-[#162033] border border-[#243044] space-y-2">
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase block font-semibold">
              Compared with Planetary Target:
            </span>
            <div className="flex items-center space-x-3">
              {uploadedImageUrl ? (
                <img
                  src={uploadedImageUrl}
                  alt="Target raster observation"
                  className="w-16 h-16 rounded object-cover border border-[#38BDF8]/60 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-[#070B14] border border-[#243044] flex flex-col items-center justify-center text-xl shrink-0">
                  <span>🪐</span>
                </div>
              )}
              <div className="truncate">
                <div className="text-sm font-semibold text-[#F8FAFC] truncate">
                  {targetRegionName}
                </div>
                <div className="text-[11px] font-mono text-[#38BDF8]">
                  Physical Topography &amp; Slope Affinity: {candidate.similarity.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Morphometric Feature Comparison Numbers */}
          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            {candidate.feature_comparison.slice(0, 3).map((fc) => (
              <div key={fc.feature} className="p-2 rounded bg-[#162033] border border-[#243044]">
                <span className="text-[10px] text-[#94A3B8] uppercase block truncate">
                  {fc.feature.replace("_", " ")}
                </span>
                <span className="text-xs font-bold text-[#F8FAFC] block mt-0.5">
                  {fc.candidate_value.toFixed(1)}
                </span>
                <span className="text-[10px] text-[#34D399] block">
                  &plusmn;{Math.abs(fc.difference).toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Scientific Rationale Summary */}
          <div className="p-3 rounded bg-[#162033]/80 border border-[#243044] text-xs font-sans text-[#CBD5E1] space-y-1">
            <div className="text-[11px] font-mono font-bold text-[#34D399] flex items-center space-x-1">
              <span>✓</span>
              <span>Why it matches:</span>
            </div>
            <p className="line-clamp-3 text-[11px] text-[#94A3B8] leading-relaxed">
              {candidate.explanation.similarities[0] || analogImg.caption}
            </p>
          </div>

          {/* Jump to deep analytics */}
          {onScrollToDetails && (
            <Button
              variant="primary"
              size="sm"
              onClick={onScrollToDetails}
              className="w-full text-xs py-2 flex items-center justify-center space-x-1.5 shadow-md"
            >
              <span>Explore Detailed Elevation &amp; Slope Graphs</span>
              <span>↓</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
