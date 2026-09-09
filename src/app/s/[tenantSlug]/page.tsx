import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PhotoCard from "@/components/PhotoCard";
import { PhotoDto } from "@/types";
import { Camera, ShieldCheck, Mail, MapPin, Sparkles, ExternalLink } from "lucide-react";

interface TenantStorefrontPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export const revalidate = 30;
export const runtime = "edge";

export default async function TenantStorefrontPage({ params }: TenantStorefrontPageProps) {
  const { tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: {
      owner: { select: { name: true, email: true } },
      photos: {
        where: { status: "PUBLISHED" },
        include: {
          licenseTiers: true,
          tenant: true,
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  const formattedPhotos: PhotoDto[] = tenant.photos.map((p) => ({
    id: p.id,
    tenantId: p.tenantId,
    tenantName: tenant.name,
    tenantSlug: tenant.slug,
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

  return (
    <div className="space-y-12 pb-20">
      {/* Branded Storefront Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-zinc-950">
        {tenant.bannerUrl ? (
          <img
            src={tenant.bannerUrl}
            alt={tenant.name}
            className="h-full w-full object-cover select-none pointer-events-none"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${tenant.brandColor}33, #09090b)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      </div>

      {/* Tenant Profile Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative -mt-24 sm:-mt-28">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-4 border-zinc-900 bg-zinc-800 shadow-2xl shrink-0"
                style={{ borderColor: tenant.brandColor }}
              >
                {tenant.logoUrl ? (
                  <img
                    src={tenant.logoUrl}
                    alt={tenant.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-800 text-white font-bold text-2xl">
                    {tenant.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {tenant.name}
                  </h1>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center space-x-1"
                    style={{
                      backgroundColor: `${tenant.brandColor}15`,
                      color: tenant.brandColor,
                      borderColor: `${tenant.brandColor}40`,
                    }}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Creator</span>
                  </span>
                </div>

                <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                  {tenant.bio || "Independent photography creator studio."}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-2">
                  <div className="flex items-center space-x-1">
                    <Camera className="h-3.5 w-3.5 text-amber-400" />
                    <span>{formattedPhotos.length} Available Works</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Cloudflare R2 Direct Vault</span>
                  </div>
                  {tenant.watermarkText && (
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Watermark: {tenant.watermarkText}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Direct support badge */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-400 max-w-xs shrink-0">
              <div className="font-semibold text-white mb-1 flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Direct Creator Payouts</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                85%+ of every purchase goes directly to {tenant.name}. Master original downloads are served directly with cryptographic licenses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Photo Catalog */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              Works by {tenant.name}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select any photo to preview EXIF optics and purchase commercial licenses.
            </p>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            {formattedPhotos.length} Masterpieces
          </span>
        </div>

        {formattedPhotos.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-16 text-center text-zinc-500">
            No published photos yet in this studio.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedPhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
