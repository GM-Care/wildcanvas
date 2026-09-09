import React from "react";
import { ExifData } from "@/types";
import { Camera, Aperture, Clock, Zap, Maximize2, Crosshair } from "lucide-react";

interface ExifHudProps {
  exif: ExifData;
  className?: string;
  variant?: "compact" | "full";
}

export default function ExifHud({ exif, className = "", variant = "compact" }: ExifHudProps) {
  const hasExif = Boolean(
    exif.camera || exif.lens || exif.aperture || exif.shutterSpeed || exif.iso
  );

  if (!hasExif) return null;

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex flex-wrap items-center gap-2 rounded-lg bg-zinc-900/90 border border-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-300 backdrop-blur-md ${className}`}
      >
        {exif.camera && (
          <div className="flex items-center space-x-1">
            <Camera className="h-3 w-3 text-amber-400" />
            <span className="font-medium text-white">{exif.camera}</span>
          </div>
        )}
        {exif.focalLength && (
          <span className="text-zinc-400 font-mono">{exif.focalLength}</span>
        )}
        {exif.aperture && (
          <div className="flex items-center space-x-0.5">
            <Aperture className="h-2.5 w-2.5 text-zinc-400" />
            <span className="font-mono text-amber-300">{exif.aperture}</span>
          </div>
        )}
        {exif.shutterSpeed && (
          <div className="flex items-center space-x-0.5">
            <Clock className="h-2.5 w-2.5 text-zinc-400" />
            <span className="font-mono text-zinc-300">{exif.shutterSpeed}</span>
          </div>
        )}
        {exif.iso && (
          <div className="flex items-center space-x-0.5">
            <Zap className="h-2.5 w-2.5 text-zinc-400" />
            <span className="font-mono text-zinc-300">ISO {exif.iso}</span>
          </div>
        )}
      </div>
    );
  }

  // Full HUD (for photo detail view)
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md ${className}`}
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-2">
          <Crosshair className="h-3.5 w-3.5 text-amber-400" />
          <span>Optics & Exposure Telemetry</span>
        </h4>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Verified EXIF
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {exif.camera && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center space-x-1">
              <Camera className="h-3 w-3 text-zinc-400" />
              <span>Camera Body</span>
            </div>
            <div className="text-sm font-semibold text-white truncate">{exif.camera}</div>
          </div>
        )}

        {exif.lens && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center space-x-1">
              <Crosshair className="h-3 w-3 text-zinc-400" />
              <span>Lens Optic</span>
            </div>
            <div className="text-sm font-semibold text-white truncate" title={exif.lens}>
              {exif.lens}
            </div>
          </div>
        )}

        {exif.focalLength && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Focal Length</div>
            <div className="text-sm font-mono font-semibold text-zinc-200">{exif.focalLength}</div>
          </div>
        )}

        {exif.aperture && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center space-x-1">
              <Aperture className="h-3 w-3 text-zinc-400" />
              <span>Aperture</span>
            </div>
            <div className="text-sm font-mono font-semibold text-amber-400">{exif.aperture}</div>
          </div>
        )}

        {exif.shutterSpeed && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center space-x-1">
              <Clock className="h-3 w-3 text-zinc-400" />
              <span>Shutter Speed</span>
            </div>
            <div className="text-sm font-mono font-semibold text-zinc-200">{exif.shutterSpeed}</div>
          </div>
        )}

        {exif.iso && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center space-x-1">
              <Zap className="h-3 w-3 text-zinc-400" />
              <span>Sensitivity</span>
            </div>
            <div className="text-sm font-mono font-semibold text-zinc-200">ISO {exif.iso}</div>
          </div>
        )}

        {exif.megapixels && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center space-x-1">
              <Maximize2 className="h-3 w-3 text-zinc-400" />
              <span>Resolution</span>
            </div>
            <div className="text-sm font-mono font-semibold text-zinc-200">{exif.megapixels}</div>
          </div>
        )}
      </div>
    </div>
  );
}
