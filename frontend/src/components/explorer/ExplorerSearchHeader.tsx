import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Badge } from "../ui";
import { Region, GazetteerItem } from "../../api/client";
import { PlanetarySearchBar } from "../discovery/PlanetarySearchBar";

interface ExplorerSearchHeaderProps {
  activeBody: string;
  regions: Region[];
  selectedRegionId: number | null;
  onSelectRegionId: (id: number) => void;
  selectedFeature: GazetteerItem | null;
  onSelectFeature: (item: GazetteerItem) => void;
}

export const ExplorerSearchHeader: React.FC<ExplorerSearchHeaderProps> = ({
  activeBody,
  regions,
  selectedRegionId,
  onSelectRegionId,
  selectedFeature,
  onSelectFeature,
}) => {
  const navigate = useNavigate();

  const handleCompareWithEarth = () => {
    if (!selectedRegionId) return;
    navigate(`/discovery?planet=${activeBody}&regionId=${selectedRegionId}`);
  };

  return (
    <div className="space-y-3 bg-panel border border-border p-3.5 rounded-panel">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Live Search Bar across Moon, Mars, Earth */}
        <div className="flex-1">
          <PlanetarySearchBar
            selectedPlanetName={activeBody}
            onSelectFeature={onSelectFeature}
          />
        </div>

        {/* Quick Database Region Selector */}
        <div className="flex items-center space-x-2 self-start md:self-end pb-1">
          <span className="text-xs font-mono text-text-muted whitespace-nowrap">
            Curated Area:
          </span>
          <select
            value={selectedRegionId || ""}
            onChange={(e) => onSelectRegionId(Number(e.target.value))}
            className="bg-raised border border-border rounded-btn px-2.5 py-1 text-xs text-text-primary font-mono focus:outline-none focus:border-accent-cyan"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature Context Banner & Instant Earth Comparison Action */}
      {selectedFeature && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center space-x-2">
            <Badge variant="derived">
              {selectedFeature.feature_type}
            </Badge>
            <span className="font-heading font-semibold text-text-primary">
              {selectedFeature.name}
            </span>
            {selectedFeature.elevation_approx_m !== null && selectedFeature.elevation_approx_m !== undefined && (
              <span className="font-mono text-[11px] text-text-muted">
                Elev: {selectedFeature.elevation_approx_m} m
              </span>
            )}
            {selectedFeature.diameter_km && (
              <span className="font-mono text-[11px] text-text-muted">
                Diam: {selectedFeature.diameter_km} km
              </span>
            )}
          </div>

          {activeBody.toLowerCase() !== "earth" && selectedRegionId && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCompareWithEarth}
              className="text-xs shrink-0"
            >
              Compare with Earth Analogs &rarr;
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
