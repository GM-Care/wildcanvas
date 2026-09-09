"use client";

import React, { useState } from "react";
import { PhotoDto, LicenseTierDto } from "@/types";
import { useCart } from "@/context/CartContext";
import { X, Check, Shield, Download, Sparkles, ShoppingBag, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/currency";

interface LicensePickerModalProps {
  photo: PhotoDto;
  isOpen: boolean;
  onClose: () => void;
}

export default function LicensePickerModal({ photo, isOpen, onClose }: LicensePickerModalProps) {
  const { addItem } = useCart();
  const [selectedTierId, setSelectedTierId] = useState<string>(
    photo.licenseTiers[0]?.id || ""
  );

  if (!isOpen) return null;

  const selectedTier = photo.licenseTiers.find((t) => t.id === selectedTierId) || photo.licenseTiers[0];

  const handleAddToCart = () => {
    if (!selectedTier) return;
    addItem({
      photoId: photo.id,
      photoTitle: photo.title,
      previewUrl: photo.previewUrl,
      tenantId: photo.tenantId,
      tenantName: photo.tenantName,
      licenseTierId: selectedTier.id,
      licenseName: selectedTier.displayName || selectedTier.name,
      priceCents: selectedTier.priceCents,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-4 mb-6 pr-10">
          <div className="h-16 w-20 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
            <img
              src={photo.previewUrl}
              alt={photo.title}
              className="h-full w-full object-cover select-none"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              Select Usage License
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">{photo.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Photographer:{" "}
              <Link
                href={`/s/${photo.tenantSlug}`}
                className="text-amber-400 hover:underline font-medium"
              >
                {photo.tenantName}
              </Link>
            </p>
          </div>
        </div>

        {/* License Options List */}
        <div className="space-y-3 mb-6 max-h-[340px] overflow-y-auto pr-1">
          {photo.licenseTiers.map((tier) => {
            const isSelected = tier.id === selectedTierId;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTierId(tier.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                    : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-800/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-4 w-4 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? "border-amber-400 bg-amber-400 text-zinc-950"
                          : "border-zinc-600 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="font-semibold text-sm text-white">
                      {tier.displayName || tier.name}
                    </span>
                    {tier.name === "COMMERCIAL" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="text-base font-extrabold text-white">
                    {formatINR(tier.priceCents)}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 pl-6 mb-2">{tier.description}</p>

                <div className="pl-6 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-emerald-400" />
                    <span>{tier.allowedUsage}</span>
                  </div>
                  {tier.maxResolutionWidth ? (
                    <div className="flex items-center space-x-1">
                      <Download className="h-3 w-3 text-sky-400" />
                      <span>Max {tier.maxResolutionWidth}px wide</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Full Original Uncompressed Raw/JPEG</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-400 flex items-center space-x-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Instant high-res delivery with cryptographic licensing grant.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="w-1/2 sm:w-auto flex items-center justify-center space-x-2 px-5 py-2 text-xs font-bold text-zinc-950 rounded-xl bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                Add to Cart • {formatINR(selectedTier ? selectedTier.priceCents : 0)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
