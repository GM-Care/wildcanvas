import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProtectedImageViewer from "@/components/ProtectedImageViewer";
import ExifHud from "@/components/ExifHud";
import PhotoCard from "@/components/PhotoCard";
import LicenseBuySection from "./LicenseBuySection";
import { PhotoDto } from "@/types";
import { ArrowLeft, Shield, Sparkles, ExternalLink, Calendar, Download, Eye } from "lucide-react";
import Link from "next/link";

interface PhotoDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 30;

export default async function PhotoDetailPage({ params }: PhotoDetailPageProps) {
  const { slug } = await params;

  const photo = await prisma.photo.findFirst({
    where: { slug },
    include: {
      tenant: true,
      licenseTiers: true,
    },
  });

  if (!photo) {
    notFound();
  }

  // Increment view count asynchronously
  await prisma.photo.update({
    where: { id: photo.id },
    data: { viewCount: { increment: 1 } },
  });

  const formattedPhoto: PhotoDto = {
    id: photo.id,
    tenantId: photo.tenantId,
    tenantName: photo.tenant.name,
    tenantSlug: photo.tenant.slug,
    title: photo.title,
    slug: photo.slug,
    description: photo.description,
    category: photo.category,
    tags: JSON.parse(photo.tags || "[]"),
    aspectRatio: photo.aspectRatio,
    width: photo.width,
    height: photo.height,
    format: photo.format,
    fileSizeBytes: photo.fileSizeBytes,
    exif: JSON.parse(photo.exif || "{}"),
    previewUrl: photo.previewUrl,
    originalUrl: photo.originalUrl,
    status: photo.status as any,
    featured: photo.featured,
    viewCount: photo.viewCount + 1,
    downloadCount: photo.downloadCount,
    licenseTiers: photo.licenseTiers.map((t) => ({
      id: t.id,
      name: t.name,
      displayName: t.displayName,
      description: t.description,
      priceCents: t.priceCents,
      currency: t.currency,
      maxResolutionWidth: t.maxResolutionWidth,
      allowedUsage: t.allowedUsage,
    })),
    createdAt: photo.createdAt.toISOString(),
  };

  // Fetch more photos from this creator
  const moreFromCreator = await prisma.photo.findMany({
    where: {
      tenantId: photo.tenantId,
      id: { not: photo.id },
      status: "PUBLISHED",
    },
    take: 3,
    include: {
      tenant: true,
      licenseTiers: true,
    },
  });

  const formattedMore: PhotoDto[] = moreFromCreator.map((p) => ({
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-12">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/marketplace"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center space-x-3 text-xs text-zinc-400">
          <span className="flex items-center space-x-1">
            <Eye className="h-3.5 w-3.5 text-zinc-500" />
            <span>{formattedPhoto.viewCount} Views</span>
          </span>
          <span className="flex items-center space-x-1">
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            <span>{formattedPhoto.downloadCount} Licenses</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Left Viewer, Right Licensing & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Protected Image Viewer & EXIF HUD */}
        <div className="lg:col-span-8 space-y-6">
          <ProtectedImageViewer
            previewUrl={formattedPhoto.previewUrl}
            title={formattedPhoto.title}
            tenantName={formattedPhoto.tenantName}
            aspectRatio={formattedPhoto.aspectRatio}
          />

          {/* EXIF HUD Telemetry */}
          <ExifHud exif={formattedPhoto.exif} variant="full" />
        </div>

        {/* Right Column: Title, Creator Studio Bio, License Tier Selector */}
        <div className="lg:col-span-4 space-y-6">
          {/* Title & Metadata */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                {formattedPhoto.category}
              </span>
              <span className="text-xs text-zinc-500">
                {formattedPhoto.width} × {formattedPhoto.height} px
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-white leading-snug">
              {formattedPhoto.title}
            </h1>

            {formattedPhoto.description && (
              <p className="text-xs text-zinc-400 leading-relaxed">
                {formattedPhoto.description}
              </p>
            )}

            {/* Creator Studio Card */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <Link
                href={`/s/${photo.tenant.slug}`}
                className="group flex items-center space-x-3"
              >
                <div className="h-10 w-10 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
                  <img
                    src={photo.tenant.logoUrl || ""}
                    alt={photo.tenant.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center space-x-1">
                    <span>{photo.tenant.name}</span>
                    <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-amber-400" />
                  </div>
                  <div className="text-[11px] text-zinc-400">Independent Creator</div>
                </div>
              </Link>

              <Link
                href={`/s/${photo.tenant.slug}`}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                Storefront
              </Link>
            </div>
          </div>

          {/* Interactive Client-Side License Configurator & Checkout */}
          <LicenseBuySection photo={formattedPhoto} />
        </div>
      </div>

      {/* More From This Creator Section */}
      {formattedMore.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              More Works by {photo.tenant.name}
            </h3>
            <Link
              href={`/s/${photo.tenant.slug}`}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              View Creator Storefront →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formattedMore.map((p) => (
              <PhotoCard key={p.id} photo={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
