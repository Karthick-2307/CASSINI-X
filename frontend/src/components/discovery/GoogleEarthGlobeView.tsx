import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CandidateMatch } from "../../api/client";
import { getBasemapStyle, BASEMAP_OPTIONS } from "../map/mapStyles";
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
  const isSpinningRef = useRef<boolean>(true);
  const animFrameIdRef = useRef<number | null>(null);

  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [currentBasemap, setCurrentBasemap] = useState<string>("google-satellite");
  const [showPopupCard, setShowPopupCard] = useState<boolean>(true);

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter: [number, number] = selectedCandidate
      ? [selectedCandidate.lon, selectedCandidate.lat]
      : [-20.0, 20.0];
    const initialZoom = selectedCandidate ? 7.5 : 2.5;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getBasemapStyle("earth", currentBasemap),
      center: initialCenter,
      zoom: initialZoom,
      pitch: 25,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }), "bottom-left");

    mapRef.current = map;

    // Continuous idle spin animation loop ("Google Earth spin normal")
    const spinLoop = () => {
      if (isSpinningRef.current && mapRef.current) {
        const center = mapRef.current.getCenter();
        center.lng = (center.lng + 0.08) % 360;
        mapRef.current.setCenter(center);
      }
      animFrameIdRef.current = requestAnimationFrame(spinLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(spinLoop);

    // Stop rotation when user manually drags or interacts
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

  // Toggle Spin
  const toggleSpin = () => {
    const nextState = !isSpinning;
    isSpinningRef.current = nextState;
    setIsSpinning(nextState);
  };

  // Smooth cinematic camera flyTo when selected candidate changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCandidate) return;

    // Stop idle spin when flying to a specific candidate
    isSpinningRef.current = false;
    setIsSpinning(false);
    setShowPopupCard(true);

    map.flyTo({
      center: [selectedCandidate.lon, selectedCandidate.lat],
      zoom: 8.5,
      speed: 1.2,
      curve: 1.4,
      pitch: 35,
      essential: true,
    });
  }, [selectedCandidate]);

  // Update Candidate Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (candidates.length === 0) return;

    candidates.forEach((cand) => {
      const isSelected = selectedCandidate?.id === cand.id;
      const el = document.createElement("div");

      let pinColor = "#38BDF8";
      if (cand.similarity >= 85) pinColor = "#34D399";
      else if (cand.similarity >= 70) pinColor = "#38BDF8";
      else if (cand.similarity >= 50) pinColor = "#FBBF24";
      else pinColor = "#F87171";

      el.className = `w-4 h-4 rounded-full border-2 border-white cursor-pointer transition-transform duration-200 shadow-md flex items-center justify-center ${
        isSelected ? "scale-150 z-30 ring-4 ring-[#38BDF8]" : "z-20 hover:scale-125"
      }`;
      el.style.backgroundColor = pinColor;

      el.addEventListener("click", () => {
        onSelectCandidate(cand);
      });

      const marker = new maplibregl.Marker({ element: el })
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
      {selectedCandidate && showPopupCard && (
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
              <span>View Why It Matches &amp; Statistics Graph</span>
              <span>↓</span>
            </Button>
          )}
        </div>
      )}

      {/* Similarity Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-3 z-10 hidden sm:block pointer-events-none">
        <div className="bg-[#111826]/90 border border-[#243044] rounded p-2.5 text-[10px] font-mono backdrop-blur-sm space-y-1 text-[#94A3B8] shadow-md">
          <div className="text-[#F8FAFC] font-semibold text-[11px] pb-1 border-b border-[#243044]">
            Similarity Scale
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
            <span className="text-[#E5E7EB]">&ge; 85% High Match</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
            <span className="text-[#E5E7EB]">70% – 85% Strong Match</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
            <span className="text-[#E5E7EB]">50% – 70% Moderate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
