import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PhotoCard from "@/components/PhotoCard";
import {
  Camera,
  Cloud,
  Shield,
  Sparkles,
  ArrowRight,
  Zap,
  Lock,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { PhotoDto, TenantDto } from "@/types";

export const revalidate = 60; // 1 min ISR
export const runtime = "edge";

async function getHomeData() {
  try {
    const [featuredPhotos, tenants] = await Promise.all([
      prisma.photo.findMany({
        where: { status: "PUBLISHED" },
        take: 6,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        include: {
          tenant: true,
          licenseTiers: true,
        },
      }),
      prisma.tenant.findMany({
        where: { status: "ACTIVE" },
        take: 3,
        include: {
          _count: { select: { photos: true } },
        },
      }),
    ]);

    const formattedPhotos: PhotoDto[] = featuredPhotos.map((p) => ({
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

    const formattedTenants: TenantDto[] = tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      bio: t.bio,
      logoUrl: t.logoUrl,
      bannerUrl: t.bannerUrl,
      brandColor: t.brandColor,
      watermarkText: t.watermarkText,
      payoutEmail: t.payoutEmail,
      status: t.status as any,
      commissionRate: t.commissionRate,
      photoCount: t._count.photos,
    }));

    return { photos: formattedPhotos, tenants: formattedTenants };
  } catch (err) {
    console.error("Failed to load home data:", err);
    return { photos: [], tenants: [] };
  }
}

export default async function HomePage() {
  const { photos, tenants } = await getHomeData();

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-amber-500/30 to-amber-700/10 blur-[130px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md mb-8">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Multi-Tenant Architecture • Cloudflare R2 Storage Powered</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            World-Class Photography. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              Independent Creator Studios.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The premier multi-tenant photography platform. Creators launch bespoke branded storefronts with zero-egress Cloudflare R2 storage, automated EXIF telemetry, and cryptographic licensing rights.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="flex items-center space-x-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-zinc-950 hover:bg-amber-300 transition-all shadow-xl shadow-amber-500/20"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/studios"
              className="flex items-center space-x-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-6 py-3.5 text-sm font-semibold text-zinc-200 hover:border-zinc-700 hover:text-white transition-all backdrop-blur-md"
            >
              <Camera className="h-4 w-4 text-amber-400" />
              <span>Browse Creator Studios</span>
            </Link>

            <Link
              href="/architecture"
              className="flex items-center space-x-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-3.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/10 transition-all"
            >
              <Cloud className="h-4 w-4 text-amber-400" />
              <span>R2 Architecture</span>
            </Link>
          </div>

          {/* Value Props Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 backdrop-blur-sm">
              <Cloud className="h-5 w-5 text-amber-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Cloudflare R2 Native</h4>
              <p className="text-[11px] text-zinc-400 mt-1">Zero egress fees for terabyte-scale high-res master files.</p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 backdrop-blur-sm">
              <Shield className="h-5 w-5 text-emerald-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Anti-Theft Shield</h4>
              <p className="text-[11px] text-zinc-400 mt-1">Right-click barrier & dynamic preview watermarking.</p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 backdrop-blur-sm">
              <Layers className="h-5 w-5 text-sky-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Multi-Tenancy</h4>
              <p className="text-[11px] text-zinc-400 mt-1">Dedicated storefronts, custom branding, independent payouts.</p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 backdrop-blur-sm">
              <Lock className="h-5 w-5 text-purple-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Signed Grants</h4>
              <p className="text-[11px] text-zinc-400 mt-1">Time-expiring cryptographic download access tokens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Curated Photos */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              Curated Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Masterpiece Photography
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
          >
            <span>View All Curated Photos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            No photos loaded yet. Please run database seed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, idx) => (
              <PhotoCard key={photo.id} photo={photo} priority={idx < 2} />
            ))}
          </div>
        )}
      </section>

      {/* Meet The Creator Studios (Multi-Tenancy Spotlight) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              Multi-Tenant Storefronts
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Featured Creator Studios
            </h2>
          </div>
          <Link
            href="/studios"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
          >
            <span>All Studios</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/s/${tenant.slug}`}
              className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl"
            >
              {/* Banner */}
              <div className="h-32 w-full overflow-hidden bg-zinc-950 relative">
                <img
                  src={tenant.bannerUrl || ""}
                  alt={tenant.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
              </div>

              {/* Profile Bar */}
              <div className="p-6 relative pt-0">
                <div className="-mt-10 mb-3 flex items-center justify-between">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-zinc-900 bg-zinc-800 shadow-xl">
                    <img
                      src={tenant.logoUrl || ""}
                      alt={tenant.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                    style={{
                      backgroundColor: `${tenant.brandColor}15`,
                      color: tenant.brandColor,
                      borderColor: `${tenant.brandColor}30`,
                    }}
                  >
                    Verified Tenant
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {tenant.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {tenant.bio}
                </p>

                <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span>{tenant.photoCount || 0} Published Works</span>
                  <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                    <span>Enter Studio</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cloudflare R2 Architecture Spotlight Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-amber-950/30 p-8 sm:p-12">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
              <Cloud className="h-3.5 w-3.5" />
              <span>Storage Architecture</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Zero Egress Fees. Multi-Gigabyte Master Files.
            </h3>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Traditional cloud storage vendors charge steep egress fees when buyers download 50MB uncompressed RAW or 16-bit TIFF files. WildCanvas is built from the ground up on Cloudflare R2 S3-compatible object storage, delivering predictable costs, global CDN edge caching, and private vault download presigning.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-zinc-300">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>Zero bandwidth egress surcharges</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>Time-expiring signed download URLs</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>Automated multi-resolution preview caching</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/architecture"
                className="inline-flex items-center space-x-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors"
              >
                <span>Read Full Technical Architecture</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
