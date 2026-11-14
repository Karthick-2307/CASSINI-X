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
  planets: _planets,
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

  const isMars = selectedPlanetName.toLowerCase() === "mars";
  const isMoon = selectedPlanetName.toLowerCase() === "moon";

  // Filter ingested regions matching current search
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

  const handleExecuteSearch = async () => {
    setIsDropdownOpen(false);
    const query = searchTerm.trim().toLowerCase();

    // Cross-body smart detection
    const isMoonKeywords = ["shackleton", "tranquillitatis", "apollo", "tycho", "copernicus", "luna", "mare "];
    const isMarsKeywords = ["jezero", "gale", "olympus", "korolev", "sharp", "perseverance", "curiosity", "valles"];

    if (query) {
      // Check if user entered a Moon query while on Mars
      if (isMars && isMoonKeywords.some((k) => query.includes(k))) {
        setSelectedPlanetName("Moon");
        try {
          const moonRegs = await api.getRegions(2);
          const match = moonRegs.find((r) => r.name.toLowerCase().includes(query));
          if (match) {
            onSelectRegion(match.id);
            return;
          }
          const gaz = await api.searchGazetteer(query, "Moon");
          if (gaz.length > 0) {
            onSelectGazetteerItem(gaz[0]);
            return;
          }
          if (moonRegs.length > 0) {
            onSelectRegion(moonRegs[0].id);
            return;
          }
        } catch {
          // fallback
        }
      }

      // Check if user entered a Mars query while on Moon
      if (isMoon && isMarsKeywords.some((k) => query.includes(k))) {
        setSelectedPlanetName("Mars");
        try {
          const marsRegs = await api.getRegions(3);
          const match = marsRegs.find((r) => r.name.toLowerCase().includes(query));
          if (match) {
            onSelectRegion(match.id);
            return;
          }
          const gaz = await api.searchGazetteer(query, "Mars");
          if (gaz.length > 0) {
            onSelectGazetteerItem(gaz[0]);
            return;
          }
          if (marsRegs.length > 0) {
            onSelectRegion(marsRegs[0].id);
            return;
          }
        } catch {
          // fallback
        }
      }

      // 1. Check if query matches an ingested region on current planet
      const matchedRegion = regions.find((r) =>
        r.name.toLowerCase().includes(query)
      );
      if (matchedRegion) {
        setSearchTerm(matchedRegion.name);
        onSelectRegion(matchedRegion.id);
        return;
      }

      // 2. Check if in gazetteer results
      const matchedGazetteer = gazetteerResults.find((g) =>
        g.name.toLowerCase().includes(query)
      );
      if (matchedGazetteer) {
        setSearchTerm(matchedGazetteer.name);
        onSelectGazetteerItem(matchedGazetteer);
        return;
      }

      // 3. Query gazetteer live if not found yet
      try {
        setIsLoadingGazetteer(true);
        const liveItems = await api.searchGazetteer(searchTerm, selectedPlanetName);
        if (liveItems.length > 0) {
          setSearchTerm(liveItems[0].name);
          onSelectGazetteerItem(liveItems[0]);
          return;
        }
      } catch {
        // fallback
      } finally {
        setIsLoadingGazetteer(false);
      }
    }

    // Default trigger using active region
    onTriggerSearch();
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

  // Distinct landmark chips for Mars vs Moon
  const marsLandmarks = [
    { name: "Jezero Crater Floor & Delta", short: "Jezero Crater", id: 2 },
    { name: "Gale Crater & Mount Sharp", short: "Gale Crater", id: 7 },
    { name: "Olympus Mons Caldera Rim", short: "Olympus Mons", id: 4 },
    { name: "Korolev Crater (Water Ice Deposit)", short: "Korolev Crater", id: 8 },
  ];

  const moonLandmarks = [
    { name: "Mare Tranquillitatis (Apollo 11)", short: "Mare Tranquillitatis", id: 3 },
    { name: "Shackleton Crater & South Pole", short: "Shackleton Crater", id: 5 },
  ];

  const currentLandmarks = isMars ? marsLandmarks : moonLandmarks;

  return (
    <div ref={containerRef} className="space-y-3.5 max-w-4xl mx-auto">
      {/* 1. SEPARATE PLANETARY UI TABS FOR MARS & MOON */}
      <div className="grid grid-cols-2 gap-3">
        {/* MARS SELECTION TAB */}
        <button
          type="button"
          onClick={() => {
            setSelectedPlanetName("Mars");
            setSearchTerm("");
          }}
          className={`relative p-3.5 rounded-card text-left transition-all duration-200 border ${
            isMars
              ? "bg-[#1C1214] border-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-1 ring-[#EF4444]/60"
              : "bg-[#111826]/70 border-[#243044] hover:border-[#EF4444]/40 hover:bg-[#162033]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">🔴</span>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-heading font-bold ${isMars ? "text-[#F8FAFC]" : "text-[#94A3B8]"}`}>
                    MARS
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/30">
                    Red Planet
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                  MRO CTX (6m/px) • MOLA (463m)
                </div>
              </div>
            </div>
            {isMars && (
              <span className="text-[10px] font-mono font-bold text-[#EF4444] uppercase tracking-wider bg-[#EF4444]/10 px-2 py-0.5 rounded border border-[#EF4444]/30">
                ACTIVE
              </span>
            )}
          </div>
          <div className="mt-2 text-[10px] font-mono text-[#94A3B8]/80 flex items-center justify-between border-t border-[#243044]/60 pt-1.5">
            <span>Gravity: 3.71 m/s²</span>
            <span>Radius: 3,389.5 km</span>
          </div>
        </button>

        {/* MOON SELECTION TAB */}
        <button
          type="button"
          onClick={() => {
            setSelectedPlanetName("Moon");
            setSearchTerm("");
          }}
          className={`relative p-3.5 rounded-card text-left transition-all duration-200 border ${
            isMoon
              ? "bg-[#0D1829] border-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.25)] ring-1 ring-[#38BDF8]/60"
              : "bg-[#111826]/70 border-[#243044] hover:border-[#38BDF8]/40 hover:bg-[#162033]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">🌕</span>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-heading font-bold ${isMoon ? "text-[#F8FAFC]" : "text-[#94A3B8]"}`}>
                    MOON
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30">
                    Lunar Surface
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                  LRO LOLA (59m/px) • SLDEM2015
                </div>
              </div>
            </div>
            {isMoon && (
              <span className="text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/30">
                ACTIVE
              </span>
            )}
          </div>
          <div className="mt-2 text-[10px] font-mono text-[#94A3B8]/80 flex items-center justify-between border-t border-[#243044]/60 pt-1.5">
            <span>Gravity: 1.62 m/s²</span>
            <span>Radius: 1,737.4 km</span>
          </div>
        </button>
      </div>

      {/* 2. THEMED SEARCH BAR CONTAINER */}
      <div
        className={`bg-[#111826] border rounded-card p-3 shadow-md space-y-2.5 transition-colors ${
          isMars ? "border-[#EF4444]/40" : "border-[#38BDF8]/40"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#243044]/80">
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                isMars ? "text-[#F87171]" : "text-[#38BDF8]"
              }`}
            >
              <span>{isMars ? "🔴" : "🌕"}</span>
              <span>{selectedPlanetName} Terrain Analog Search</span>
            </span>
            <Badge variant="active">
              {isMars ? "MRO CTX / MOLA Ingested" : "LRO LOLA Ingested"}
            </Badge>
          </div>

          <span className="text-[11px] font-mono text-[#94A3B8]/80 text-right">
            USGS Astrogeology &amp; IAU Gazetteer
          </span>
        </div>

        {/* The Search Bar Input with Insert Image Option */}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleExecuteSearch();
                }
              }}
              placeholder={
                isMars
                  ? "Search Mars crater, volcano, or basin (e.g. Jezero, Gale, Olympus Mons, Korolev)..."
                  : "Search Moon crater, mare, or polar basin (e.g. Shackleton, Mare Tranquillitatis, Tycho)..."
              }
              className={`w-full bg-[#162033] border rounded-btn pl-10 pr-28 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/60 font-sans shadow-sm focus:outline-none transition-colors ${
                isMars
                  ? "border-[#243044] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]/40"
                  : "border-[#243044] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/40"
              }`}
            />

            {isLoadingGazetteer && (
              <span className={`absolute right-24 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-pulse ${
                isMars ? "bg-[#EF4444]" : "bg-[#38BDF8]"
              }`} />
            )}

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC] text-sm px-1"
                aria-label="Clear search input"
              >
                &times;
              </button>
            )}

            {/* In-bar Insert Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#111826] border text-[11px] font-sans font-medium transition-colors shadow-sm ${
                isMars
                  ? "text-[#F87171] border-[#243044] hover:border-[#EF4444]/60 hover:bg-[#1c1214]"
                  : "text-[#38BDF8] border-[#243044] hover:border-[#38BDF8]/60 hover:bg-[#162033]"
              }`}
              title={`Upload local ${selectedPlanetName} orbital image to extract morphometric features`}
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
            onClick={handleExecuteSearch}
            disabled={isSearching}
            className={`sm:w-auto w-full px-5 py-2.5 text-xs font-semibold shadow-sm shrink-0 ${
              isMars ? "bg-[#DC2626] hover:bg-[#EF4444] text-white border-transparent" : ""
            }`}
          >
            {isSearching ? "Searching..." : "Find Earth Analogs"}
          </Button>
        </div>

        {/* Uploaded Local Image Preview Chip & Google Lens Background Status */}
        {uploadedImage && uploadedImageUrl && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded bg-[#162033] border border-[#38BDF8]/40 text-xs font-sans shadow-sm gap-2">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <img
                src={uploadedImageUrl}
                alt="Local orbital upload preview"
                className="w-11 h-11 object-cover rounded border border-[#38BDF8]/50 shrink-0 shadow-sm"
              />
              <div className="truncate">
                <div className="text-[#F8FAFC] font-semibold flex items-center space-x-2 truncate">
                  <span>{uploadedImage.name}</span>
                  <Badge variant="active">Google Lens &amp; Global Earth Scanner</Badge>
                </div>
                <div className="text-[11px] font-mono text-[#38BDF8] mt-0.5">
                  {isSearching
                    ? "⏳ Scanning planetary raster via Google Lens & extracting relief, 2D slope & roughness..."
                    : `✓ Scanned across 14 global Earth analog environments (6 continents)`}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
              <a
                href="https://lens.google.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#111826] hover:bg-[#243044] border border-[#38BDF8]/40 text-[#38BDF8] text-[11px] font-mono transition-colors"
                title="Open Google Lens to view live reverse visual search results on Earth"
              >
                <span>🔍 Google Lens Web</span>
                <span>↗</span>
              </a>

              <button
                type="button"
                onClick={handleClearImage}
                className="text-xs text-[#94A3B8] hover:text-[#F87171] px-2.5 py-1 rounded bg-[#111826] border border-[#243044] hover:border-[#F87171]/40 transition-colors"
                title="Remove uploaded image"
              >
                Remove ✕
              </button>
            </div>
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
                  IAU Planetary Gazetteer ({selectedPlanetName})
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

      {/* 3. PLANET-SPECIFIC QUICK LANDMARKS CHIPS */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-sans">
        <span className="text-[11px] font-mono text-[#94A3B8] pr-1">
          {selectedPlanetName} Landmarks:
        </span>
        {currentLandmarks.map((sug) => {
          const isSelected = selectedRegionId === sug.id;
          return (
            <button
              key={sug.name}
              type="button"
              onClick={async () => {
                setSearchTerm(sug.name);
                setIsDropdownOpen(false);
                onSelectRegion(sug.id);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all border ${
                isSelected
                  ? isMars
                    ? "bg-[#EF4444]/20 text-[#F87171] border-[#EF4444] font-semibold shadow-sm"
                    : "bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8] font-semibold shadow-sm"
                  : "bg-[#111826] text-[#94A3B8] hover:text-[#F8FAFC] border-[#243044] hover:bg-[#162033]"
              }`}
            >
              {sug.short}
            </button>
          );
        })}
      </div>
    </div>
  );
};
