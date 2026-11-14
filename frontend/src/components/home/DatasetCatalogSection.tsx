import React from "react";
import { Card, Badge, SectionHeading } from "../ui";
import { Dataset } from "../../api/client";

interface DatasetCatalogSectionProps {
  datasets: Dataset[];
}

export const DatasetCatalogSection: React.FC<DatasetCatalogSectionProps> = ({ datasets }) => {
  const getDatasetStatus = (datasetName: string): "active" | "planned" | "unavailable" => {
    const found = datasets.find((d) => d.name.toLowerCase().includes(datasetName.toLowerCase()));
    if (found) return "active";
    return "planned";
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SectionHeading
        kicker="Provenance & Integrity"
        title="Open Planetary Dataset Sources"
        subtitle="Every terrain feature is computed exclusively from publicly accessible elevation and imagery archives. Status is linked to active database ingestion."
        align="center"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Earth Datasets */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-lg font-heading font-bold text-text-primary flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Earth Observation</span>
            </h3>
            <span className="text-xs font-mono text-text-muted">Reference Planet</span>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">NASADEM / SRTM</div>
                <div className="text-xs text-text-muted">Global 30m Digital Elevation Model</div>
              </div>
              <Badge variant={getDatasetStatus("NASADEM")}>{getDatasetStatus("NASADEM")}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">Copernicus GLO-30</div>
                <div className="text-xs text-text-muted">High-precision 30m global DSM</div>
              </div>
              <Badge variant={getDatasetStatus("Copernicus")}>{getDatasetStatus("Copernicus")}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">Landsat & ASTER</div>
                <div className="text-xs text-text-muted">Multispectral and thermal surface baseline</div>
              </div>
              <Badge variant={getDatasetStatus("Landsat")}>{getDatasetStatus("Landsat")}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">MODIS & EMIT</div>
                <div className="text-xs text-text-muted">Surface mineralogy and spectral reflectance</div>
              </div>
              <Badge variant={getDatasetStatus("EMIT")}>{getDatasetStatus("EMIT")}</Badge>
            </li>
          </ul>
        </Card>

        {/* Moon Datasets */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-lg font-heading font-bold text-text-primary flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Lunar Observations</span>
            </h3>
            <span className="text-xs font-mono text-text-muted">Moon</span>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">LOLA (LRO)</div>
                <div className="text-xs text-text-muted">Lunar Orbiter Laser Altimeter DEM</div>
              </div>
              <Badge variant={getDatasetStatus("LOLA")}>{getDatasetStatus("LOLA")}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">LROC NAC / WAC</div>
                <div className="text-xs text-text-muted">High-resolution surface morphology</div>
              </div>
              <Badge variant={getDatasetStatus("LROC")}>{getDatasetStatus("LROC")}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">Diviner Radiometer</div>
                <div className="text-xs text-text-muted">Thermal properties and rock abundance</div>
              </div>
              <Badge variant={getDatasetStatus("Diviner")}>{getDatasetStatus("Diviner")}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">Moon Mineralogy Mapper (M³)</div>
                <div className="text-xs text-text-muted">Hyperspectral mineral characterization</div>
              </div>
              <Badge variant={getDatasetStatus("M3")}>{getDatasetStatus("M3")}</Badge>
            </li>
          </ul>
        </Card>

        {/* Mars Datasets */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-lg font-heading font-bold text-text-primary flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Martian Observations</span>
            </h3>
            <span className="text-xs font-mono text-text-muted">Mars</span>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">MOLA (MGS)</div>
                <div className="text-xs text-text-muted">Mars Orbiter Laser Altimeter DEM (463m/px)</div>
              </div>
              <Badge variant={getDatasetStatus("MOLA")}>{getDatasetStatus("MOLA")}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">CTX (MRO)</div>
                <div className="text-xs text-text-muted">Context Camera 6m/pixel regional DEMs</div>
              </div>
              <Badge variant={getDatasetStatus("CTX")}>{getDatasetStatus("CTX")}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">HiRISE (MRO)</div>
                <div className="text-xs text-text-muted">Sub-meter micro-topography & boulder fields</div>
              </div>
              <Badge variant={getDatasetStatus("HiRISE")}>{getDatasetStatus("HiRISE")}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">THEMIS & CRISM</div>
                <div className="text-xs text-text-muted">Infrared thermal inertia and mineralogy</div>
              </div>
              <Badge variant={getDatasetStatus("CRISM")}>{getDatasetStatus("CRISM")}</Badge>
            </li>
          </ul>
        </Card>
      </div>
    </section>
  );
};

