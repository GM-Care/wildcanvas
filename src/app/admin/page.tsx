import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Shield,
  TrendingUp,
  Camera,
  Layers,
  Users,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sliders,
  CreditCard,
} from "lucide-react";
import { isR2Configured } from "@/lib/r2";
import { formatINR } from "@/lib/currency";
import { getPaymentSettings } from "@/lib/paymentSettings";

export const revalidate = 10;
export const runtime = "edge";

export default async function AdminDashboardPage() {
  const [
    tenants,
    photosCount,
    usersCount,
    orders,
    paymentConfig,
  ] = await Promise.all([
    prisma.tenant.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { photos: true, orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.photo.count(),
    prisma.user.count(),
    prisma.order.findMany({
      where: { status: "COMPLETED" },
    }),
    getPaymentSettings(),
  ]);

  const totalGmvCents = orders.reduce((acc, o) => acc + o.totalAmountCents, 0);
  const totalPlatformFeeCents = orders.reduce((acc, o) => acc + o.platformFeeCents, 0);
  const totalCreatorPayoutsCents = orders.reduce((acc, o) => acc + o.tenantPayoutCents, 0);
  const pendingKycCount = tenants.filter(
    (t: any) => t.kycStatus === "PENDING_APPROVAL" || t.status === "PENDING_REVIEW"
  ).length;

  const isRazorpayConfigured = Boolean(paymentConfig.keyId && paymentConfig.keySecret);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
      {/* Super Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Super Admin Console</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Master Oversight
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Global governance, Razorpay India payments, platform commissions, and multi-tenant telemetry.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Razorpay Gateway Status Pill */}
          <Link
            href="/admin/payments"
            className="flex items-center space-x-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 hover:border-amber-500/40 px-4 py-2 text-xs transition-colors"
          >
            <CreditCard className={`h-4 w-4 ${isRazorpayConfigured ? "text-emerald-400" : "text-amber-400"}`} />
            <div>
              <div className="font-semibold text-white flex items-center space-x-1">
                <span>Razorpay (₹ INR)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {paymentConfig.mode.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400">
                {isRazorpayConfigured ? "Live / Connected" : "Sandbox Simulator"}
              </div>
            </div>
          </Link>

          {/* Cloudflare R2 Status Pill */}
          <div className="flex items-center space-x-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-xs">
            <Cloud className={`h-4 w-4 ${isR2Configured ? "text-emerald-400" : "text-amber-400"}`} />
            <div>
              <div className="font-semibold text-white">Cloudflare R2 Storage</div>
              <div className="text-[10px] text-zinc-400">
                {isR2Configured ? "Connected (Live Bucket)" : "Zero-Config Emulation"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 bg-zinc-900/80 border border-zinc-800 p-1 rounded-2xl text-xs w-fit">
        <span className="px-4 py-2 rounded-xl bg-zinc-800 text-white font-bold">
          Overview
        </span>
        <Link
          href="/admin/tenants"
          className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors flex items-center space-x-1.5"
        >
          <span>Tenants &amp; Studios</span>
          {pendingKycCount > 0 && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {pendingKycCount} pending
            </span>
          )}
        </Link>
        <Link
          href="/admin/payments"
          className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors flex items-center space-x-1.5"
        >
          <span>Razorpay Gateway</span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        </Link>
      </div>

      {/* Pending KYC Action Alert */}
      {pendingKycCount > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs text-amber-300">
            <span className="text-base">⏳</span>
            <span>
              <strong>{pendingKycCount} Merchant KYC &amp; Brand Review {pendingKycCount === 1 ? "Request" : "Requests"}</strong> awaiting Master Admin verification.
            </span>
          </div>
          <Link
            href="/admin/tenants"
            className="rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs font-bold text-zinc-950 transition-colors shadow-sm self-start sm:self-auto"
          >
            Open Review Queue &rarr;
          </Link>
        </div>
      )}

      {/* Global Financial & Platform KPIs (INR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Platform GMV</span>
            <span className="text-emerald-400 font-bold text-sm">₹ INR</span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {formatINR(totalGmvCents)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Across all Indian creator sales</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md border-amber-500/20">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Take Rate</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {formatINR(totalPlatformFeeCents)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">15% net retained platform revenue</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Creator Payouts</span>
            <span className="text-sky-400 font-bold text-sm">₹ INR</span>
          </div>
          <div className="text-3xl font-extrabold text-sky-400">
            {formatINR(totalCreatorPayoutsCents)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">85% disbursed to creators</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Tenants</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {tenants.length} <span className="text-sm font-normal text-zinc-500">/ {photosCount} photos</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">{usersCount} registered users</p>
        </div>
      </div>

      {/* Tenants Oversight Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Tenant Studios & Commission Management
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review active creator storefronts, adjust commission rates, and manage verification badges.
            </p>
          </div>
          <Link
            href="/admin/tenants"
            className="flex items-center space-x-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-amber-400" />
            <span>Manage Tenants</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/60 text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3.5">Tenant Studio</th>
                <th className="px-6 py-3.5">Creator Owner</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Commission Rate</th>
                <th className="px-6 py-3.5">Catalog Size</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-10 w-10 rounded-xl overflow-hidden bg-zinc-800 border shrink-0"
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
                      <div>
                        <div className="font-bold text-white flex items-center space-x-1.5">
                          <span>{tenant.name}</span>
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: tenant.brandColor }}
                          />
                        </div>
                        <div className="text-[11px] text-zinc-400">/s/{tenant.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{tenant.owner.name}</div>
                    <div className="text-[11px] text-zinc-400">{tenant.owner.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        tenant.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{tenant.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-amber-400">
                    {(tenant.commissionRate * 100).toFixed(0)}% Platform Fee
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white">{tenant._count.photos}</span> works
                    <span className="text-zinc-500 ml-1">({tenant._count.orderItems} orders)</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/s/${tenant.slug}`}
                      target="_blank"
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      <span>View Storefront</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
