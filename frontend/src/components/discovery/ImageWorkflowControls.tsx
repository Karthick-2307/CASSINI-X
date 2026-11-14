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
      <Card className="space-y-3 bg-[#111826] border border-[#243044] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#F8FAFC]">1. Orbital Image Upload</span>
          <span className="text-[11px] text-[#94A3B8]">PNG, JPG, TIFF (Max 50MB)</span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-btn p-5 text-center cursor-pointer transition-colors ${
            dragOver ? "border-[#38BDF8] bg-[#162033]" : "border-[#2E3C54] hover:border-[#38BDF8]/70 bg-[#162033]/60"
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
                className="max-h-36 mx-auto rounded border border-[#243044] object-contain"
              />
              <div className="text-[11px] text-[#94A3B8] truncate">
                {metadata.file?.name} ({(metadata.file!.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
              {scaleBarWidthMeters && (
                <div className="flex items-center justify-center space-x-1 font-mono text-[10px] text-[#94A3B8] pt-1">
                  <div className="w-16 h-1 bg-[#38BDF8] inline-block" />
                  <span>~{scaleBarWidthMeters} m scale</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 space-y-1">
              <p className="text-[#F8FAFC] font-semibold text-xs">Click or drag image to upload</p>
              <p className="text-[11px] text-[#94A3B8]">Top-down orbital imagery only</p>
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#94A3B8]/80 leading-normal">
          Ground-level rover or astronaut photos are not supported yet. Use top-down orbital images.
        </p>
      </Card>

      {/* 2. Metadata */}
      <Card className="space-y-3 bg-[#111826] border border-[#243044] p-4 shadow-sm">
        <span className="font-semibold text-[#F8FAFC] block">2. Image Metadata</span>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">Target Body</label>
            <select
              value={metadata.body}
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, body: e.target.value as "Mars" | "Moon" }))
              }
              className="w-full bg-[#162033] border border-[#243044] rounded px-2.5 py-1.5 text-xs text-[#F8FAFC] font-sans focus:border-[#38BDF8] focus:outline-none"
            >
              <option value="Mars">Mars</option>
              <option value="Moon">Moon</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">Instrument / Source</label>
            <input
              type="text"
              placeholder="e.g. MRO CTX, HiRISE"
              value={metadata.instrument}
              onChange={(e) => setMetadata((prev) => ({ ...prev, instrument: e.target.value }))}
              className="w-full bg-[#162033] border border-[#243044] rounded px-2.5 py-1.5 text-xs text-[#F8FAFC] font-sans focus:border-[#38BDF8] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-[#F8FAFC] font-medium">
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
            className="w-full bg-[#162033] border border-[#243044] rounded px-2.5 py-1.5 text-xs font-mono text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
          />
          {(!metadata.resolutionMPerPx || metadata.resolutionMPerPx <= 0) && (
            <p className="text-[11px] text-status-warn mt-1">
              Without a ground resolution the comparison is not valid.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">Latitude (opt)</label>
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
              className="w-full bg-[#162033] border border-[#243044] rounded px-2.5 py-1.5 text-xs font-mono text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1">Longitude (opt)</label>
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
              className="w-full bg-[#162033] border border-[#243044] rounded px-2.5 py-1.5 text-xs font-mono text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
            />
          </div>
        </div>

        {metadata.lat === "" && (
          <p className="text-[11px] text-[#94A3B8]/90">
            Without a location, only visual similarity can be computed.
          </p>
        )}
      </Card>

      {/* 3. Search Settings & Honest Status */}
      <Card className="space-y-3 bg-[#111826] border border-[#243044] p-4 shadow-sm">
        <span className="font-semibold text-[#F8FAFC] block">3. Search Settings</span>

        <div className="space-y-1">
          <label className="block text-[11px] text-[#94A3B8]">Analysis Method</label>
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
                <div className="text-[#F8FAFC] font-medium">Deep visual embedding</div>
                <div className="text-[11px] text-[#94A3B8]">Vision transformer representation of surface patterns</div>
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
                <div className="text-[#F8FAFC] font-medium">Classical texture</div>
                <div className="text-[11px] text-[#94A3B8]">Gray-level co-occurrence and directional gradient filters</div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <label className="block text-[11px] text-[#94A3B8]">Earth Search Candidates</label>
          <div className="space-y-1 text-[11px] text-[#94A3B8]">
            <div className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked disabled className="rounded text-accent" />
              <span className="text-[#E5E7EB]">Devon Island, Nunavut (SRTM 30m) [Indexed]</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked disabled className="rounded text-accent" />
              <span className="text-[#E5E7EB]">Atacama Desert, Chile (SRTM 30m) [Indexed]</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked disabled className="rounded text-accent" />
              <span className="text-[#E5E7EB]">Lanzarote Volcanic Field (SRTM 30m) [Indexed]</span>
            </div>
            <div className="flex items-center space-x-2 text-[#94A3B8]/50">
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
            className="w-full text-xs text-[#94A3B8] bg-[#162033] border border-[#243044]"
          >
            Not available yet: backend not implemented
          </Button>
          <p className="text-[11px] text-[#94A3B8]/70 text-center mt-1.5 font-sans">
            Visual texture inference pipeline is planned for the next backend release.
          </p>
        </div>
      </Card>
    </div>
  );
};
