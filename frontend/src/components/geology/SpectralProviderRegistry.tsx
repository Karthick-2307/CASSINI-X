import React from "react";
import { Card, Badge } from "../ui";

export const SpectralProviderRegistry: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
          Spectral Dataset Provider Registry & Ingestion Protocols
        </h3>
        <span className="text-xs font-mono text-text-muted">
          `backend/app/ingest/spectral_base.py`
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* EMIT */}
        <Card className="space-y-3 border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-accent-cyan">EMIT (Earth)</span>
            <Badge variant="neutral">not_ingested</Badge>
          </div>
          <div className="text-xs text-text-muted space-y-1">
            <div><strong>Instrument:</strong> NASA Earth Surface Mineral Dust Source (ISS)</div>
            <div><strong>Coverage:</strong> 381–2493 nm (285 bands, ~60m GSD)</div>
            <div><strong>Credentials:</strong> NASA Earthdata Login (free account)</div>
            <div className="text-status-warn font-mono text-[11px]">
              File Size: ~1.8 GB netCDF4 cube per granule
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-[10px] font-mono text-text-muted bg-panel p-2 rounded overflow-x-auto">
              python -m app.ingest.cli --instrument EMIT --granule EMITL2ARFL_001
            </div>
          </div>
        </Card>

        {/* M3 */}
        <Card className="space-y-3 border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-accent-blue">M³ (Moon)</span>
            <Badge variant="neutral">not_ingested</Badge>
          </div>
          <div className="text-xs text-text-muted space-y-1">
            <div><strong>Instrument:</strong> Moon Mineralogy Mapper (Chandrayaan-1)</div>
            <div><strong>Coverage:</strong> 430–3000 nm (85 bands, ~140m GSD)</div>
            <div><strong>Credentials:</strong> NASA PDS Geosciences Node</div>
            <div className="text-status-warn font-mono text-[11px]">
              File Size: ~450 MB IMG/LBL pairs per strip
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-[10px] font-mono text-text-muted bg-panel p-2 rounded overflow-x-auto">
              python -m app.ingest.cli --instrument M3 --target mare_tranquillitatis
            </div>
          </div>
        </Card>

        {/* CRISM */}
        <Card className="space-y-3 border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-orange-400">CRISM (Mars)</span>
            <Badge variant="neutral">not_ingested</Badge>
          </div>
          <div className="text-xs text-text-muted space-y-1">
            <div><strong>Instrument:</strong> Compact Reconnaissance Imaging (MRO)</div>
            <div><strong>Coverage:</strong> 362–3920 nm (544 bands, 18–36m GSD)</div>
            <div><strong>Credentials:</strong> NASA Planetary Data System (PDS)</div>
            <div className="text-status-warn font-mono text-[11px]">
              File Size: 1.2–4.5 GB CAT/MTRDR products
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-[10px] font-mono text-text-muted bg-panel p-2 rounded overflow-x-auto">
              python -m app.ingest.cli --instrument CRISM --target jezero_crater
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

