"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PhotoDto } from "@/types";
import ExifHud from "./ExifHud";
import LicensePickerModal from "./LicensePickerModal";
import { ShoppingBag, Eye, Shield, Maximize2 } from "lucide-react";

interface PhotoCardProps {
  photo: PhotoDto;
  priority?: boolean;
}

export default function PhotoCard({ photo, priority = false }: PhotoCardProps) {
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const lowestPrice = Math.min(...photo.licenseTiers.map((t) => t.priceCents));

  return (
    <>
      <div className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:shadow-amber-500/5">
        {/* Photo Container with Anti-Theft Shield */}
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-zinc-950">
          <img
            src={photo.previewUrl}
            alt={photo.title}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />

          {/* Transparent Anti-Theft Overlay Shield */}
          <div
            className="absolute inset-0 z-10 select-none bg-transparent"
            onContextMenu={(e) => {
              e.preventDefault();
              alert("Right-click downloading is protected by WildCanvas digital rights management. Please license the photo to obtain high-resolution uncompressed files.");
            }}
          />

          {/* Discreet Dynamic Watermark Badge */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="flex items-center space-x-1 rounded-md bg-zinc-950/70 px-2 py-0.5 text-[10px] font-medium text-zinc-400 backdrop-blur-md border border-white/10">
              <Shield className="h-2.5 w-2.5 text-amber-400" />
              <span>Preview</span>
            </span>
          </div>

          {/* Category Pill */}
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <span className="rounded-md bg-zinc-950/70 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-md border border-white/10">
              {photo.category}
            </span>
          </div>

          {/* Bottom Hover Action Bar */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between">
            <Link
              href={`/photo/${photo.slug}`}
              className="flex items-center space-x-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors"
            >
              <Eye className="h-3.5 w-3.5 text-zinc-300" />
              <span>Inspect</span>
            </Link>

            <button
              onClick={() => setIsLicenseOpen(true)}
              className="flex items-center space-x-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-md transition-colors"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>License ${(lowestPrice / 100).toFixed(0)}+</span>
            </button>
          </div>
        </div>

        {/* Card Metadata Footer */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link
              href={`/photo/${photo.slug}`}
              className="font-bold text-sm text-white hover:text-amber-400 transition-colors line-clamp-1"
            >
              {photo.title}
            </Link>
            <span className="text-xs font-bold text-amber-400 shrink-0">
              from ${(lowestPrice / 100).toFixed(0)}
            </span>
          </div>

          {/* Photographer Tenant info */}
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <Link
              href={`/s/${photo.tenantSlug}`}
              className="flex items-center space-x-1.5 hover:text-white transition-colors truncate"
            >
              <div className="h-4 w-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[9px] shrink-0">
                {photo.tenantName.charAt(0)}
              </div>
              <span className="truncate font-medium">{photo.tenantName}</span>
            </Link>
            <span className="text-[11px] text-zinc-500">
              {photo.width} × {photo.height}
            </span>
          </div>

          {/* EXIF Glance */}
          <ExifHud exif={photo.exif} variant="compact" />
        </div>
      </div>

      {/* License Picker Modal */}
      <LicensePickerModal
        photo={photo}
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
      />
    </>
  );
}
