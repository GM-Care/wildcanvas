"use client";

import React, { useState } from "react";
import { PhotoDto, LicenseTierDto } from "@/types";
import { useCart } from "@/context/CartContext";
import { Check, ShoppingBag, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function LicenseBuySection({ photo }: { photo: PhotoDto }) {
  const { addItem, setIsCartOpen } = useCart();
  const [selectedTierId, setSelectedTierId] = useState<string>(
    photo.licenseTiers[0]?.id || ""
  );

  const selectedTier =
    photo.licenseTiers.find((t) => t.id === selectedTierId) ||
    photo.licenseTiers[0];

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
  };

  const handleInstantBuy = () => {
    handleAddToCart();
    setIsCartOpen(true);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
          Digital License Options
        </h3>
        <span className="text-xs text-amber-400 font-bold">
          ${(selectedTier ? selectedTier.priceCents / 100 : 0).toFixed(2)} USD
        </span>
      </div>

      {/* Tier Selector */}
      <div className="space-y-3">
        {photo.licenseTiers.map((tier) => {
          const isSelected = tier.id === selectedTierId;
          return (
            <div
              key={tier.id}
              onClick={() => setSelectedTierId(tier.id)}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                isSelected
                  ? "border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/5"
                  : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
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
                  <span className="text-xs font-bold text-white">
                    {tier.displayName || tier.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-white">
                  ${(tier.priceCents / 100).toFixed(2)}
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 pl-6 leading-relaxed">
                {tier.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={handleInstantBuy}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-3 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Zap className="h-4 w-4 fill-zinc-950" />
          <span>
            Instant Checkout • ${(selectedTier ? selectedTier.priceCents / 100 : 0).toFixed(2)}
          </span>
        </button>

        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-semibold text-zinc-200 transition-colors"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Add License to Cart</span>
        </button>
      </div>

      {/* Trust & Guarantee points */}
      <div className="pt-2 border-t border-zinc-800/80 space-y-2 text-[11px] text-zinc-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Includes verified digital license certificate & rights deed</span>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Full uncompressed master delivery via Cloudflare R2</span>
        </div>
      </div>
    </div>
  );
}
