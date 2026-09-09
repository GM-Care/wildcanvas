import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PhotoCard from "@/components/PhotoCard";
import { PhotoDto, TenantDto } from "@/types";
import {
  Camera,
  Cloud,
  Shield,
  Sparkles,
  ArrowRight,
  Zap,
  SlidersHorizontal,
  CreditCard,
  Building2,
} from "lucide-react";
import MarketplaceFilters from "./marketplace/MarketplaceFilters";

interface HomePageProps {
  searchParams?: Promise<{
    category?: string;
    studio?: string;
    q?: string;
    sort?: string;
  }>;
}

export const revalidate = 30; // 30s ISR
export const runtime = "edge";

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) || {};
  const currentCategory = params.category || "All";
  const currentStudio = params.studio || "All";
  const searchQuery = params.q || "";
  const currentSort = params.sort || "newest";

  // Build where clause
  const where: any = {
    status: "PUBLISHED",
  };

  if (currentCategory && currentCategory !== "All") {
    where.category = currentCategory;
  }

  if (currentStudio && currentStudio !== "All") {
    where.tenant = { slug: currentStudio };
  }

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { category: { contains: searchQuery } },
      { tags: { contains: searchQuery } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (currentSort === "views") {
    orderBy = { viewCount: "desc" };
  } else if (currentSort === "downloads") {
    orderBy = { downloadCount: "desc" };
  }

  const [photos, tenants] = await Promise.all([
    prisma.photo.findMany({
      where,
      orderBy,
      include: {
        tenant: true,
        licenseTiers: true,
      },
    }),
    prisma.tenant.findMany({
      where: { status: "ACTIVE" },
      include: {
        _count: { select: { photos: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedPhotos: PhotoDto[] = photos.map((p) => ({
    id: p.id,
    tenantId: p.tenantId,
    tenantName: p.tenant.name,
    tenantSlug: p.tenant.slug,
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category,
    tags: JSON.parse(p.tags || "[]"),
    aspectRatio: p.aspectRatio,
    width: p.width,
    height: p.height,
    format: p.format,
    fileSizeBytes: p.fileSizeBytes,
    exif: JSON.parse(p.exif || "{}"),
    previewUrl: p.previewUrl,
    originalUrl: p.originalUrl,
    status: p.status as any,
    featured: p.featured,
    viewCount: p.viewCount,
    downloadCount: p.downloadCount,
    licenseTiers: p.licenseTiers.map((t) => ({
      id: t.id,
      name: t.name,
      displayName: t.displayName,
      description: t.description,
      priceCents: t.priceCents,
      currency: t.currency,
      maxResolutionWidth: t.maxResolutionWidth,
      allowedUsage: t.allowedUsage,
    })),
    createdAt: p.createdAt.toISOString(),
  }));

  const tenantOptions = tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Marketplace Hero & Value Props Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Digital Photography Marketplace • India Edition (₹ INR)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Explore & License Master Photography.
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            Acquire uncompressed master photographic works directly from independent creator studios. Every purchase includes high-resolution digital rights, zero-egress Cloudflare R2 delivery, and Razorpay instant checkout.
          </p>

          {/* Quick Value Pillars Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center space-x-1.5 bg-zinc-950/60 border border-zinc-800 px-3 py-1.5 rounded-xl">
              <CreditCard className="h-3.5 w-3.5 text-amber-400" />
              <span>Razorpay UPI & Cards (₹)</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-zinc-950/60 border border-zinc-800 px-3 py-1.5 rounded-xl">
              <Cloud className="h-3.5 w-3.5 text-emerald-400" />
              <span>Cloudflare R2 Master Files</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-zinc-950/60 border border-zinc-800 px-3 py-1.5 rounded-xl">
              <Shield className="h-3.5 w-3.5 text-sky-400" />
              <span>Cryptographic Licensing Grants</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter, Search, Studio & Category Toolbar */}
      <MarketplaceFilters
        currentCategory={currentCategory}
        currentStudio={currentStudio}
        currentSort={currentSort}
        searchQuery={searchQuery}
        tenants={tenantOptions}
      />

      {/* Photography Catalog Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div>
            Showing <strong className="text-white">{formattedPhotos.length}</strong> masterworks
            {currentCategory !== "All" && (
              <span> in <strong className="text-amber-400">{currentCategory}</strong></span>
            )}
            {currentStudio !== "All" && (
              <span> by <strong className="text-amber-400">{currentStudio}</strong></span>
            )}
            {searchQuery && (
              <span> matching &ldquo;<strong className="text-white">{searchQuery}</strong>&rdquo;</span>
            )}
          </div>

          {(currentCategory !== "All" || currentStudio !== "All" || searchQuery) && (
            <Link
              href="/"
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Reset All Filters
            </Link>
          )}
        </div>

        {formattedPhotos.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-16 text-center space-y-4">
            <Camera className="h-12 w-12 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No photographs match your search</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try adjusting your category selection, search terms, or studio filter to browse other works in the catalog.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-300 transition-colors"
            >
              <span>View All Photography</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedPhotos.map((photo, idx) => (
              <PhotoCard key={photo.id} photo={photo} priority={idx < 3} />
            ))}
          </div>
        )}
      </section>

      {/* Independent Creator Studios Showcase */}
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <Building2 className="h-3.5 w-3.5" />
              <span>Multi-Tenant Storefronts</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Featured Creator Studios
            </h2>
            <p className="text-xs text-zinc-400">
              Visit independent creator storefronts to explore complete collections, gear specs, and custom licensing.
            </p>
          </div>

          <Link
            href="/studios"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            <span>Explore All Studios</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/s/${tenant.slug}`}
              className="group rounded-2xl border border-zinc-800 bg-zinc-950/60 hover:border-amber-500/50 p-4 transition-all duration-300 flex items-center space-x-4"
            >
              <div
                className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-800 border-2 shrink-0"
                style={{ borderColor: tenant.brandColor }}
              >
                {tenant.logoUrl ? (
                  <img src={tenant.logoUrl} alt={tenant.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-bold text-white">
                    {tenant.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                  {tenant.name}
                </div>
                <div className="text-[11px] text-zinc-400 line-clamp-1">
                  {tenant.bio || "Independent photography studio"}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  {tenant._count.photos} works published
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-amber-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
