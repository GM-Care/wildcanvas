"use client";

import React from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

interface TenantOption {
  id: string;
  name: string;
  slug: string;
}

interface MarketplaceFiltersProps {
  currentCategory: string;
  currentStudio: string;
  currentSort: string;
  searchQuery: string;
  tenants: TenantOption[];
}

export default function MarketplaceFilters({
  currentCategory,
  currentStudio,
  currentSort,
  searchQuery,
  tenants,
}: MarketplaceFiltersProps) {
  const categories = ["All", "Wildlife", "Architecture", "Landscape", "Aerial", "Portrait"];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {categories.map((cat) => {
          const isActive = currentCategory === cat;
          return (
            <Link
              key={cat}
              href={`/marketplace?category=${cat}&studio=${currentStudio}&q=${searchQuery}&sort=${currentSort}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/10"
                  : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {/* Studio & Sort Controls */}
      <div className="flex items-center gap-3">
        {/* Studio Selector */}
        <div className="flex items-center space-x-1.5 text-xs text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-3 py-1.5">
          <span className="font-medium text-zinc-400">Studio:</span>
          <select
            defaultValue={currentStudio}
            onChange={(e) => {
              window.location.href = `/marketplace?category=${currentCategory}&studio=${e.target.value}&q=${searchQuery}&sort=${currentSort}`;
            }}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-zinc-900">
              All Creators
            </option>
            {tenants.map((t) => (
              <option key={t.id} value={t.slug} className="bg-zinc-900">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-1.5 text-xs text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-3 py-1.5">
          <SlidersHorizontal className="h-3 w-3 text-amber-400" />
          <select
            defaultValue={currentSort}
            onChange={(e) => {
              window.location.href = `/marketplace?category=${currentCategory}&studio=${currentStudio}&q=${searchQuery}&sort=${e.target.value}`;
            }}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="newest" className="bg-zinc-900">
              Newest
            </option>
            <option value="downloads" className="bg-zinc-900">
              Most Licensed
            </option>
            <option value="views" className="bg-zinc-900">
              Most Viewed
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
