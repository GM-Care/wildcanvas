"use client";

import React, { useState } from "react";
import {
  X,
  HardDrive,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { STORAGE_PLANS, StoragePlan, formatBytes } from "@/lib/storagePlans";
import { formatINR } from "@/lib/currency";

interface StorageUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId?: string;
  storageUsedBytes?: number;
  onPlanUpgraded?: (newPlan: StoragePlan) => void;
}

export default function StorageUpgradeModal({
  isOpen,
  onClose,
  currentPlanId = "STARTER_FREE",
  storageUsedBytes = 0,
  onPlanUpgraded,
}: StorageUpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleUpgrade = async (plan: StoragePlan) => {
    if (plan.id === currentPlanId) return;

    setIsProcessing(plan.id);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/studio/storage/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, billingCycle }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Upgraded to ${plan.name}! Your storage quota is now ${plan.storageGB} GB.`);
        if (onPlanUpgraded) onPlanUpgraded(plan);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        alert(data.error || "Failed to upgrade plan.");
      }
    } catch {
      alert("Network error processing upgrade.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <HardDrive className="h-3.5 w-3.5 text-amber-400" />
            <span>Cloudflare R2 Master Storage Expansion</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Upgrade Your Studio Master Storage
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Uncompressed RAW, 16-bit TIFFs, and ultra-high-resolution master archives demand reliable zero-egress cloud storage. Expand beyond the default 5GB Free Tier to unlock lower platform fees and priority CDN speeds.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-2 flex items-center justify-center">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-amber-400 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-amber-400 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full uppercase font-extrabold border border-emerald-500/30">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-xs font-bold text-emerald-400">
            {successMsg}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STORAGE_PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const price =
              billingCycle === "yearly"
                ? Math.round(plan.priceYearlyINR / 12)
                : plan.priceMonthlyINR;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  plan.popular
                    ? "border-amber-500/60 bg-gradient-to-b from-amber-950/20 via-zinc-900/80 to-zinc-950 shadow-lg shadow-amber-500/10"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                } ${isCurrent ? "ring-2 ring-emerald-500/50" : ""}`}
              >
                {/* Popular or Current Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-950 shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-3 right-3">
                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Current Plan
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Storage Meter Highlight */}
                  <div className="my-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-400 font-medium">Storage Quota</span>
                      <strong className="text-amber-400 font-bold">{plan.storageGB} GB</strong>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((storageUsedBytes / plan.limitBytes) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="mb-4">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-black text-white">
                        {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
                      </span>
                      {price > 0 && (
                        <span className="text-xs text-zinc-400">/ month</span>
                      )}
                    </div>
                    {billingCycle === "yearly" && plan.priceYearlyINR > 0 && (
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Billed annually at ₹{plan.priceYearlyINR.toLocaleString("en-IN")}/yr
                      </p>
                    )}
                    <div className="mt-1 text-[11px] font-semibold text-emerald-400">
                      Take Rate: {(plan.commissionRate * 100).toFixed(0)}% (Keep {(100 - plan.commissionRate * 100).toFixed(0)}%)
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 text-[11px] text-zinc-300 mb-6 pt-3 border-t border-zinc-800/80">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <Check className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Upgrade Button */}
                <button
                  type="button"
                  disabled={isCurrent || !!isProcessing}
                  onClick={() => handleUpgrade(plan)}
                  className={`w-full rounded-xl py-2.5 px-3 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    isCurrent
                      ? "bg-zinc-800/80 text-zinc-500 cursor-not-allowed"
                      : plan.popular
                      ? "bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md shadow-amber-500/20"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  {isProcessing === plan.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Activating Plan...</span>
                    </>
                  ) : isCurrent ? (
                    <span>Active Storage Tier</span>
                  ) : (
                    <>
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Upgrade with Razorpay</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footnote on Zero-Egress Storage */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              All tiers include unlimited bandwidth egress with zero Cloudflare transfer surcharges.
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">Instant activation with GST invoice receipt</span>
        </div>
      </div>
    </div>
  );
}
