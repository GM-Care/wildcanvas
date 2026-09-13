"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Shield,
  Palette,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Upload,
  User,
  Image as ImageIcon,
  Building2,
  CreditCard,
  FileText,
  Clock,
  HardDrive,
  ExternalLink,
  Info,
  Sparkles,
} from "lucide-react";
import StorageUpgradeModal from "@/components/StorageUpgradeModal";
import { formatBytes } from "@/lib/storagePlans";

export default function StudioSettingsPage() {
  // Brand identity
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [brandColor, setBrandColor] = useState("#f59e0b");
  const [watermarkText, setWatermarkText] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Pending changes & KYC status
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [pendingLogoUrl, setPendingLogoUrl] = useState<string | null>(null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string>("UNVERIFIED");
  const [kycRejectReason, setKycRejectReason] = useState<string | null>(null);
  const [kycSubmittedAt, setKycSubmittedAt] = useState<string | null>(null);

  // Mandatory India KYC Details
  const [legalName, setLegalName] = useState("");
  const [entityType, setEntityType] = useState("INDIVIDUAL");
  const [panNumber, setPanNumber] = useState("");
  const [gstin, setGstin] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [kycDocUrl, setKycDocUrl] = useState("");
  const [kycDocName, setKycDocName] = useState("");

  // Storage Quota
  const [storagePlan, setStoragePlan] = useState("STARTER_FREE");
  const [storageLimitBytes, setStorageLimitBytes] = useState(5 * 1024 * 1024 * 1024);
  const [storageUsedBytes, setStorageUsedBytes] = useState(0);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [validationError, setValidationError] = useState("");

  const fetchSettings = () => {
    return fetch("/api/studio/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.tenant) {
          const t = data.tenant;
          setName(t.name || "");
          setBio(t.bio || "");
          setBrandColor(t.brandColor || "#f59e0b");
          setWatermarkText(t.watermarkText || "");
          setPayoutEmail(t.payoutEmail || "");
          setBannerUrl(t.bannerUrl || "");
          setLogoUrl(t.logoUrl || "");
          setAvatarUrl(t.avatarUrl || "");

          setPendingName(t.pendingName || null);
          setPendingLogoUrl(t.pendingLogoUrl || null);
          setPendingAvatarUrl(t.pendingAvatarUrl || null);
          setKycStatus(t.kycStatus || "UNVERIFIED");
          setKycRejectReason(t.kycRejectReason || null);
          setKycSubmittedAt(t.kycSubmittedAt || null);

          setLegalName(t.legalName || "");
          setEntityType(t.entityType || "INDIVIDUAL");
          setPanNumber(t.panNumber || "");
          setGstin(t.gstin || "");
          setBankName(t.bankName || "");
          setAccountNumber(t.accountNumber || "");
          setIfscCode(t.ifscCode || "");
          setAccountHolderName(t.accountHolderName || "");
          setKycDocUrl(t.kycDocUrl || "");

          setStoragePlan(t.storagePlan || "STARTER_FREE");
          setStorageLimitBytes(t.storageLimitBytes || 5368709120);
          setStorageUsedBytes(t.storageUsedBytes || 0);
        }
      });
  };

  useEffect(() => {
    fetchSettings().finally(() => setIsLoading(false));
  }, []);

  // Handle local image file uploads for Avatar, Logo, and KYC doc
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    nameSetter?: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (nameSetter) nameSetter(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setStatusMsg("");

    // PAN Validation if provided or submitted
    if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(panNumber.trim())) {
      setValidationError("Invalid Indian PAN format. Please enter a valid 10-character PAN (e.g. ABCDE1234F).");
      return;
    }

    // IFSC Validation if provided
    if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifscCode.trim())) {
      setValidationError("Invalid Indian Bank IFSC format. Please enter a valid 11-character IFSC (e.g. HDFC0000240).");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/studio/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          brandColor,
          watermarkText,
          payoutEmail,
          bannerUrl,
          logoUrl,
          avatarUrl,
          // Mandatory India KYC Details
          legalName,
          entityType,
          panNumber: panNumber.toUpperCase(),
          gstin: gstin.toUpperCase(),
          bankName,
          accountNumber,
          ifscCode: ifscCode.toUpperCase(),
          accountHolderName,
          kycDocUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg(
          data.pendingApproval
            ? "Your changes & KYC details have been submitted to Master Admin for review!"
            : "Studio settings saved successfully!"
        );
        await fetchSettings();
      } else {
        setValidationError(data.error || "Failed to save studio settings.");
      }
    } catch {
      setValidationError("A network error occurred while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24 text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading studio branding & KYC settings...</span>
      </div>
    );
  }

  const storageUsedPercentage = Math.min(
    100,
    Math.round((storageUsedBytes / storageLimitBytes) * 100)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {/* Back Link */}
      <Link
        href="/studio"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Creator Studio Dashboard</span>
      </Link>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Merchant Profile & Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Studio Identity, KYC & Storage Settings
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure your merchant profile avatar, studio brand logo, and mandatory Indian KYC details for verified creator payouts.
          </p>
        </div>

        {/* KYC Status Pill */}
        <div className="flex items-center space-x-2">
          {kycStatus === "VERIFIED" && (
            <div className="flex items-center space-x-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>KYC Verified Creator</span>
            </div>
          )}
          {kycStatus === "PENDING_APPROVAL" && (
            <div className="flex items-center space-x-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-400">
              <Clock className="h-4 w-4 animate-pulse" />
              <span>Admin Review Pending</span>
            </div>
          )}
          {kycStatus === "REJECTED" && (
            <div className="flex items-center space-x-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span>KYC Action Required</span>
            </div>
          )}
          {kycStatus === "UNVERIFIED" && (
            <div className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-zinc-400">
              <span>KYC Not Submitted</span>
            </div>
          )}
        </div>
      </div>

      {/* Cloudflare R2 Storage Quota Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Cloudflare R2 Master Storage Quota
            </h3>
            <span className="text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
              {storagePlan.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-zinc-300">
            <span>
              Using <strong className="text-white">{formatBytes(storageUsedBytes)}</strong> of{" "}
              <strong className="text-amber-400">{formatBytes(storageLimitBytes)}</strong>
            </span>
            <span className="text-zinc-500">({storageUsedPercentage}% capacity)</span>
          </div>

          <div className="w-full max-w-md bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                storageUsedPercentage > 85 ? "bg-red-500" : "bg-amber-400"
              }`}
              style={{ width: `${storageUsedPercentage}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsUpgradeModalOpen(true)}
          className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-zinc-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Upgrade Storage Tier</span>
        </button>
      </div>

      {/* Status Messages & Warnings */}
      {statusMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {validationError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400 flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Pending Admin Review Notice */}
      {kycStatus === "PENDING_APPROVAL" && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
            <Clock className="h-4 w-4" />
            <span>Profile & KYC Under Master Admin Review</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Your proposed brand updates and Indian KYC verification details have been routed to the Master Admin portal. Your live public storefront will reflect these updates once approved.
          </p>
          {(pendingName || pendingLogoUrl || pendingAvatarUrl) && (
            <div className="text-[11px] text-amber-300/80 pt-1 flex flex-wrap gap-3">
              {pendingName && <span>• Pending Name: <strong>{pendingName}</strong></span>}
              {pendingLogoUrl && <span>• New Studio Logo Submitted</span>}
              {pendingAvatarUrl && <span>• New Creator Avatar Submitted</span>}
            </div>
          )}
        </div>
      )}

      {/* KYC Rejection Notice */}
      {kycStatus === "REJECTED" && kycRejectReason && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>KYC Verification Feedback from Master Admin</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Reason: <span className="font-semibold text-white">{kycRejectReason}</span>
          </p>
          <p className="text-[11px] text-zinc-400">
            Please correct the specified details below and re-submit for immediate re-evaluation.
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Merchant Profile Avatar & Brand Visuals */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Palette className="h-3.5 w-3.5" />
            <span>1. Merchant Avatar & Brand Identity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Merchant User Avatar Upload */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-3">
              <label className="text-xs font-bold text-zinc-300 block">
                Merchant Profile Avatar
              </label>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-zinc-800 border-2 border-amber-400/60 shrink-0 flex items-center justify-center relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Merchant Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-zinc-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <label className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload New Avatar</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, setAvatarUrl)}
                    />
                  </label>
                  <p className="text-[10px] text-zinc-500">
                    JPG, PNG, or WebP (square aspect ratio recommended).
                  </p>
                </div>
              </div>
            </div>

            {/* Studio Brand Logo Upload */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-3">
              <label className="text-xs font-bold text-zinc-300 block">
                Studio Storefront Brand Logo
              </label>
              <div className="flex items-center space-x-4">
                <div
                  className="h-16 w-16 rounded-2xl overflow-hidden bg-zinc-900 border-2 shrink-0 flex items-center justify-center p-1"
                  style={{ borderColor: brandColor }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Studio Logo" className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-zinc-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <label className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Studio Logo</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, setLogoUrl)}
                    />
                  </label>
                  <p className="text-[10px] text-zinc-500">
                    Transparent PNG or SVG recommended for dark mode.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Name & Bio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Studio Brand Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Safari Studios"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Changing brand name requires Master Admin approval before going live.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Studio Accent Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-10 w-12 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Photographer Bio & Vision
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your studio specialty, photographic expeditions, and artistic style..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Digital Watermark Overlay Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="© MY STUDIO PREVIEW"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Storefront Header Banner URL
              </label>
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Mandatory India KYC Compliance */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Building2 className="h-3.5 w-3.5" />
              <span>2. Mandatory India KYC Details (Required for Payouts)</span>
            </div>
            <span className="text-[10px] text-zinc-500">Reserve Bank of India & Income Tax Compliant</span>
          </div>

          <p className="text-xs text-zinc-400">
            Indian financial regulations require verified PAN and settlement bank accounts for creator payout transfers. All KYC submissions are reviewed by WildCanvas administrators.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Legal Entity / Individual Name *
              </label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Name as registered on PAN Card"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Entity Type *
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
              >
                <option value="INDIVIDUAL">Individual / Freelancer</option>
                <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                <option value="PARTNERSHIP">Partnership Firm</option>
                <option value="PRIVATE_LIMITED">Private Limited Company</option>
                <option value="LLP">Limited Liability Partnership (LLP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Permanent Account Number (PAN) *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-mono uppercase text-white focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                10-character alphanumeric PAN issued by the Income Tax Department.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                GSTIN (GST Identification Number)
              </label>
              <input
                type="text"
                maxLength={15}
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="29ABCDE1234F1Z5 (Optional if exempt)"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-mono uppercase text-white focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Optional for creators with annual turnover below ₹20 Lakhs.
              </span>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-4">
            <h4 className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
              <CreditCard className="h-3.5 w-3.5 text-amber-400" />
              <span>Direct Bank Settlement Details (Razorpay Payouts)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Must match Legal Name on PAN"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 50200012345678"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  IFSC Code (11 Characters) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0000240"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-mono uppercase text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* KYC Document Upload */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-3">
            <label className="text-xs font-bold text-zinc-300 block">
              Official Identity & Tax Proof Document (PAN / Aadhaar / Incorporation Certificate) *
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="inline-flex items-center space-x-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors shrink-0">
                <FileText className="h-4 w-4 text-amber-400" />
                <span>Upload Document Proof</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,application/pdf"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setKycDocUrl, setKycDocName)}
                />
              </label>

              {kycDocUrl && (
                <div className="flex items-center space-x-2 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">Document Attached: {kycDocName || "KYC Proof on file"}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-500">
              Clear scanned copy of PAN Card, Aadhaar Card, or Business Registration Certificate.
            </p>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <Info className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Updates to Brand Name, Logo, Avatar & KYC are sent directly to Master Admin for review.</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-8 py-3 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save & Submit for Approval</span>
          </button>
        </div>
      </form>

      {/* Storage Upgrade Modal */}
      <StorageUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlanId={storagePlan}
        storageUsedBytes={storageUsedBytes}
        onPlanUpgraded={(plan) => {
          setStoragePlan(plan.id);
          setStorageLimitBytes(plan.limitBytes);
        }}
      />
    </div>
  );
}
