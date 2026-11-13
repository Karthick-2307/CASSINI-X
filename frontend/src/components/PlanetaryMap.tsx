import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CandidateMatch, TerrainBounds, api } from "../api/client";

export interface PlanetaryMapProps {
  planet: "earth" | "moon" | "mars";
  candidates?: CandidateMatch[];
  selectedCandidateId?: number | null;
  onSelectCandidate?: (candidate: CandidateMatch) => void;
  activeRegionId?: number | null;
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

  // Determine initial center and zoom per body
  const getInitialViewport = useCallback((): { center: [number, number]; zoom: number } => {
    switch (planet) {
      case "mars":
        return { center: [77.58, 18.38], zoom: 8.5 }; // Jezero Crater
      case "moon":
        return { center: [31.4, 8.5], zoom: 8.0 }; // Mare Tranquillitatis
      case "earth":
      default:
        return { center: [-13.63, 29.03], zoom: 7.5 }; // Lanzarote / Global
    }
  }, [planet]);

  // Load bounds for planetary raster overlays when region changes
  useEffect(() => {
    if (activeRegionId) {
      api.getTerrainBounds(activeRegionId)
        .then((b) => setOverlayBounds(b))
        .catch(() => setOverlayBounds(null));
    } else {
      setOverlayBounds(null);
    }
  }, [activeRegionId]);

  // Initialize MapLibre instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const { center, zoom } = getInitialViewport();

    // Map style definition
    const style: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        ...(planet === "earth"
          ? {
              "carto-dark": {
                type: "raster",
                tiles: [
                  "https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
                  "https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
                  "https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
                ],
                tileSize: 256,
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
              },
            }
          : {}),
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": "#070B14",
          },
        },
        ...(planet === "earth"
          ? [
              {
                id: "carto-dark-layer",
                type: "raster" as const,
                source: "carto-dark",
                minzoom: 0,
                maxzoom: 19,
              },
            ]
          : []),
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style,
      center,
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }), "bottom-left");

    // Track mouse coordinates under cursor
    map.on("mousemove", (e) => {
      setCursorCoords({
        lat: Number(e.lngLat.lat.toFixed(4)),
        lon: Number(e.lngLat.lng.toFixed(4)),
      });
    });

    // Box selection handling
    map.on("mousedown", (e) => {
      if (e.originalEvent.shiftKey) {
        setIsDrawingBbox(true);
        setBboxStart([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    map.on("mouseup", (e) => {
      if (isDrawingBbox && bboxStart) {
        const endLon = e.lngLat.lng;
        const endLat = e.lngLat.lat;
        const minLon = Math.min(bboxStart[0], endLon);
        const maxLon = Math.max(bboxStart[0], endLon);
        const minLat = Math.min(bboxStart[1], endLat);
        const maxLat = Math.max(bboxStart[1], endLat);

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

  // Center map when planet or overlay bounds change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (overlayBounds) {
      map.flyTo({
        center: overlayBounds.center,
        zoom: planet === "earth" ? 8.5 : 9.0,
        essential: true,
      });
    } else {
      const { center, zoom } = getInitialViewport();
      map.flyTo({ center, zoom, essential: true });
    }
  }, [overlayBounds, planet, getInitialViewport]);

  // Add or update Hillshade and Slope Image Overlay Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !overlayBounds || !activeRegionId) return;

    const hillshadeSourceId = `hillshade-src-${activeRegionId}`;
    const hillshadeLayerId = `hillshade-lyr-${activeRegionId}`;
    const slopeSourceId = `slope-src-${activeRegionId}`;
    const slopeLayerId = `slope-lyr-${activeRegionId}`;

    // Hillshade Layer
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

    // Slope Layer
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
  }, [overlayBounds, activeRegionId, showHillshade, showSlope]);

  // Render Candidate Markers on Earth
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (candidates.length === 0) return;

    candidates.forEach((cand, idx) => {
      const isSelected = selectedCandidateId === cand.id;
      const el = document.createElement("div");

      // Dynamic color by similarity
      let colorClass = "bg-accent-cyan";
      let borderClass = "border-white";
      if (cand.similarity >= 85) {
        colorClass = "bg-status-ok";
      } else if (cand.similarity >= 70) {
        colorClass = "bg-accent-cyan";
      } else if (cand.similarity >= 50) {
        colorClass = "bg-status-warn";
      } else {
        colorClass = "bg-status-danger";
      }

      el.className = `w-4 h-4 rounded-full ${colorClass} border-2 ${
        isSelected ? "ring-4 ring-accent-cyan scale-125 border-white" : borderClass
      } shadow-glow cursor-pointer transition-transform duration-150`;

      el.addEventListener("click", () => {
        onSelectCandidate?.(cand);
      });

      const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
        <div style="color: #070B14; font-family: monospace; font-size: 11px; padding: 4px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 2px;">#${idx + 1} ${cand.location_name}</div>
          <div>Lat: ${cand.lat.toFixed(3)}°, Lon: ${cand.lon.toFixed(3)}°</div>
          <div style="color: #0284C7; font-weight: bold; margin-top: 2px;">Similarity: ${cand.similarity.toFixed(1)}%</div>
          <div style="color: #10B981; font-weight: bold;">Confidence: ${cand.confidence.toFixed(1)}%</div>
          ${cand.is_anomaly ? '<div style="color: #D97706; font-size: 10px; margin-top: 2px;">[Statistically unusual feature combination]</div>' : ''}
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([cand.lon, cand.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [candidates, selectedCandidateId, onSelectCandidate]);

  return (
    <div className={`relative w-full rounded-panel overflow-hidden border border-border bg-base ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Coordinate & Scale HUD overlay */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="bg-panel/90 border border-border rounded-btn px-2.5 py-1 text-[11px] font-mono text-text-muted backdrop-blur-sm shadow-sm flex items-center space-x-3">
          <span>
            {cursorCoords
              ? `Cursor: ${cursorCoords.lat.toFixed(4)}°, ${cursorCoords.lon.toFixed(4)}°`
              : "Move cursor over map"}
          </span>
          <span className="text-text-muted/40">|</span>
          <span className="capitalize">{planet} Viewport</span>
        </div>
      </div>

      {/* Real Ingested Overlay Provenance Tag */}
      {overlayBounds && (
        <div className="absolute top-2 left-2 z-10 pointer-events-none max-w-xs">
          <div className="bg-panel/95 border border-border rounded-btn p-2 text-[10px] font-mono text-text-muted backdrop-blur-sm space-y-0.5 shadow-md">
            <div className="font-bold text-text-primary text-[11px]">
              {overlayBounds.dataset_name}
            </div>
            <div>Resolution: {overlayBounds.resolution_m}m | Source: {overlayBounds.source}</div>
            <div className="text-accent-cyan">Active DEM Overlay: {overlayBounds.name}</div>
          </div>
        </div>
      )}

      {/* Candidate Similarity Map Legend */}
      {planet === "earth" && candidates.length > 0 && (
        <div className="absolute bottom-8 left-2 z-10 pointer-events-none">
          <div className="bg-panel/95 border border-border rounded-btn p-2 text-[10px] font-mono backdrop-blur-sm space-y-1 shadow-md">
            <div className="text-text-primary font-bold">Similarity Legend</div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-ok" />
              <span className="text-text-muted">&ge; 85% High Match</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan" />
              <span className="text-text-muted">70% &ndash; 85% Strong</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-warn" />
              <span className="text-text-muted">50% &ndash; 70% Moderate</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-danger" />
              <span className="text-text-muted">&lt; 50% Low Match</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
