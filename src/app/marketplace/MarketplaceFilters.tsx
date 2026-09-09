"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

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
  searchQuery: initialSearchQuery,
  tenants,
}: MarketplaceFiltersProps) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const basePath = pathname.startsWith("/marketplace") ? "/marketplace" : "/";

  const [query, setQuery] = useState(initialSearchQuery || "");

  const categories = ["All", "Wildlife", "Architecture", "Landscape", "Aerial", "Portrait"];

  const buildUrl = (updates: Partial<{ category: string; studio: string; sort: string; q: string }>) => {
    const p = new URLSearchParams();
    const category = updates.category !== undefined ? updates.category : currentCategory;
    const studio = updates.studio !== undefined ? updates.studio : currentStudio;
    const sort = updates.sort !== undefined ? updates.sort : currentSort;
    const q = updates.q !== undefined ? updates.q : query;

    if (category && category !== "All") p.set("category", category);
    if (studio && studio !== "All") p.set("studio", studio);
    if (sort && sort !== "newest") p.set("sort", sort);
    if (q && q.trim()) p.set("q", q.trim());

    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ q: query }));
  };

  const handleClearSearch = () => {
    setQuery("");
    router.push(buildUrl({ q: "" }));
  };

  return (
    <div className="space-y-2.5">
      {/* Search Bar & Studio / Sort Dropdowns */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search master photography by subject, camera, or tags..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* Filters: Studio & Sort */}
        <div className="flex items-center gap-2">
          {/* Studio Selector */}
          <div className="flex items-center space-x-1.5 text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800 rounded-xl px-2.5 py-1.5">
            <span className="font-semibold text-zinc-400">Studio:</span>
            <select
              value={currentStudio}
              onChange={(e) => router.push(buildUrl({ studio: e.target.value }))}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-zinc-900 text-white">
                All Studios
              </option>
              {tenants.map((t) => (
                <option key={t.id} value={t.slug} className="bg-zinc-900 text-white">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5 text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800 rounded-xl px-2.5 py-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
            <select
              value={currentSort}
              onChange={(e) => router.push(buildUrl({ sort: e.target.value }))}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="newest" className="bg-zinc-900 text-white">
                Newest
              </option>
              <option value="downloads" className="bg-zinc-900 text-white">
                Most Licensed
              </option>
              <option value="views" className="bg-zinc-900 text-white">
                Most Viewed
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = currentCategory === cat;
          return (
            <Link
              key={cat}
              href={buildUrl({ category: cat })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-amber-400 text-zinc-950 shadow-sm"
                  : "bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
