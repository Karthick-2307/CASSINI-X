import React, { useState, useEffect, useRef } from "react";
import { api, GazetteerItem } from "../../api/client";
import { Badge } from "../ui";

interface PlanetarySearchBarProps {
  selectedPlanetName: string;
  onSelectFeature: (item: GazetteerItem) => void;
}

export const PlanetarySearchBar: React.FC<PlanetarySearchBarProps> = ({
  selectedPlanetName,
  onSelectFeature,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<GazetteerItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    api.searchGazetteer(searchTerm, selectedPlanetName)
      .then((items) => {
        setResults(items);
      })
      .catch(() => setResults([]))
      .finally(() => setIsLoading(false));
  }, [searchTerm, selectedPlanetName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (item: GazetteerItem) => {
    onSelectFeature(item);
    setSearchTerm(item.name);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-text-muted">
          Search Planetary Terrain &amp; Craters
        </label>
        <span className="text-[10px] font-mono text-accent-cyan">Live IAU Gazetteer</span>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={`Search ${selectedPlanetName} terrain (e.g. Gale, Tycho, Olympus, Valles...)`}
          className="w-full bg-raised border border-border rounded-btn px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan pr-8 font-mono"
        />
        {isLoading && (
          <span className="absolute right-7 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
        )}
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
          >
            &times;
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-panel border border-border rounded-panel shadow-panel z-50 max-h-60 overflow-y-auto divide-y divide-border">
          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className="p-2.5 hover:bg-raised cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">{item.name}</span>
                <Badge variant={item.is_ingested ? "derived" : "neutral"}>
                  {item.is_ingested ? "DEM Ingested" : "Gazetteer"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-mono text-text-muted">
                <span>{item.feature_type}</span>
                <span>•</span>
                <span>
                  {item.lat > 0 ? `${item.lat}°N` : `${Math.abs(item.lat)}°S`},{" "}
                  {item.lon > 0 ? `${item.lon}°E` : `${Math.abs(item.lon)}°W`}
                </span>
                {item.diameter_km && (
                  <>
                    <span>•</span>
                    <span>&Oslash; {item.diameter_km} km</span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-text-muted line-clamp-1">{item.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-1 pt-1">
        {results.slice(0, 3).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item)}
            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-raised hover:bg-border text-text-muted hover:text-text-primary border border-border/80 transition-colors"
          >
            {item.name.split(" ")[0]}
          </button>
        ))}
      </div>
    </div>
  );
};
