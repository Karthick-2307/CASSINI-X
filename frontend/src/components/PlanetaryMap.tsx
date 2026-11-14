import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CandidateMatch, TerrainBounds, api } from "../api/client";
import {
  MapLegend,
  ProvenanceTag,
  BasemapSelector,
  MapHud,
  PlanetType,
  BASEMAP_OPTIONS,
  getBasemapStyle,
} from "./map";

export interface PlanetaryMapProps {
  planet: PlanetType;
  candidates?: CandidateMatch[];
  selectedCandidateId?: number | null;
  onSelectCandidate?: (candidate: CandidateMatch) => void;
  activeRegionId?: number | null;
  targetCoords?: { lon: number; lat: number; zoom?: number } | null;
  showHillshade?: boolean;
  showSlope?: boolean;
  onBboxSelected?: (bbox: [number, number, number, number]) => void;
  className?: string;
}

export const PlanetaryMap: React.FC<PlanetaryMapProps> = ({
  planet,
  candidates = [],
  selectedCandidateId = null,
  onSelectCandidate,
  activeRegionId = null,
  targetCoords = null,
  showHillshade = true,
  showSlope = false,
  onBboxSelected,
  className = "",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [overlayBounds, setOverlayBounds] = useState<TerrainBounds | null>(null);
  const [isDrawingBbox, setIsDrawingBbox] = useState(false);
  const [bboxStart, setBboxStart] = useState<[number, number] | null>(null);

  const [currentBasemapId, setCurrentBasemapId] = useState<string>(
    BASEMAP_OPTIONS[planet]?.[0]?.id || "google-satellite"
  );

  useEffect(() => {
    setCurrentBasemapId(BASEMAP_OPTIONS[planet]?.[0]?.id || "google-satellite");
  }, [planet]);

  const getInitialViewport = useCallback((): { center: [number, number]; zoom: number } => {
    switch (planet) {
      case "mars":
        return { center: [77.58, 18.38], zoom: 8.5 };
      case "moon":
        return { center: [31.4, 8.5], zoom: 8.0 };
      case "earth":
      default:
        return { center: [-13.63, 29.03], zoom: 7.5 };
    }
  }, [planet]);

  useEffect(() => {
    if (activeRegionId) {
      api.getTerrainBounds(activeRegionId)
        .then((b) => setOverlayBounds(b))
        .catch(() => setOverlayBounds(null));
    } else {
      setOverlayBounds(null);
    }
  }, [activeRegionId]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const { center, zoom } = getInitialViewport();
    const style = getBasemapStyle(planet, currentBasemapId);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style,
      center,
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }), "bottom-left");

    map.on("mousemove", (e) => {
      setCursorCoords({
        lat: Number(e.lngLat.lat.toFixed(4)),
        lon: Number(e.lngLat.lng.toFixed(4)),
      });
    });

    map.on("mousedown", (e) => {
      if (e.originalEvent.shiftKey) {
        setIsDrawingBbox(true);
        setBboxStart([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    map.on("mouseup", (e) => {
      if (isDrawingBbox && bboxStart) {
        const minLon = Math.min(bboxStart[0], e.lngLat.lng);
        const maxLon = Math.max(bboxStart[0], e.lngLat.lng);
        const minLat = Math.min(bboxStart[1], e.lngLat.lat);
        const maxLat = Math.max(bboxStart[1], e.lngLat.lat);

        if (Math.abs(maxLon - minLon) > 0.01 && Math.abs(maxLat - minLat) > 0.01) {
          onBboxSelected?.([minLon, minLat, maxLon, maxLat]);
        }
        setIsDrawingBbox(false);
        setBboxStart(null);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [planet, getInitialViewport]);

  const handleSelectBasemap = (newBasemapId: string) => {
    setCurrentBasemapId(newBasemapId);
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(getBasemapStyle(planet, newBasemapId));
  };

  // Fly to active region terrain bounds if present and not earth with candidates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (overlayBounds && candidates.length === 0) {
      map.flyTo({
        center: overlayBounds.center,
        zoom: planet === "earth" ? 8.5 : 9.0,
        essential: true,
      });
    }
  }, [overlayBounds, planet, candidates.length]);

  // Fly to target coordinates (from search or gazetteer)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !targetCoords) return;
    if (!isNaN(targetCoords.lon) && !isNaN(targetCoords.lat)) {
      map.flyTo({
        center: [targetCoords.lon, targetCoords.lat],
        zoom: targetCoords.zoom || (planet === "earth" ? 8.0 : 8.5),
        speed: 1.4,
        essential: true,
      });
    }
  }, [targetCoords, planet]);

  // Automatically fly to selected candidate location when selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCandidateId || candidates.length === 0) return;

    const cand = candidates.find((c) => c.id === selectedCandidateId);
    if (cand && !isNaN(cand.lon) && !isNaN(cand.lat)) {
      map.flyTo({
        center: [cand.lon, cand.lat],
        zoom: 8.5,
        speed: 1.3,
        essential: true,
      });

      // Open popup for selected candidate
      markersRef.current.forEach((m) => {
        const p = m.getLngLat();
        if (Math.abs(p.lng - cand.lon) < 0.005 && Math.abs(p.lat - cand.lat) < 0.005) {
          if (!m.getPopup()?.isOpen()) m.togglePopup();
        } else if (m.getPopup()?.isOpen()) {
          m.togglePopup();
        }
      });
    }
  }, [selectedCandidateId, candidates]);

  // Fit bounds to candidates when candidates list updates and no single candidate is selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || candidates.length === 0) return;

    if (!selectedCandidateId) {
      if (candidates.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        candidates.forEach((c) => bounds.extend([c.lon, c.lat]));
        map.fitBounds(bounds, { padding: 50, maxZoom: 8, essential: true });
      } else if (candidates.length === 1) {
        map.flyTo({ center: [candidates[0].lon, candidates[0].lat], zoom: 8.0, essential: true });
      }
    }
  }, [candidates, selectedCandidateId]);

  // Handle overlay layers (hillshade & slope)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !overlayBounds || !activeRegionId) return;

    const applyOverlays = () => {
      const hillshadeSourceId = `hillshade-src-${activeRegionId}`;
      const hillshadeLayerId = `hillshade-lyr-${activeRegionId}`;
      const slopeSourceId = `slope-src-${activeRegionId}`;
      const slopeLayerId = `slope-lyr-${activeRegionId}`;

      if (showHillshade) {
        if (!map.getSource(hillshadeSourceId)) {
          map.addSource(hillshadeSourceId, {
            type: "image",
            url: api.getHillshadeUrl(activeRegionId),
            coordinates: overlayBounds.coordinates,
          });
        }
        if (!map.getLayer(hillshadeLayerId)) {
          map.addLayer({
            id: hillshadeLayerId,
            type: "raster",
            source: hillshadeSourceId,
            paint: { "raster-opacity": 0.85 },
          });
        }
      } else {
        if (map.getLayer(hillshadeLayerId)) map.removeLayer(hillshadeLayerId);
        if (map.getSource(hillshadeSourceId)) map.removeSource(hillshadeSourceId);
      }

      if (showSlope) {
        if (!map.getSource(slopeSourceId)) {
          map.addSource(slopeSourceId, {
            type: "image",
            url: api.getSlopeUrl(activeRegionId),
            coordinates: overlayBounds.coordinates,
          });
        }
        if (!map.getLayer(slopeLayerId)) {
          map.addLayer({
            id: slopeLayerId,
            type: "raster",
            source: slopeSourceId,
            paint: { "raster-opacity": 0.75 },
          });
        }
      } else {
        if (map.getLayer(slopeLayerId)) map.removeLayer(slopeLayerId);
        if (map.getSource(slopeSourceId)) map.removeSource(slopeSourceId);
      }
    };

    if (map.isStyleLoaded()) {
      applyOverlays();
    } else {
      map.once("style.load", applyOverlays);
    }
  }, [overlayBounds, activeRegionId, showHillshade, showSlope, currentBasemapId]);

  // Render Candidate Pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (candidates.length === 0) return;

    candidates.forEach((cand, idx) => {
      const isSelected = selectedCandidateId === cand.id;
      const el = document.createElement("div");

      let colorClass = "bg-accent-cyan";
      if (cand.similarity >= 85) {
        colorClass = "bg-emerald-400";
      } else if (cand.similarity >= 70) {
        colorClass = "bg-sky-400";
      } else if (cand.similarity >= 50) {
        colorClass = "bg-amber-400";
      } else {
        colorClass = "bg-rose-400";
      }

      el.className = `w-4 h-4 rounded-full ${colorClass} border-2 border-white ${
        isSelected ? "ring-4 ring-sky-400 scale-125 z-30" : "z-20"
      } shadow-glow cursor-pointer transition-transform duration-150`;

      el.addEventListener("click", () => {
        onSelectCandidate?.(cand);
      });

      const popup = new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(`
        <div style="font-family: monospace; font-size: 11px; padding: 2px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 2px; color: #ffffff;">#${idx + 1} ${cand.location_name}</div>
          <div style="color: #94a3b8;">Lat: ${cand.lat.toFixed(3)}°, Lon: ${cand.lon.toFixed(3)}°</div>
          <div style="margin-top: 4px; font-weight: 700; color: #38bdf8;">Similarity: ${cand.similarity.toFixed(1)}%</div>
          <div style="color: #34d399; font-weight: 600;">Confidence: ${cand.confidence.toFixed(1)}%</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([cand.lon, cand.lat])
        .setPopup(popup)
        .addTo(map);

      if (isSelected) {
        marker.togglePopup();
      }

      markersRef.current.push(marker);
    });
  }, [candidates, selectedCandidateId, onSelectCandidate]);

  return (
    <div className={`relative w-full rounded-panel overflow-hidden border border-border shadow-panel bg-[#070B14] ${className}`}>
      <BasemapSelector
        planet={planet}
        currentBasemapId={currentBasemapId}
        onSelectBasemap={handleSelectBasemap}
      />
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />
      {overlayBounds && <ProvenanceTag overlayBounds={overlayBounds} />}
      {candidates.length > 0 && <MapLegend />}
      <MapHud cursorCoords={cursorCoords} isDrawingBbox={isDrawingBbox} />
    </div>
  );
};
