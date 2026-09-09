import React from "react";
import { prisma } from "@/lib/prisma";
import PhotoCard from "@/components/PhotoCard";
import { PhotoDto } from "@/types";
import { Search, Filter, SlidersHorizontal, Camera } from "lucide-react";
import Link from "next/link";
import MarketplaceFilters from "./MarketplaceFilters";

interface MarketplacePageProps {
  searchParams:
    | {
        category?: string;
        studio?: string;
        q?: string;
        sort?: string;
      }
    | Promise<{
        category?: string;
        studio?: string;
        q?: string;
        sort?: string;
      }>;
}

export const revalidate = 30; // 30s ISR
export const runtime = "edge";

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await Promise.resolve(searchParams);
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
      select: { id: true, name: true, slug: true },
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

  const categories = ["All", "Wildlife", "Architecture", "Landscape", "Aerial", "Portrait"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-amber-400">
          <Camera className="h-3.5 w-3.5" />
          <span>Universal Marketplace Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Explore Digital Photography
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Discover and license original master files directly from verified independent creators. Every purchase includes high-resolution digital rights and cryptographic token delivery.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <MarketplaceFilters
        currentCategory={currentCategory}
        currentStudio={currentStudio}
        currentSort={currentSort}
        searchQuery={searchQuery}
        tenants={tenants}
      />

      {/* Photography Grid */}
      {formattedPhotos.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-16 text-center">
          <Camera className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No matching photos found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
            Try adjusting your category or creator filters to view available photography works.
          </p>
          <Link
            href="/marketplace"
            className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-300 transition-colors"
          >
            Reset Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedPhotos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
}
