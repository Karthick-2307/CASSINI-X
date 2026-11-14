import React, { useState } from "react";
import { Button, Card, Badge } from "../ui";

export interface ImageMetadata {
  file: File | null;
  previewUrl: string | null;
  body: "Mars" | "Moon";
  instrument: string;
  resolutionMPerPx: number | "";
  lat: number | "";
  lon: number | "";
  acquisitionDate: string;
  method: "classical" | "embedding";
  topK: number;
}

interface ImageWorkflowControlsProps {
  metadata: ImageMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<ImageMetadata>>;
}

export const ImageWorkflowControls: React.FC<ImageWorkflowControlsProps> = ({
  metadata,
  setMetadata,
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("File exceeds maximum allowed size of 50 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setMetadata((prev) => ({ ...prev, file, previewUrl: url }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const scaleBarWidthMeters =
    typeof metadata.resolutionMPerPx === "number" && metadata.resolutionMPerPx > 0
      ? Math.round(metadata.resolutionMPerPx * 100)
      : null;

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* 1. Image Upload Dropzone */}
      <Card className="space-y-3 bg-surface border-border p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-text-primary">1. Orbital Image Upload</span>
          <span className="text-[11px] text-text-muted">PNG, JPG, TIFF (Max 50MB)</span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border border-dashed rounded-btn p-4 text-center cursor-pointer transition-colors ${
            dragOver ? "border-accent bg-raised" : "border-border hover:border-text-muted/60 bg-raised/40"
          }`}
          onClick={() => document.getElementById("image-upload-input")?.click()}
        >
          <input
            id="image-upload-input"
            type="file"
            accept=".png,.jpg,.jpeg,.tif,.tiff"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          {metadata.previewUrl ? (
            <div className="space-y-2">
              <img
                src={metadata.previewUrl}
                alt="Uploaded orbital preview"
                className="max-h-36 mx-auto rounded border border-border object-contain"
              />
              <div className="text-[11px] text-text-muted truncate">
                {metadata.file?.name} ({(metadata.file!.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
              {scaleBarWidthMeters && (
                <div className="flex items-center justify-center space-x-1 font-mono text-[10px] text-text-muted pt-1">
                  <div className="w-16 h-1 bg-accent inline-block" />
                  <span>~{scaleBarWidthMeters} m scale</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 space-y-1">
              <p className="text-text-primary font-medium">Click or drag image to upload</p>
              <p className="text-[11px] text-text-muted">Top-down orbital imagery only</p>
            </div>
          )}
        </div>

        <p className="text-[11px] text-text-muted/80 leading-normal">
          Ground-level rover or astronaut photos are not supported yet. Use top-down orbital images.
        </p>
      </Card>

      {/* 2. Metadata */}
      <Card className="space-y-3 bg-surface border-border p-4">
        <span className="font-semibold text-text-primary block">2. Image Metadata</span>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-text-muted mb-1">Target Body</label>
            <select
              value={metadata.body}
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, body: e.target.value as "Mars" | "Moon" }))
              }
              className="w-full bg-raised border border-border rounded px-2.5 py-1 text-xs text-text-primary font-sans"
            >
              <option value="Mars">Mars</option>
              <option value="Moon">Moon</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-text-muted mb-1">Instrument / Source</label>
            <input
              type="text"
              placeholder="e.g. MRO CTX, HiRISE"
              value={metadata.instrument}
              onChange={(e) => setMetadata((prev) => ({ ...prev, instrument: e.target.value }))}
              className="w-full bg-raised border border-border rounded px-2.5 py-1 text-xs text-text-primary font-sans"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-text-primary font-medium">
              Ground Resolution (m/px) <span className="text-status-error">*</span>
            </label>
            <Badge variant="measured">Required</Badge>
          </div>
          <input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="e.g. 6.0"
            value={metadata.resolutionMPerPx}
            onChange={(e) =>
              setMetadata((prev) => ({
                ...prev,
                resolutionMPerPx: e.target.value ? parseFloat(e.target.value) : "",
              }))
            }
            className="w-full bg-raised border border-border rounded px-2.5 py-1 text-xs font-mono text-text-primary"
          />
          {(!metadata.resolutionMPerPx || metadata.resolutionMPerPx <= 0) && (
            <p className="text-[11px] text-status-warn mt-1">
              Without a ground resolution the comparison is not valid.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="block text-[11px] text-text-muted mb-1">Latitude (opt)</label>
            <input
              type="number"
              step="0.001"
              placeholder="e.g. 18.38"
              value={metadata.lat}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  lat: e.target.value ? parseFloat(e.target.value) : "",
                }))
              }
              className="w-full bg-raised border border-border rounded px-2 py-1 text-xs font-mono text-text-primary"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text-muted mb-1">Longitude (opt)</label>
            <input
              type="number"
              step="0.001"
              placeholder="e.g. 77.58"
              value={metadata.lon}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  lon: e.target.value ? parseFloat(e.target.value) : "",
                }))
              }
              className="w-full bg-raised border border-border rounded px-2 py-1 text-xs font-mono text-text-primary"
            />
          </div>
        </div>

        {metadata.lat === "" && (
          <p className="text-[11px] text-text-muted">
            Without a location, only visual similarity can be computed.
          </p>
        )}
      </Card>

      {/* 3. Search Settings & Honest Status */}
      <Card className="space-y-3 bg-surface border-border p-4">
        <span className="font-semibold text-text-primary block">3. Search Settings</span>

        <div className="space-y-1">
          <label className="block text-[11px] text-text-muted">Analysis Method</label>
          <div className="space-y-1.5 pt-1">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="radio"
                name="method"
                checked={metadata.method === "embedding"}
                onChange={() => setMetadata((prev) => ({ ...prev, method: "embedding" }))}
                className="mt-0.5 text-accent"
              />
              <div>
                <div className="text-text-primary font-medium">Deep visual embedding</div>
                <div className="text-[11px] text-text-muted">Vision transformer representation of surface patterns</div>
              </div>
            </label>

            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="radio"
                name="method"
                checked={metadata.method === "classical"}
                onChange={() => setMetadata((prev) => ({ ...prev, method: "classical" }))}
                className="mt-0.5 text-accent"
              />
              <div>
                <div className="text-text-primary font-medium">Classical texture</div>
                <div className="text-[11px] text-text-muted">Gray-level co-occurrence and directional gradient filters</div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <label className="block text-[11px] text-text-muted">Earth Search Candidates</label>
          <div className="space-y-1 text-[11px] text-text-muted">
            <div className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked disabled className="rounded text-accent" />
              <span>Devon Island, Nunavut (SRTM 30m) [Indexed]</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked disabled className="rounded text-accent" />
              <span>Atacama Desert, Chile (SRTM 30m) [Indexed]</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked disabled className="rounded text-accent" />
              <span>Lanzarote Volcanic Field (SRTM 30m) [Indexed]</span>
            </div>
            <div className="flex items-center space-x-2 text-text-muted/40">
              <input type="checkbox" disabled className="rounded" />
              <span>Tibetan Plateau [Not indexed]</span>
            </div>
          </div>
        </div>

        {/* Action Button: Honest Unavailable State */}
        <div className="pt-2">
          <Button
            variant="secondary"
            size="md"
            disabled
            className="w-full text-xs text-text-muted bg-raised border-border"
          >
            Not available yet: backend not implemented
          </Button>
          <p className="text-[11px] text-text-muted/70 text-center mt-1.5 font-sans">
            Visual texture inference pipeline is planned for the next backend release.
          </p>
        </div>
      </Card>
    </div>
  );
};
