import React from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import Link from "next/link";
import {
  Camera,
  Upload,
  DollarSign,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Settings,
  ExternalLink,
  Eye,
  Download,
  Plus,
} from "lucide-react";

export default async function StudioDashboardPage() {
  const session = await getSession();

  // Resolve active tenant
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
      orderItems: {
        include: { order: true },
      },
    },
  });

  if (!tenant) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-zinc-400">
        Tenant studio not found. Please log in as a creator.
      </div>
    );
  }

  const totalSalesCents = tenant.orderItems.reduce((acc, item) => acc + item.priceCents, 0);
  const totalPayoutCents = Math.round(totalSalesCents * (1 - tenant.commissionRate));
  const totalDownloads = tenant.photos.reduce((acc, p) => acc + p.downloadCount, 0);
  const totalViews = tenant.photos.reduce((acc, p) => acc + p.viewCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-amber-500/50">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-bold text-white">
                {tenant.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white">{tenant.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Tenant
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Creator Studio Console • Commission Rate: {(tenant.commissionRate * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/s/${tenant.slug}`}
            target="_blank"
            className="flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          >
            <span>Public Storefront</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </Link>

          <Link
            href="/studio/upload"
            className="flex items-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Photos</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            ${(totalSalesCents / 100).toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Total revenue generated from licenses</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Your Earnings</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            ${(totalPayoutCents / 100).toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Net payout at {((1 - tenant.commissionRate) * 100).toFixed(0)}% creator rate
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Photos</span>
            <Camera className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {tenant.photos.length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Live in your branded storefront</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Downloads & Views</span>
            <Download className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalDownloads} <span className="text-sm font-normal text-zinc-400">/ {totalViews}</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Master downloads / Total views</p>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/studio/upload"
          className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 p-5 transition-all flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Upload & EXIF Engine
              </div>
              <div className="text-xs text-zinc-400">Add high-resolution works & set pricing</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
        </Link>

        <Link
          href="/studio/photos"
          className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 p-5 transition-all flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                Photo Catalog Manager
              </div>
              <div className="text-xs text-zinc-400">Edit metadata, tiers, and visibility</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-sky-400 transition-colors" />
        </Link>

        <Link
          href="/studio/settings"
          className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 p-5 transition-all flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Storefront Branding & R2
              </div>
              <div className="text-xs text-zinc-400">Custom watermark, banners & payouts</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
        </Link>
      </div>

      {/* Catalog Table Preview */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden backdrop-blur-md">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Recent Catalog Uploads
          </h3>
          <Link
            href="/studio/photos"
            className="text-xs font-semibold text-amber-400 hover:underline"
          >
            View All ({tenant.photos.length})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/50 text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3">Photo</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Dimensions</th>
                <th className="px-5 py-3">License Range</th>
                <th className="px-5 py-3">Metrics</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {tenant.photos.slice(0, 5).map((photo) => {
                const prices = photo.licenseTiers.map((t) => t.priceCents);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                return (
                  <tr key={photo.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={photo.previewUrl}
                          alt={photo.title}
                          className="h-12 w-16 rounded-lg object-cover bg-zinc-950 border border-zinc-800"
                        />
                        <span className="font-semibold text-white max-w-[200px] truncate">
                          {photo.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                        {photo.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-400">
                      {photo.width} × {photo.height}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-amber-400">
                      ${(minPrice / 100).toFixed(0)} – ${(maxPrice / 100).toFixed(0)}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Eye className="h-3 w-3 text-zinc-500" />
                          <span>{photo.viewCount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Download className="h-3 w-3 text-zinc-500" />
                          <span>{photo.downloadCount}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/photo/${photo.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                      >
                        Preview →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
