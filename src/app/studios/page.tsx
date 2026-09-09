import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Camera, ShieldCheck, ArrowRight, Layers, Sparkles } from "lucide-react";
import { TenantDto } from "@/types";

export const revalidate = 60;
export const runtime = "edge";

export default async function StudiosDirectoryPage() {
  const tenants = await prisma.tenant.findMany({
    where: { status: "ACTIVE" },
    include: {
      _count: { select: { photos: true } },
    },
    orderBy: { createdAt: "asc" },
  });

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-10">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
          <Layers className="h-3.5 w-3.5" />
          <span>Independent Creators</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Creator Studios Directory
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Every photographer on WildCanvas runs their own independent tenant storefront with custom branding, direct licensing terms, and zero-egress Cloudflare R2 storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {formattedTenants.map((tenant) => (
          <div
            key={tenant.id}
            className="group rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col"
          >
            {/* Banner */}
            <div className="relative h-36 w-full bg-zinc-950 overflow-hidden">
              {tenant.bannerUrl && (
                <img
                  src={tenant.bannerUrl}
                  alt={tenant.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
            </div>

            {/* Profile Info */}
            <div className="p-6 relative pt-0 flex-1 flex flex-col justify-between">
              <div>
                <div className="-mt-10 mb-4 flex items-center justify-between">
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

                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  {tenant.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                  {tenant.bio}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {tenant.photoCount} Master Works
                </span>
                <Link
                  href={`/s/${tenant.slug}`}
                  className="flex items-center space-x-1.5 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 px-4 py-2 text-xs font-bold text-white transition-colors"
                >
                  <span>Visit Storefront</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
