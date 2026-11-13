import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface CandidateLocation {
  id: number;
  name: string;
  lat: number;
  lon: number;
  similarity_score?: number;
}

interface EarthMapProps {
  candidates?: CandidateLocation[];
  className?: string;
}

export const EarthMap: React.FC<EarthMapProps> = ({
  candidates = [],
  className = "",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // CARTO Dark Matter raster basemap (Free, open tile style with proper attribution)
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
          },
        },
        layers: [
          {
            id: "carto-dark-layer",
            type: "raster",
            source: "carto-dark",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [15, 25], // Centered globally
      zoom: 1.5,
    });

    // Add zoom/pan navigation control
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    // Add scale bar
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }), "bottom-left");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Scientific honesty: only render markers if real candidates exist
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentMarkers: maplibregl.Marker[] = [];

    if (candidates.length > 0) {
      candidates.forEach((c) => {
        const el = document.createElement("div");
        el.className = "w-4 h-4 rounded-full bg-accent-cyan border-2 border-white shadow-glow cursor-pointer";

        const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
          <div style="color: #070B14; font-family: sans-serif; padding: 4px;">
            <div style="font-weight: bold; font-size: 13px;">${c.name}</div>
            <div style="font-size: 11px; color: #4B5563;">Lat: ${c.lat.toFixed(3)}°, Lon: ${c.lon.toFixed(3)}°</div>
            ${c.similarity_score ? `<div style="font-size: 11px; font-weight: 600; color: #0284C7; margin-top: 2px;">Similarity: ${(c.similarity_score * 100).toFixed(1)}%</div>` : ""}
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([c.lon, c.lat])
          .setPopup(popup)
          .addTo(map);

        currentMarkers.push(marker);
      });
    }

    return () => {
      currentMarkers.forEach((m) => m.remove());
    };
  }, [candidates]);

  return (
    <div className={`relative w-full h-[400px] rounded-panel overflow-hidden border border-border bg-base ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {candidates.length === 0 && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-panel/90 text-text-muted border border-border backdrop-blur-sm">
            0 candidate markers (No analyses active)
          </span>
        </div>
      )}
    </div>
  );
};
