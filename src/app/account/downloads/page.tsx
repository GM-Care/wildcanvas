import React from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { Download, Layers, ShieldCheck, Clock, ExternalLink, Camera, ShoppingBag } from "lucide-react";

export default async function BuyerVaultPage() {
  const session = await getSession();

  // If logged in, fetch user's grants; otherwise fetch recent grants for demo
  const grants = await prisma.downloadGrant.findMany({
    where: session?.userId
      ? { buyerId: session.userId }
      : undefined,
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      photo: {
        include: { tenant: true },
      },
      orderItem: {
        include: { order: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-amber-400">
          <Layers className="h-3.5 w-3.5" />
          <span>Buyer Digital Asset Vault</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          My Purchased Licenses & Master Downloads
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Access your authorized digital asset master files. Every asset is delivered via high-speed, zero-egress Cloudflare R2 object storage with time-expiring HMAC signed download tokens.
        </p>
      </div>

      {/* Grants Table / Cards */}
      {grants.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-16 text-center space-y-4">
          <Camera className="h-12 w-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active downloads found</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            You have not acquired any digital photo licenses yet, or you are browsing in guest mode. License any photo from our marketplace to unlock master files in your vault.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center space-x-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-300 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Explore Marketplace</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grants.map((grant) => {
            const isExpired = new Date() > grant.expiresAt;
            const isExhausted = grant.downloadCount >= grant.maxDownloads;
            const canDownload = !isExpired && !isExhausted;

            return (
              <div
                key={grant.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md flex flex-col justify-between space-y-6"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={grant.photo.previewUrl}
                    alt={grant.photo.title}
                    className="h-24 w-32 rounded-2xl object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {grant.orderItem.licenseName}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {grant.orderItem.order.orderNumber}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white truncate">
                      {grant.photo.title}
                    </h3>

                    <Link
                      href={`/s/${grant.photo.tenant.slug}`}
                      className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1"
                    >
                      <span>{grant.photo.tenant.name}</span>
                      <ExternalLink className="h-3 w-3 text-zinc-500" />
                    </Link>

                    <div className="text-[11px] text-zinc-500 flex items-center space-x-3 pt-1">
                      <span>{grant.photo.width} × {grant.photo.height} px</span>
                      <span>•</span>
                      <span>{grant.photo.format}</span>
                    </div>
                  </div>
                </div>

                {/* Token Telemetry & Actions */}
                <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-zinc-400">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>
                        Valid until: {grant.expiresAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Downloads: {grant.downloadCount} / {grant.maxDownloads} used
                    </div>
                  </div>

                  {canDownload ? (
                    <a
                      href={`/api/download/${grant.tokenHash}`}
                      className="flex items-center justify-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-xs font-bold text-zinc-950 transition-colors shadow-md shadow-amber-500/10"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Master</span>
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 text-center">
                      {isExpired ? "License Expired" : "Limit Reached"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
