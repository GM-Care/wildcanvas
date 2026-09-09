import React from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { Camera, Plus, Trash2, Eye, Download, ArrowLeft, ExternalLink } from "lucide-react";

export const runtime = "edge";

export default async function StudioPhotosPage() {
  const session = await getSession();

  let tenantId = session?.tenantId;
  if (!tenantId) {
    const defaultTenant = await prisma.tenant.findFirst({
      where: { slug: "apex-safari" },
    });
    tenantId = defaultTenant?.id;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      photos: {
        include: { licenseTiers: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tenant) {
    return <div className="p-16 text-center text-zinc-400">Studio not found.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/studio"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-white mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Studio Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white">
            Photo Catalog Manager
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your published digital assets, EXIF optics, and license pricing tiers.
          </p>
        </div>

        <Link
          href="/studio/upload"
          className="flex items-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Upload New Work</span>
        </Link>
      </div>

      {/* Grid of Photo Cards with Management Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenant.photos.map((photo) => {
          const prices = photo.licenseTiers.map((t) => t.priceCents);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const exif = JSON.parse(photo.exif || "{}");

          return (
            <div
              key={photo.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden backdrop-blur-md flex flex-col justify-between"
            >
              <div className="relative aspect-[3/2] w-full bg-zinc-950">
                <img
                  src={photo.previewUrl}
                  alt={photo.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-3 left-3 rounded-md bg-zinc-950/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-md border border-white/10">
                  {photo.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {photo.title}
                  </h3>
                  {exif.camera && (
                    <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                      {exif.camera} {exif.lens ? `• ${exif.lens}` : ""}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                    <span>License Range:</span>
                    <span className="font-bold text-white">
                      ${(minPrice / 100).toFixed(0)} – ${(maxPrice / 100).toFixed(0)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                    <span>Master Dimensions:</span>
                    <span className="font-mono">{photo.width} × {photo.height}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-zinc-400">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{photo.viewCount}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Download className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{photo.downloadCount}</span>
                    </span>
                  </div>

                  <Link
                    href={`/photo/${photo.slug}`}
                    target="_blank"
                    className="flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    <span>View Public</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
