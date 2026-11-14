import React, { useState, useEffect, useRef } from "react";
import { api, GazetteerItem, Planet, Region } from "../../api/client";
import { Button, Badge } from "../ui";

export interface UnifiedDiscoverySearchProps {
  planets: Planet[];
  selectedPlanetName: string;
  setSelectedPlanetName: (planet: string) => void;
  regions: Region[];
  selectedRegionId: number | null;
  onSelectRegion: (regionId: number) => void;
  onSelectGazetteerItem: (item: GazetteerItem) => void;
  uploadedImage: File | null;
  uploadedImageUrl: string | null;
  onImageSelected: (file: File | null, url: string | null) => void;
  onTriggerSearch: () => void;
  isSearching: boolean;
}

export const UnifiedDiscoverySearch: React.FC<UnifiedDiscoverySearchProps> = ({
  planets,
  selectedPlanetName,
  setSelectedPlanetName,
  regions,
  selectedRegionId,
  onSelectRegion,
  onSelectGazetteerItem,
  uploadedImage,
  uploadedImageUrl,
  onImageSelected,
  onTriggerSearch,
  isSearching,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gazetteerResults, setGazetteerResults] = useState<GazetteerItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingGazetteer, setIsLoadingGazetteer] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePlanets = planets.filter((p) => p.name !== "Earth");

  // Filter ingested regions matching search
  const filteredRegions = regions.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Search IAU gazetteer when user types
  useEffect(() => {
    if (!searchTerm.trim()) {
      setGazetteerResults([]);
      return;
    }

    setIsLoadingGazetteer(true);
    const timeout = setTimeout(() => {
      api.searchGazetteer(searchTerm, selectedPlanetName)
        .then((items) => setGazetteerResults(items))
        .catch(() => setGazetteerResults([]))
        .finally(() => setIsLoadingGazetteer(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchTerm, selectedPlanetName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectGazetteer = (item: GazetteerItem) => {
    setSearchTerm(item.name);
    setIsDropdownOpen(false);
    onSelectGazetteerItem(item);
  };

  const handleSelectLocalRegion = (reg: Region) => {
    setSearchTerm(reg.name);
    setIsDropdownOpen(false);
    onSelectRegion(reg.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        alert("File size exceeds 50 MB.");
        return;
      }
      const url = URL.createObjectURL(file);
      onImageSelected(file, url);
    }
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Curated quick recommendations
  const quickSuggestions = [
    { name: "Jezero Crater", planet: "Mars" },
    { name: "Gale Crater", planet: "Mars" },
    { name: "Olympus Mons", planet: "Mars" },
    { name: "Mare Tranquillitatis", planet: "Moon" },
    { name: "Shackleton Crater", planet: "Moon" },
  ];

  return (
    <div ref={containerRef} className="space-y-3 max-w-4xl mx-auto">
      {/* Target Body Switch & Search Form Container */}
      <div className="bg-[#111826] border border-[#243044] rounded-card p-3 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#243044]/80">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">Target Celestial Body:</span>
            <div className="inline-flex p-0.5 rounded bg-[#162033] border border-[#243044]">
              {activePlanets.map((p) => {
                const isActive = p.name.toLowerCase() === selectedPlanetName.toLowerCase();
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanetName(p.name)}
                    className={`px-3 py-1 text-xs font-sans rounded transition-colors ${
                      isActive
                        ? "bg-[#111826] text-[#38BDF8] font-semibold border border-[#38BDF8]/40 shadow-sm"
                        : "text-[#94A3B8] hover:text-[#F8FAFC]"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#94A3B8]/80 text-right">
            USGS / NASA Planetary Altimetry &amp; IAU Gazetteer
          </span>
        </div>

        {/* The Search Bar Bar Input with Insert Image Option */}
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
          {/* Main search input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder={`Search ${selectedPlanetName} terrain, crater, or feature (e.g. Gale, Jezero, Tycho...)`}
              className="w-full bg-[#162033] border border-[#243044] rounded-btn pl-10 pr-24 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#38BDF8] font-sans shadow-sm"
            />

            {isLoadingGazetteer && (
              <span className="absolute right-20 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
            )}

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC] text-sm px-1"
                aria-label="Clear search input"
              >
                &times;
              </button>
            )}

            {/* In-bar Insert Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#111826] hover:bg-[#243044] text-[#38BDF8] border border-[#243044] hover:border-[#38BDF8]/60 text-[11px] font-sans font-medium transition-colors shadow-sm"
              title="Insert local planetary orbital image"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Insert Image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.tif,.tiff"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Search Trigger Button */}
          <Button
            variant="primary"
            size="md"
            onClick={onTriggerSearch}
            disabled={isSearching}
            className="sm:w-auto w-full px-5 py-2.5 text-xs font-semibold shadow-sm shrink-0"
          >
            {isSearching ? "Searching..." : "Find Earth Analogs"}
          </Button>
        </div>

        {/* Uploaded Local Image Preview Chip */}
        {uploadedImage && uploadedImageUrl && (
          <div className="flex items-center justify-between p-2 rounded bg-[#162033] border border-[#243044] text-xs font-sans">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <img
                src={uploadedImageUrl}
                alt="Local orbital upload preview"
                className="w-9 h-9 object-cover rounded border border-[#243044] shrink-0"
              />
              <div className="truncate">
                <div className="text-[#F8FAFC] font-medium truncate">{uploadedImage.name}</div>
                <div className="text-[10px] font-mono text-[#94A3B8]">
                  {(uploadedImage.size / (1024 * 1024)).toFixed(2)} MB • Processed locally
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearImage}
              className="text-xs text-[#94A3B8] hover:text-[#F87171] px-2 py-1 transition-colors"
              title="Remove uploaded image"
            >
              Remove ✕
            </button>
          </div>
        )}

        {/* Dropdown Suggestions */}
        {isDropdownOpen && (searchTerm.trim().length > 0 || filteredRegions.length > 0) && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-[#111826] border border-[#243044] rounded-card shadow-lg z-50 max-h-72 overflow-y-auto divide-y divide-[#243044]">
            {/* Ingested Baseline Regions */}
            {filteredRegions.length > 0 && (
              <div className="p-2 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] px-2 pt-1">
                  Ingested {selectedPlanetName} Datasets
                </div>
                {filteredRegions.map((reg) => {
                  const isCurrent = selectedRegionId === reg.id;
                  return (
                    <div
                      key={`reg-${reg.id}`}
                      onClick={() => handleSelectLocalRegion(reg)}
                      className={`p-2 rounded cursor-pointer transition-colors flex items-center justify-between ${
                        isCurrent ? "bg-[#162033] border border-[#38BDF8]/40" : "hover:bg-[#162033]"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#F8FAFC]">{reg.name}</div>
                        <div className="text-[10px] font-mono text-[#94A3B8]">
                          {reg.lat.toFixed(2)}°N, {reg.lon.toFixed(2)}°E • Elevation: {reg.elevation_m?.toFixed(0) ?? 0}m
                        </div>
                      </div>
                      <Badge variant="active">{isCurrent ? "Selected DEM" : "Ingested DEM"}</Badge>
                    </div>
                  );
                })}
              </div>
            )}

            {/* IAU Planetary Gazetteer Catalog */}
            {gazetteerResults.length > 0 && (
              <div className="p-2 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] px-2 pt-1">
                  IAU Planetary Gazetteer
                </div>
                {gazetteerResults.map((item) => (
                  <div
                    key={`gaz-${item.id}`}
                    onClick={() => handleSelectGazetteer(item)}
                    className="p-2 rounded hover:bg-[#162033] cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#F8FAFC]">{item.name}</div>
                      <div className="text-[10px] font-mono text-[#94A3B8]">
                        {item.feature_type} • {item.lat.toFixed(2)}°N, {item.lon.toFixed(2)}°E
                      </div>
                    </div>
                    <Badge variant={item.is_ingested ? "derived" : "neutral"}>
                      {item.is_ingested ? "DEM Cached" : "IAU Landmark"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Suggestions Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-sans">
        <span className="text-[11px] font-mono text-[#94A3B8] pr-1">Popular Landmarks:</span>
        {quickSuggestions.map((sug) => {
          const isSelected = searchTerm.toLowerCase().includes(sug.name.toLowerCase());
          return (
            <button
              key={sug.name}
              type="button"
              onClick={() => {
                setSelectedPlanetName(sug.planet);
                setSearchTerm(sug.name);
                const match = regions.find((r) => r.name.toLowerCase().includes(sug.name.toLowerCase()));
                if (match) {
                  onSelectRegion(match.id);
                } else {
                  api.searchGazetteer(sug.name, sug.planet).then((items) => {
                    if (items.length > 0) onSelectGazetteerItem(items[0]);
                  });
                }
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-colors border ${
                isSelected
                  ? "bg-[#162033] text-[#38BDF8] border-[#38BDF8]/60 font-semibold"
                  : "bg-[#111826] text-[#94A3B8] hover:text-[#F8FAFC] border-[#243044] hover:bg-[#162033]"
              }`}
            >
              {sug.name} ({sug.planet})
            </button>
          );
        })}
      </div>
    </div>
  );
};
