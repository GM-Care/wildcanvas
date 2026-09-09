import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, Download, ShieldCheck, ArrowRight, Layers, Camera } from "lucide-react";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { orderNumber } = await searchParams;

  const order = orderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              photo: { include: { tenant: true } },
              downloadGrant: true,
            },
          },
        },
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 sm:p-12 backdrop-blur-xl shadow-2xl text-center space-y-8">
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        {/* Title */}
        <div className="space-y-2 max-w-xl mx-auto">
          <h1 className="text-3xl font-extrabold text-white">
            Digital Licensing Authorized
          </h1>
          <p className="text-sm text-zinc-400">
            Thank you! Your order <span className="font-mono text-amber-400 font-semibold">{orderNumber || "ORD-RECENT"}</span> has been processed. Cryptographic high-resolution download grants have been attached to your account.
          </p>
        </div>

        {/* Order Items & Instant Downloads */}
        {order && order.items.length > 0 && (
          <div className="text-left space-y-4 max-w-2xl mx-auto pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Your Purchased Assets & Master Downloads
            </h3>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={item.photo.previewUrl}
                      alt={item.photoTitle}
                      className="h-16 w-20 rounded-xl object-cover bg-zinc-900 select-none shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {item.photoTitle}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        {item.photo.tenant.name}
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {item.licenseName}
                      </span>
                    </div>
                  </div>

                  {item.downloadGrant && (
                    <a
                      href={`/api/download/${item.downloadGrant.tokenHash}`}
                      className="flex items-center justify-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-bold text-zinc-950 transition-colors shadow-md shadow-amber-500/10 shrink-0"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Master File</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/account/downloads"
            className="flex items-center space-x-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-5 py-3 text-xs font-bold text-white transition-colors"
          >
            <Layers className="h-4 w-4 text-amber-400" />
            <span>Go to My Downloads Vault</span>
          </Link>

          <Link
            href="/marketplace"
            className="flex items-center space-x-2 rounded-xl border border-zinc-800 hover:border-zinc-700 px-5 py-3 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <span>Continue Browsing</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Security notice */}
        <div className="flex items-center justify-center space-x-2 text-xs text-zinc-500 pt-4 border-t border-zinc-800/80">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Files are securely signed via Cloudflare R2 and valid for 30 days.</span>
        </div>
      </div>
    </div>
  );
}
