"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock,
  Check,
  X,
  Building2,
  CreditCard,
  FileText,
  User,
  HardDrive,
  ExternalLink,
  ChevronRight,
  Eye,
} from "lucide-react";
import { formatBytes } from "@/lib/storagePlans";

export default function AdminTenantsManagementPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "KYC_QUEUE">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Reject modal state
  const [rejectingTenantId, setRejectingTenantId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/admin/tenants");
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleUpdate = async (tenantId: string, updates: any) => {
    setStatusMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, ...updates }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message || "Tenant updated successfully!");
        fetchTenants();
      } else {
        setErrorMsg(data.error || "Failed to update tenant.");
      }
    } catch {
      setErrorMsg("Failed to update tenant.");
    }
  };

  const handleKycAction = async (tenantId: string, action: "APPROVE_KYC" | "REJECT_KYC", reason?: string) => {
    setStatusMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, action, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message || (action === "APPROVE_KYC" ? "KYC Approved!" : "KYC Rejected"));
        setRejectingTenantId(null);
        setRejectReason("");
        fetchTenants();
      } else {
        setErrorMsg(data.error || "Action failed.");
      }
    } catch {
      setErrorMsg("Network error processing KYC action.");
    }
  };

  const pendingKycCount = tenants.filter(
    (t) => t.kycStatus === "PENDING_APPROVAL" || t.status === "PENDING_REVIEW"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Admin Console</span>
        </Link>

        <div className="flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl text-xs">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            Overview
          </Link>
          <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white font-bold">
            Tenants
          </span>
          <Link
            href="/admin/payments"
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center space-x-1.5"
          >
            <span>Razorpay Gateway</span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-rose-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Merchant &amp; Studio Governance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Manage Tenants, Indian KYC Approvals &amp; Storage Quotas
        </h1>
        <p className="text-xs text-zinc-400 max-w-3xl">
          Review mandatory Indian KYC onboarding submissions, approve studio brand changes, adjust commission take rates, and monitor 5GB Free vs Premium Cloudflare R2 storage allocations.
        </p>
      </div>

      {/* Feedback Alerts */}
      {statusMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400 flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sub-Tabs: All Tenants vs KYC Review Queue */}
      <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ALL"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          All Tenants ({tenants.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("KYC_QUEUE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === "KYC_QUEUE"
              ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>KYC &amp; Brand Review Queue</span>
          {pendingKycCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "KYC_QUEUE"
                ? "bg-zinc-950 text-amber-400"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}>
              {pendingKycCount}
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading merchant accounts...</span>
        </div>
      ) : activeTab === "KYC_QUEUE" ? (
        /* KYC & Brand Review Queue View */
        <div className="space-y-6">
          {tenants.filter((t) => t.kycStatus === "PENDING_APPROVAL" || t.status === "PENDING_REVIEW").length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-16 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Review Queue is Clear!</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                All merchant profiles and Indian KYC verification requests have been inspected and processed.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tenants
                .filter((t) => t.kycStatus === "PENDING_APPROVAL" || t.status === "PENDING_REVIEW")
                .map((t) => (
                  <div
                    key={t.id}
                    className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/10 via-zinc-900/80 to-zinc-950 p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-xl"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                      <div className="flex items-center space-x-4">
                        <div
                          className="h-14 w-14 rounded-2xl overflow-hidden bg-zinc-800 border-2 shrink-0 p-1"
                          style={{ borderColor: t.brandColor }}
                        >
                          <img
                            src={t.pendingLogoUrl || t.logoUrl || ""}
                            alt={t.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-white">
                              {t.pendingName ? (
                                <span>
                                  {t.name} &rarr;{" "}
                                  <span className="text-amber-400">{t.pendingName}</span>
                                </span>
                              ) : (
                                t.name
                              )}
                            </h3>
                            <span className="rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                              Pending Review
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Account Owner: <strong>{t.owner?.name}</strong> ({t.owner?.email})
                            {t.kycSubmittedAt && (
                              <span className="ml-2 text-zinc-500">
                                • Submitted: {new Date(t.kycSubmittedAt).toLocaleDateString("en-IN")}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Approval / Rejection Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setRejectingTenantId(t.id)}
                          className="flex items-center space-x-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject with Feedback</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleKycAction(t.id, "APPROVE_KYC")}
                          className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-zinc-950 transition-colors shadow-md shadow-emerald-500/20"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve Brand &amp; KYC</span>
                        </button>
                      </div>
                    </div>

                    {/* Visual Comparison: Avatar & Logo Changes */}
                    {(t.pendingLogoUrl || t.pendingAvatarUrl || t.pendingName) && (
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          <span>Proposed Brand Visuals (Awaiting Approval)</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {t.pendingLogoUrl && (
                            <div className="flex items-center space-x-3 text-xs text-zinc-300">
                              <div className="h-12 w-12 rounded-xl border border-zinc-700 bg-zinc-900 p-1 shrink-0 overflow-hidden">
                                <img src={t.pendingLogoUrl} alt="New Logo" className="h-full w-full object-contain" />
                              </div>
                              <div>
                                <span className="font-semibold text-white block">New Studio Logo</span>
                                <span className="text-[11px] text-zinc-500">Replaces current storefront logo upon approval</span>
                              </div>
                            </div>
                          )}

                          {t.pendingAvatarUrl && (
                            <div className="flex items-center space-x-3 text-xs text-zinc-300">
                              <div className="h-12 w-12 rounded-full border border-amber-400 bg-zinc-800 shrink-0 overflow-hidden">
                                <img src={t.pendingAvatarUrl} alt="New Avatar" className="h-full w-full object-cover" />
                              </div>
                              <div>
                                <span className="font-semibold text-white block">New Merchant Profile Avatar</span>
                                <span className="text-[11px] text-zinc-500">Replaces photographer profile avatar upon approval</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Detailed India KYC Inspection Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Tax & Identity Data */}
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-1.5">
                          <Building2 className="h-3.5 w-3.5 text-amber-400" />
                          <span>Identity &amp; Tax Information</span>
                        </h4>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between py-1 border-b border-zinc-800/60">
                            <span className="text-zinc-400">Legal Entity Name:</span>
                            <strong className="text-white">{t.legalName || "Not Provided"}</strong>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-800/60">
                            <span className="text-zinc-400">Entity Structure:</span>
                            <span className="text-white font-medium">{t.entityType || "INDIVIDUAL"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-800/60">
                            <span className="text-zinc-400">Permanent Account Number (PAN):</span>
                            <strong className="font-mono text-amber-400 tracking-wider">
                              {t.panNumber || "NOT PROVIDED"}
                            </strong>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-800/60">
                            <span className="text-zinc-400">GSTIN:</span>
                            <span className="font-mono text-zinc-300">
                              {t.gstin || "Exempt (< ₹20 Lakhs)"}
                            </span>
                          </div>
                        </div>

                        {/* KYC Proof Document */}
                        {t.kycDocUrl ? (
                          <div className="pt-2">
                            <span className="text-xs text-zinc-400 block mb-1.5">Attached ID / Tax Document Proof:</span>
                            <a
                              href={t.kycDocUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-2 rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              <span>View Scanned Document Attachment &rarr;</span>
                            </a>
                          </div>
                        ) : (
                          <div className="text-xs text-amber-400/80 pt-2 flex items-center space-x-1">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>No document proof attached</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Bank Payout Settlement Info */}
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Bank Account Details (Razorpay Payouts)</span>
                        </h4>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between py-1 border-b border-zinc-800/60">
                            <span className="text-zinc-400">Bank Name:</span>
                            <strong className="text-white">{t.bankName || "Not Provided"}</strong>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-800/60">
                            <span className="text-zinc-400">Account Holder Name:</span>
                            <span className="text-white font-medium">{t.accountHolderName || t.legalName || "Not Provided"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-800/60">
                            <span className="text-zinc-400">Bank Account Number:</span>
                            <strong className="font-mono text-white tracking-wider">
                              {t.accountNumber || "NOT PROVIDED"}
                            </strong>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-800/60">
                            <span className="text-zinc-400">IFSC Code:</span>
                            <strong className="font-mono text-amber-400">
                              {t.ifscCode || "NOT PROVIDED"}
                            </strong>
                          </div>
                        </div>

                        <div className="pt-2 text-[11px] text-zinc-500 leading-relaxed">
                          Razorpay payouts will settle sales earnings in INR directly to this account after deducting platform commission.
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        /* All Tenants Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-12 w-12 rounded-2xl overflow-hidden bg-zinc-800 border-2 shrink-0 p-1"
                      style={{ borderColor: t.brandColor }}
                    >
                      {t.logoUrl ? (
                        <img src={t.logoUrl} alt={t.name} className="h-full w-full object-contain" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-white">
                          {t.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight">{t.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{t.owner?.name}</p>
                    </div>
                  </div>

                  {/* KYC Pill */}
                  <div>
                    {t.kycStatus === "VERIFIED" ? (
                      <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                        KYC Verified
                      </span>
                    ) : t.kycStatus === "PENDING_APPROVAL" ? (
                      <span className="rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                        KYC Review Pending
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-800 text-zinc-400 px-2 py-0.5 text-[10px] font-medium">
                        KYC Unverified
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                  {t.bio || "No bio provided."}
                </p>

                {/* Storage Quota Card */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium flex items-center space-x-1">
                      <HardDrive className="h-3 w-3 text-amber-400" />
                      <span>R2 Storage</span>
                    </span>
                    <span className="text-white font-bold text-[11px]">
                      {formatBytes(t.storageUsedBytes || 0)} / {formatBytes(t.storageLimitBytes || 5368709120)}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((t.storageUsedBytes || 0) / (t.storageLimitBytes || 5368709120)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                    <span>Plan: {(t.storagePlan || "STARTER_FREE").replace("_", " ")}</span>
                    <span>{((t.commissionRate || 0.15) * 100).toFixed(0)}% fee</span>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  {/* Status Toggle */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Account Status:</span>
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdate(t.id, { status: e.target.value })}
                      className={`font-semibold rounded-lg px-2.5 py-1 text-xs border cursor-pointer ${
                        t.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : t.status === "PENDING_REVIEW"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}
                    >
                      <option value="ACTIVE" className="bg-zinc-900 text-white">ACTIVE</option>
                      <option value="PENDING_REVIEW" className="bg-zinc-900 text-white">PENDING_REVIEW</option>
                      <option value="SUSPENDED" className="bg-zinc-900 text-white">SUSPENDED</option>
                    </select>
                  </div>

                  {/* Commission Rate Adjuster */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Platform Take Rate:</span>
                    <select
                      value={t.commissionRate}
                      onChange={(e) => handleUpdate(t.id, { commissionRate: e.target.value })}
                      className="bg-zinc-950 border border-zinc-800 text-amber-400 font-bold rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="0.06">6% Agency Enterprise</option>
                      <option value="0.09">9% Studio Master</option>
                      <option value="0.12">12% Pro Creator</option>
                      <option value="0.15">15% Standard Free</option>
                      <option value="0.20">20% Premium Base</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span>Published Works:</span>
                    <span className="font-semibold text-white">{t._count?.photos || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <Link
                  href={`/s/${t.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  View Public Storefront &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingTenantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span>Reject KYC / Brand Submission</span>
            </h3>

            <p className="text-xs text-zinc-400">
              Provide specific feedback to the creator detailing why their submission was rejected (e.g. invalid PAN card image, mismatched bank account name, etc.):
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Attached PAN document is blurry. Please upload a clear photo of the original PAN card."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-red-400 focus:outline-none"
            />

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingTenantId(null);
                  setRejectReason("");
                }}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleKycAction(rejectingTenantId, "REJECT_KYC", rejectReason)}
                className="rounded-xl bg-red-500 hover:bg-red-400 px-4 py-2 text-xs font-bold text-white transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
