import React, { useState, useEffect } from "react";
import { Card, Badge, LoadingSpinner } from "../ui";
import { api, Region, TerrainBounds } from "../../api/client";

interface ReferenceRegionViewerProps {
  region: Region | null;
  planetName: string;
}

export const ReferenceRegionViewer: React.FC<ReferenceRegionViewerProps> = ({
  region,
  planetName,
}) => {
  const [bounds, setBounds] = useState<TerrainBounds | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!region) {
      setBounds(null);
      return;
    }
    setImageError(false);
    setLoading(true);
    api.getTerrainBounds(region.id)
      .then((b) => setBounds(b))
      .catch(() => setBounds(null))
      .finally(() => setLoading(false));
  }, [region]);

  if (!region) {
    return (
      <Card className="h-[440px] flex items-center justify-center text-center p-6 bg-surface border-border">
        <p className="text-sm text-text-muted">Select a reference region to inspect planetary terrain.</p>
      </Card>
    );
  }

  const hillshadeUrl = api.getHillshadeUrl(region.id);

  return (
    <Card className="h-[440px] flex flex-col justify-between bg-surface border-border p-4 relative overflow-hidden">
      {/* Header telemetry */}
      <div className="flex items-center justify-between pb-3 border-b border-border z-10 bg-surface/90">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-heading font-semibold text-text-primary text-sm">
              {region.name}
            </span>
            <Badge variant="derived">{planetName}</Badge>
          </div>
          <div className="text-[11px] font-mono text-text-muted">
            Coordinates: {region.lat.toFixed(2)}°N, {region.lon.toFixed(2)}°E
          </div>
        </div>

        {bounds && (
          <div className="text-right text-[11px] font-mono text-text-muted">
            <div>Res: {bounds.resolution_m} m/px</div>
            <div className="text-[10px] text-text-muted/70">{bounds.source}</div>
          </div>
        )}
      </div>

      {/* Main Imagery / Hillshade Overlay */}
      <div className="flex-1 my-2 flex items-center justify-center relative bg-background rounded border border-border overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading terrain raster..." size="sm" />
        ) : !imageError ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={hillshadeUrl}
              alt={`Topographic hillshade overlay for ${region.name}`}
              onError={() => setImageError(true)}
              className="max-h-full max-w-full object-contain"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface/90 border border-border text-[10px] font-mono text-text-muted">
              Horn Hillshade (Solar Azimuth 315°, Altitude 45°)
            </div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-2">
            <Badge variant="unavailable">Layer not available</Badge>
            <p className="text-xs text-text-muted max-w-xs font-sans">
              No local raster DEM file is staged on disk for this feature. Coordinates are registered via IAU planetary gazetteer.
            </p>
          </div>
        )}
      </div>

      {/* Footer provenance */}
      <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border">
        <span>Basemap: {planetName} Global Altimetry</span>
        <span className="font-mono text-[10px]">Standardized 500m scale</span>
      </div>
    </Card>
  );
};
