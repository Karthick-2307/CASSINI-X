import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getBasemapStyle, BasemapSelector } from "./map";

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
  const [currentBasemapId, setCurrentBasemapId] = useState<string>("google-satellite");

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const style = getBasemapStyle("earth", currentBasemapId);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style,
      center: [15, 25], // Centered globally
      zoom: 1.5,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }), "bottom-left");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleSelectBasemap = (newBasemapId: string) => {
    setCurrentBasemapId(newBasemapId);
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(getBasemapStyle("earth", newBasemapId));
  };

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
    <div className={`relative w-full rounded-panel overflow-hidden border border-border shadow-panel bg-[#070B14] ${className}`}>
      {/* Basemap Imagery Switcher (Google Earth / NASA Blue Marble / CARTO) */}
      <BasemapSelector
        planet="earth"
        currentBasemapId={currentBasemapId}
        onSelectBasemap={handleSelectBasemap}
      />
      <div ref={mapContainerRef} className="w-full h-[400px]" />
    </div>
  );
};
