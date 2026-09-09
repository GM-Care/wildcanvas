"use client";

import React, { useState } from "react";
import { Shield, ShieldAlert, ZoomIn, ZoomOut, Eye, Sparkles } from "lucide-react";
import { generateWatermarkSvg } from "@/lib/watermark";

interface ProtectedImageViewerProps {
  previewUrl: string;
  title: string;
  tenantName: string;
  aspectRatio?: number;
}

export default function ProtectedImageViewer({
  previewUrl,
  title,
  tenantName,
  aspectRatio = 1.5,
}: ProtectedImageViewerProps) {
  const [showWatermark, setShowWatermark] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const watermarkDataUri = generateWatermarkSvg(`© ${tenantName} / WILDCANVAS PREVIEW`);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
      {/* Top Utility Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="flex items-center space-x-1.5 rounded-full bg-zinc-950/80 border border-zinc-700/80 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-md">
            <Shield className="h-3.5 w-3.5 text-amber-400" />
            <span>Digital Asset Protection Active</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Watermark Toggle */}
          <button
            onClick={() => setShowWatermark(!showWatermark)}
            className={`flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md border transition-colors ${
              showWatermark
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white"
            }`}
            title="Toggle watermark overlay preview"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Watermark {showWatermark ? "ON" : "OFF"}</span>
          </button>

          {/* Zoom Toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="flex items-center space-x-1 rounded-full bg-zinc-900/80 border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white backdrop-blur-md transition-colors"
          >
            {isZoomed ? (
              <>
                <ZoomOut className="h-3.5 w-3.5" />
                <span>Fit</span>
              </>
            ) : (
              <>
                <ZoomIn className="h-3.5 w-3.5" />
                <span>Zoom</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className={`relative w-full flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isZoomed ? "cursor-zoom-out py-0" : "cursor-zoom-in"
        }`}
        onClick={() => setIsZoomed(!isZoomed)}
        style={{ minHeight: "480px", maxHeight: isZoomed ? "none" : "75vh" }}
      >
        <img
          src={previewUrl}
          alt={title}
          className={`w-full select-none transition-transform duration-300 ${
            isZoomed ? "scale-150 object-cover" : "max-h-[75vh] object-contain"
          }`}
          onContextMenu={(e) => {
            e.preventDefault();
            alert("WildCanvas Digital Rights Management: Original master files are securely stored on Cloudflare R2 and accessible only with a verified license grant.");
          }}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* Dynamic Watermark Layer */}
        {showWatermark && (
          <div
            className="absolute inset-0 pointer-events-none select-none z-10"
            style={{
              backgroundImage: `url("${watermarkDataUri}")`,
              backgroundRepeat: "repeat",
            }}
          />
        )}

        {/* Transparent Context-Menu Shield */}
        <div
          className="absolute inset-0 z-20"
          onContextMenu={(e) => {
            e.preventDefault();
            alert("WildCanvas Digital Rights Management: Original master files are securely stored on Cloudflare R2 and accessible only with a verified license grant.");
          }}
        />
      </div>

      {/* Bottom Security Info Banner */}
      <div className="border-t border-zinc-800/80 bg-zinc-900/70 px-5 py-2.5 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cloudflare R2 Edge Cached Preview (WebP)</span>
        </div>
        <div>
          <span>Uncompressed RAW/TIFF master held in private vault</span>
        </div>
      </div>
    </div>
  );
}
