import type { StyleSpecification } from "maplibre-gl";

export type PlanetType = "earth" | "moon" | "mars";

export interface BasemapOption {
  id: string;
  label: string;
  provider: string;
  description: string;
  planet: PlanetType;
}

export const BASEMAP_OPTIONS: Record<PlanetType, BasemapOption[]> = {
  earth: [
    {
      id: "google-satellite",
      label: "Google Earth Satellite",
      provider: "Google Earth",
      description: "High-resolution real-world satellite imagery from Google Earth",
      planet: "earth",
    },
    {
      id: "google-hybrid",
      label: "Google Earth Hybrid",
      provider: "Google Earth",
      description: "Google Earth satellite imagery with geographic annotations",
      planet: "earth",
    },
    {
      id: "nasa-bluemarble",
      label: "NASA Blue Marble",
      provider: "NASA GIBS",
      description: "NASA Global Imagery Browse Services (GIBS) Earth Shaded Relief",
      planet: "earth",
    },
    {
      id: "carto-dark",
      label: "CARTO Dark Matter",
      provider: "CARTO / OSM",
      description: "High-contrast dark cartographic basemap",
      planet: "earth",
    },
  ],
  mars: [
    {
      id: "nasa-mars-trek",
      label: "NASA Mars Trek (MOLA)",
      provider: "NASA Mars Trek",
      description: "NASA MGS MOLA Global Elevation Shaded Relief",
      planet: "mars",
    },
    {
      id: "usgs-mars-basemap",
      label: "USGS Mars MDIM2.1",
      provider: "USGS / OpenPlanetary",
      description: "USGS Astrogeology Viking MDIM 2.1 global Mars surface mosaic",
      planet: "mars",
    },
  ],
  moon: [
    {
      id: "nasa-moon-trek",
      label: "NASA Moon Trek (LRO)",
      provider: "NASA Moon Trek",
      description: "NASA LRO WAC Global Photographic Surface Mosaic",
      planet: "moon",
    },
    {
      id: "usgs-moon-basemap",
      label: "USGS Moon Basemap",
      provider: "USGS / OpenPlanetary",
      description: "USGS Astrogeology Lunar Reconnaissance Orbiter mosaic",
      planet: "moon",
    },
  ],
};

export function getBasemapStyle(planet: PlanetType, basemapId?: string): StyleSpecification {
  const options = BASEMAP_OPTIONS[planet];
  const selected = options.find((o) => o.id === basemapId) || options[0];

  let sourceSpec: {
    tiles: string[];
    tileSize?: number;
    maxzoom?: number;
    attribution?: string;
  };

  switch (selected.id) {
    case "google-satellite":
      sourceSpec = {
        tiles: [
          "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
          "https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
          "https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        ],
        tileSize: 256,
        maxzoom: 20,
        attribution: '&copy; <a href="https://earth.google.com/" target="_blank">Google Earth</a> Imagery',
      };
      break;

    case "google-hybrid":
      sourceSpec = {
        tiles: [
          "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          "https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        ],
        tileSize: 256,
        maxzoom: 20,
        attribution: '&copy; <a href="https://earth.google.com/" target="_blank">Google Earth</a> Imagery &amp; Data',
      };
      break;

    case "nasa-bluemarble":
      sourceSpec = {
        tiles: [
          "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg",
        ],
        tileSize: 256,
        maxzoom: 8,
        attribution: '&copy; <a href="https://earthdata.nasa.gov/gibs" target="_blank">NASA EOSDIS GIBS</a> Blue Marble',
      };
      break;

    case "nasa-mars-trek":
      sourceSpec = {
        tiles: [
          "https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0//default/default028mm/{z}/{y}/{x}.jpg",
        ],
        tileSize: 256,
        maxzoom: 8,
        attribution: '&copy; <a href="https://trek.nasa.gov/mars/" target="_blank">NASA Mars Trek</a> MGS MOLA Global DEM',
      };
      break;

    case "usgs-mars-basemap":
      sourceSpec = {
        tiles: [
          "https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        maxzoom: 8,
        attribution: '&copy; <a href="https://www.openplanetary.org/" target="_blank">OpenPlanetary</a> / USGS Astrogeology',
      };
      break;

    case "nasa-moon-trek":
      sourceSpec = {
        tiles: [
          "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
        ],
        tileSize: 256,
        maxzoom: 8,
        attribution: '&copy; <a href="https://trek.nasa.gov/moon/" target="_blank">NASA Moon Trek</a> LRO LOLA/WAC Mosaic',
      };
      break;

    case "usgs-moon-basemap":
      sourceSpec = {
        tiles: [
          "https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-moon-basemap-v0-1/all/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        maxzoom: 8,
        attribution: '&copy; <a href="https://www.openplanetary.org/" target="_blank">OpenPlanetary</a> / USGS Astrogeology',
      };
      break;

    case "carto-dark":
    default:
      sourceSpec = {
        tiles: [
          "https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
          "https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
          "https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      };
      break;
  }

  return {
    version: 8,
    sources: {
      "planetary-basemap-src": {
        type: "raster",
        ...sourceSpec,
      },
    },
    layers: [
      {
        id: "space-background",
        type: "background",
        paint: {
          "background-color": "#070B14",
        },
      },
      {
        id: "planetary-basemap-layer",
        type: "raster",
        source: "planetary-basemap-src",
        minzoom: 0,
        maxzoom: sourceSpec.maxzoom ?? 20,
      },
    ],
  };
}

