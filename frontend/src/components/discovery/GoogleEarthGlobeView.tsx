import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CandidateMatch } from "../../api/client";
import { getBasemapStyle, BASEMAP_OPTIONS } from "../map/mapStyles";
import { getAnalogSiteImage } from "../../lib/analogImages";
import { Badge, Button } from "../ui";

export interface GoogleEarthGlobeViewProps {
  candidates: CandidateMatch[];
  selectedCandidate: CandidateMatch | null;
  onSelectCandidate: (candidate: CandidateMatch) => void;
  className?: string;
  onScrollToDetails?: () => void;
}

export const GoogleEarthGlobeView: React.FC<GoogleEarthGlobeViewProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  className = "",
  onScrollToDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const isSpinningRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentBasemap, setCurrentBasemap] = useState<string>("google-satellite");
  const [showPopupCard, setShowPopupCard] = useState<boolean>(true);

  // 1. Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter: [number, number] = selectedCandidate
      ? [selectedCandidate.lon, selectedCandidate.lat]
      : [-69.5, -24.0];
    const initialZoom = selectedCandidate ? 6.5 : 2.5;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getBasemapStyle("earth", currentBasemap),
      center: initialCenter,
      zoom: initialZoom,
      pitch: 30,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }), "bottom-left");

    mapRef.current = map;

    // Spin animation loop (only runs when isSpinningRef.current is true)
    const spinLoop = () => {
      if (isSpinningRef.current && mapRef.current) {
        const center = mapRef.current.getCenter();
        center.lng = (center.lng + 0.08) % 360;
        mapRef.current.setCenter(center);
      }
      animFrameIdRef.current = requestAnimationFrame(spinLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(spinLoop);

    // Stop rotation when user manually interacts with map
    const stopSpinOnUserGesture = () => {
      isSpinningRef.current = false;
      setIsSpinning(false);
    };

    map.on("dragstart", stopSpinOnUserGesture);
    map.on("zoomstart", stopSpinOnUserGesture);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Basemap Change
  const handleBasemapChange = (newId: string) => {
    setCurrentBasemap(newId);
    if (mapRef.current) {
      mapRef.current.setStyle(getBasemapStyle("earth", newId));
    }
  };

  // Toggle Spin manually
  const toggleSpin = () => {
    const nextState = !isSpinning;
    isSpinningRef.current = nextState;
    setIsSpinning(nextState);
  };

  // Smooth cinematic camera flyTo when selected candidate changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCandidate) return;

    // Disable auto-rotation when focusing a candidate site
    isSpinningRef.current = false;
    setIsSpinning(false);
    setShowPopupCard(true);

    map.flyTo({
      center: [selectedCandidate.lon, selectedCandidate.lat],
      zoom: 7.5,
      speed: 1.2,
      curve: 1.4,
      pitch: 35,
      essential: true,
    });
  }, [selectedCandidate]);

  // Update Candidate Markers (Replace generic dots with sleek aerospace target pins)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (candidates.length === 0) return;

    // Group candidates by base location name to avoid clustering identical sectors
    const uniqueSites: CandidateMatch[] = [];
    const seenNames = new Set<string>();

    candidates.forEach((cand) => {
      // Normalize base location name (e.g., strip "(Sector 2)")
      const baseName = cand.location_name.replace(/\s*\(Sector \d+\)/i, "").trim();
      if (!seenNames.has(baseName)) {
        seenNames.add(baseName);
        uniqueSites.push(cand);
      }
    });

    // Render high-tech aerospace analog pins
    uniqueSites.forEach((cand, index) => {
      const isSelected = selectedCandidate?.id === cand.id || 
        selectedCandidate?.location_name.replace(/\s*\(Sector \d+\)/i, "").trim() === 
        cand.location_name.replace(/\s*\(Sector \d+\)/i, "").trim();

      const rankNumber = index + 1;

      let accentColor = "#38BDF8";
      let badgeBg = "rgba(56, 189, 248, 0.15)";
      let borderColor = "rgba(56, 189, 248, 0.8)";
      if (cand.similarity >= 85) {
        accentColor = "#34D399";
        badgeBg = "rgba(52, 211, 153, 0.15)";
        borderColor = "rgba(52, 211, 153, 0.8)";
      } else if (cand.similarity >= 70) {
        accentColor = "#38BDF8";
        badgeBg = "rgba(56, 189, 248, 0.15)";
        borderColor = "rgba(56, 189, 248, 0.8)";
      } else if (cand.similarity >= 50) {
        accentColor = "#FBBF24";
        badgeBg = "rgba(251, 191, 36, 0.15)";
        borderColor = "rgba(251, 191, 36, 0.8)";
      } else {
        accentColor = "#F87171";
        badgeBg = "rgba(248, 113, 113, 0.15)";
        borderColor = "rgba(248, 113, 113, 0.8)";
      }

      // Create outer container element
      const el = document.createElement("div");
      el.className = "cursor-pointer select-none transition-transform duration-200";
      el.style.transformOrigin = "bottom center";

      // Build sleek target badge with site name & rank (no plain round dot!)
      const baseNameShort = cand.location_name
        .replace(/\s*\(Sector \d+\)/i, "")
        .replace("Impact Structure", "")
        .replace("Volcanic Field", "")
        .trim();

      el.innerHTML = `
        <div class="flex flex-col items-center group">
          <!-- Floating Label Pill -->
          <div style="background-color: #0B0F17; border: 1px solid ${borderColor}; color: #F8FAFC;"
               class="px-2 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap shadow-xl flex items-center space-x-1.5 mb-1 ${
                 isSelected ? "ring-2 ring-sky-400" : "opacity-90 group-hover:opacity-100"
               }">
            <span style="color: ${accentColor}; font-weight: 700;">#${rankNumber}</span>
            <span class="font-sans font-medium">${baseNameShort}</span>
            <span style="color: ${accentColor}; font-weight: 600;">${cand.similarity.toFixed(0)}%</span>
          </div>

          <!-- Aerospace Target Pin -->
          <div class="relative flex items-center justify-center">
            ${
              isSelected
                ? `<div style="border-color: ${accentColor};" class="absolute -inset-2 rounded-full border-2 animate-ping opacity-60"></div>`
                : ""
            }
            <div style="background: ${badgeBg}; border: 2px solid ${accentColor};"
                 class="w-6 h-6 rounded-md rotate-45 flex items-center justify-center shadow-lg transition-transform ${
                   isSelected ? "scale-110" : "group-hover:scale-110"
                 }">
              <div style="background-color: ${accentColor};" class="w-2 h-2 rounded-sm"></div>
            </div>
          </div>
        </div>
      `;

      el.addEventListener("click", () => {
        onSelectCandidate(cand);
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([cand.lon, cand.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [candidates, selectedCandidate, onSelectCandidate]);

  return (
    <div className={`relative w-full rounded-card overflow-hidden border border-[#243044] bg-[#070B14] shadow-md ${className}`}>
      {/* Top Bar Controls */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
        {/* Spin / Pause Toggle Button */}
        <button
          type="button"
          onClick={toggleSpin}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-btn bg-[#111826]/90 hover:bg-[#162033] border border-[#243044] text-[#F8FAFC] text-xs font-sans font-medium backdrop-blur-sm transition-colors shadow-sm"
        >
          <span>{isSpinning ? "❚❚ Pause Spin" : "▶ Spin Globe"}</span>
        </button>

        <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-[#111826]/80 border border-[#243044] text-[11px] font-mono text-[#94A3B8]">
          {isSpinning ? "Google Earth Auto-Rotation Active" : "Interactive Viewport Active"}
        </span>
      </div>

      {/* Top Right Basemap Selector */}
      <div className="absolute top-3 right-12 z-10 flex items-center bg-[#111826]/90 border border-[#243044] rounded-btn px-2.5 py-1 text-xs font-mono backdrop-blur-sm shadow-sm space-x-1.5">
        <span className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">Imagery:</span>
        <select
          value={currentBasemap}
          onChange={(e) => handleBasemapChange(e.target.value)}
          className="bg-[#162033] border border-[#243044] rounded px-2 py-0.5 text-[11px] text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8] cursor-pointer font-sans"
        >
          {BASEMAP_OPTIONS.earth.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main Map Container */}
      <div ref={mapContainerRef} className="w-full h-[480px]" />

      {/* Interactive Pop-out Card for Selected Candidate */}
      {selectedCandidate && showPopupCard && (() => {
        const analogImg = getAnalogSiteImage(selectedCandidate.location_name, selectedCandidate.lat, selectedCandidate.lon);
        return (
          <div className="absolute bottom-4 right-4 z-20 max-w-sm w-full bg-[#111826]/95 backdrop-blur-md border border-[#243044] rounded-card p-3.5 shadow-2xl space-y-2.5 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-[#38BDF8] font-bold">#1 MATCH</span>
                  <Badge variant="active">Terrestrial Analog</Badge>
                </div>
                <h4 className="text-sm font-heading font-semibold text-[#F8FAFC] mt-0.5">
                  {selectedCandidate.location_name}
                </h4>
                <div className="text-[11px] font-mono text-[#94A3B8]">
                  {selectedCandidate.lat.toFixed(4)}°N, {selectedCandidate.lon.toFixed(4)}°E
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPopupCard(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] text-sm p-1 leading-none"
                title="Close card"
              >
                &times;
              </button>
            </div>

            {/* Satellite Image Preview */}
            <div className="relative rounded overflow-hidden border border-[#243044] h-28 bg-[#070B14] group">
              <img
                src={analogImg.primarySatelliteUrl}
                alt={selectedCandidate.location_name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1.5 text-[10px] font-mono text-[#F8FAFC] flex justify-between items-center">
                <span className="truncate pr-1">{analogImg.provider}</span>
                <span className="text-[#38BDF8] shrink-0">{analogImg.resolution}</span>
              </div>
            </div>

            {/* Scores Bar */}
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2 rounded bg-[#162033] border border-[#243044]">
                <span className="text-[10px] text-[#94A3B8] uppercase block">Similarity</span>
                <span className="text-base font-bold text-[#38BDF8]">
                  {selectedCandidate.similarity.toFixed(1)}%
                </span>
              </div>
              <div className="p-2 rounded bg-[#162033] border border-[#243044]">
                <span className="text-[10px] text-[#94A3B8] uppercase block">Confidence</span>
                <span className="text-base font-bold text-[#34D399]">
                  {selectedCandidate.confidence.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Jump to match statistics below */}
            {onScrollToDetails && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onScrollToDetails}
                className="w-full text-[11px] py-1.5 flex items-center justify-center space-x-1 text-[#38BDF8] border-[#38BDF8]/40 hover:bg-[#162033]"
              >
                <span>View Full Pop-out Image &amp; Details Below</span>
                <span>↓</span>
              </Button>
            )}
          </div>
        );
      })()}

      {/* Similarity Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-3 z-10 hidden sm:block pointer-events-none">
        <div className="bg-[#111826]/90 border border-[#243044] rounded p-2.5 text-[10px] font-mono backdrop-blur-sm space-y-1 text-[#94A3B8] shadow-md">
          <div className="text-[#F8FAFC] font-semibold text-[11px] pb-1 border-b border-[#243044]">
            Similarity Scale
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-sm rotate-45 border border-[#34D399] bg-[#34D399]/30" />
            <span className="text-[#E5E7EB]">&ge; 85% High Match</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-sm rotate-45 border border-[#38BDF8] bg-[#38BDF8]/30" />
            <span className="text-[#E5E7EB]">70% – 85% Strong Match</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-sm rotate-45 border border-[#FBBF24] bg-[#FBBF24]/30" />
            <span className="text-[#E5E7EB]">50% – 70% Moderate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
