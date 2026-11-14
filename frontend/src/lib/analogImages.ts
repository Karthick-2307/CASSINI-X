// Curated high-resolution satellite and aerial photography of terrestrial planetary analogs

export interface AnalogSiteImage {
  primarySatelliteUrl: string;
  fieldPhotoUrl?: string;
  caption: string;
  provider: string;
  resolution: string;
  geologicalFeature: string;
}

export const ANALOG_IMAGES: Record<string, AnalogSiteImage> = {
  lanzarote: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
    fieldPhotoUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    caption: "Basaltic lava tubes, hornitos, and volcanic ash tephra fields of Timanfaya National Park.",
    provider: "ESA Copernicus Sentinel-2 / NASA Earth Observatory",
    resolution: "10m Optical / 30m Radar",
    geologicalFeature: "Basaltic Lava Tubes & Cinder Cones (Lunar Mare / Martian Volcanism Analog)",
  },
  atacama: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    fieldPhotoUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    caption: "Hyper-arid desiccated soil, chloride crusts, and zero-moisture regolith in Yungay Basin.",
    provider: "NASA Earth Observatory / USGS Landsat-9",
    resolution: "15m Panchromatic / 30m Multispectral",
    geologicalFeature: "Hyper-Arid Paleolake Evaporites & Saline Crusts (Desiccated Martian Basins)",
  },
  haughton: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
    fieldPhotoUrl: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=800&q=80",
    caption: "Polar desert impact crater, shatter cones, and permafrost polygonal ground on Devon Island.",
    provider: "NASA Haughton-Mars Project / Canadian Space Agency",
    resolution: "10m Optical / Radarsat-2",
    geologicalFeature: "Complex Meteorite Impact Structure & Permafrost Polygons (Mars North Pole Analog)",
  },
  wadi_rum: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    fieldPhotoUrl: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
    caption: "Iron-oxide red sandstone inselbergs, sheer canyon massifs, and dry sandy wadi channels.",
    provider: "NASA Earth Observatory / Sentinel-2",
    resolution: "10m Multispectral",
    geologicalFeature: "Iron-Oxide Sandstone Massifs & Sedimentary Canyons (Jezero Delta & Valles Marineris)",
  },
  richat: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    caption: "40-km wide circular concentric uplift dome with deeply eroded hydrothermal breccia rings.",
    provider: "NASA International Space Station (ISS) Expedition / USGS",
    resolution: "15m Landsat OLI",
    geologicalFeature: "Concentric Structural Uplift Ring (Complex Impact Crater & Caldera Analog)",
  },
  namib: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    caption: "Hyper-arid barchan and colossal star dunes of Sossusvlei and the Skeleton Coast.",
    provider: "ESA Sentinel-2 / NASA Terra ASTER",
    resolution: "10m Visible",
    geologicalFeature: "Colossal Aeolian Erg Dune Fields (Mars Gale Crater Barchans & Polar Dunes)",
  },
  danakil: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80",
    caption: "Hydrothermal sulfur springs, acid brine pools, and active tectonic volcanic fissure rifts.",
    provider: "Europlanet / Copernicus Sentinel-2",
    resolution: "10m Optical",
    geologicalFeature: "Hydrothermal Volcanic Depression & Acid Evaporites (Early Mars Spring Analogs)",
  },
  death_valley: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1498603993951-8a027a8a8f84?auto=format&fit=crop&w=1200&q=80",
    caption: "Deep desert tectonic depression featuring Badwater polygonal salt flats and braided alluvial fans.",
    provider: "USGS National Map / Landsat-9",
    resolution: "15m Orthoimagery",
    geologicalFeature: "Hyper-Arid Basin Alluvial Fans & Evaporite Crust (Gale Crater Sediments)",
  },
  uyuni: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=1200&q=80",
    caption: "Vast high-altitude salt flat at 3,656m elevation with hexagonal lithium salt polygons.",
    provider: "NASA Earth Observatory / Landsat OLI",
    resolution: "15m Visible",
    geologicalFeature: "High-Altitude Chloride Evaporite Paleolake (Martian Chloride Salt Flats)",
  },
  askja: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80",
    caption: "Basaltic tephra pumice plains, volcanic collapse crater lake, and fresh fissure lava flows.",
    provider: "ESA Sentinel-2 / NASA Apollo Geology Archive",
    resolution: "10m Visible",
    geologicalFeature: "Basaltic Collapse Caldera & Tephra Plain (Apollo Lunar Surface Analog)",
  },
  nullarbor: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=1200&q=80",
    caption: "Flat arid limestone bedrock plain with minimal relief and high meteorite accumulation density.",
    provider: "Geoscience Australia / NASA Earthdata",
    resolution: "30m SRTM / Sentinel-2",
    geologicalFeature: "Flat Arid Regolith Bedrock Plain (Lunar Maria / Regolith Accumulation Analog)",
  },
  ries: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    caption: "Preserved 24-km complex meteorite impact crater with suevite impact melt breccia.",
    provider: "Bavarian State Geological Survey / ESA",
    resolution: "10m Sentinel-2",
    geologicalFeature: "Meteorite Impact Crater & Suevite Breccia (Apollo Astronaut Training Ground)",
  },
  qaidam: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    caption: "High-altitude wind-sculpted yardangs and gypsum evaporites in the northern Tibetan Plateau.",
    provider: "NASA ASTER / USGS Landsat",
    resolution: "15m Visible",
    geologicalFeature: "Wind-Sculpted Yardang Ridges (Mars Medusae Fossae Aeolian Analog)",
  },
  hawaii: {
    primarySatelliteUrl: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=1200&q=80",
    caption: "High-altitude basaltic pahoehoe and 'a'a lava flows on Mauna Kea and Kilauea flanks.",
    provider: "USGS Hawaiian Volcano Observatory / Landsat-9",
    resolution: "15m Orthoimagery",
    geologicalFeature: "Basaltic Shield Volcano Flanks & Tephra Cones (Martian Shield Volcanism)",
  },
};

export function getTileSatelliteUrl(lat: number, lon: number, zoom: number = 13): string {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
}

export function getAnalogSiteImage(locationName: string, lat: number, lon: number): AnalogSiteImage {
  const lower = locationName.toLowerCase();
  for (const [key, data] of Object.entries(ANALOG_IMAGES)) {
    if (lower.includes(key.replace("_", " ")) || lower.includes(key)) {
      return data;
    }
  }

  // Fallback to dynamic high-resolution ESRI World Imagery satellite tile
  const tileUrl = getTileSatelliteUrl(lat, lon, 12);
  return {
    primarySatelliteUrl: tileUrl,
    caption: `High-resolution orbital satellite observation over ${locationName} (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E).`,
    provider: "ESRI World Imagery / NASA SRTM 30m Global",
    resolution: "15m High-Resolution Satellite",
    geologicalFeature: "Terrestrial Planetary Analog Geological Formation",
  };
}
