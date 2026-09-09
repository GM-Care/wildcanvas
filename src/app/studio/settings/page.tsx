"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Shield, Palette, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

export default function StudioSettingsPage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [brandColor, setBrandColor] = useState("#f59e0b");
  const [watermarkText, setWatermarkText] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetch("/api/studio/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.tenant) {
          setName(data.tenant.name || "");
          setBio(data.tenant.bio || "");
          setBrandColor(data.tenant.brandColor || "#f59e0b");
          setWatermarkText(data.tenant.watermarkText || "");
          setPayoutEmail(data.tenant.payoutEmail || "");
          setBannerUrl(data.tenant.bannerUrl || "");
          setLogoUrl(data.tenant.logoUrl || "");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg("");

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
        }),
      });

      if (res.ok) {
        setStatusMsg("Studio settings saved successfully!");
      } else {
        setStatusMsg("Failed to save settings.");
      }
    } catch {
      setStatusMsg("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24 text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading studio settings...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
      <Link
        href="/studio"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Studio Dashboard</span>
      </Link>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-amber-400">
          <Palette className="h-3.5 w-3.5" />
          <span>Tenant Customization</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Storefront & Branding Settings
        </h1>
        <p className="text-xs text-zinc-400">
          Customize your public storefront presentation, digital preview watermark text, and payout credentials.
        </p>
      </div>

      {statusMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Storefront Details */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Brand Identity
          </h3>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Studio Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Photographer Bio & Vision
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Accent Brand Color (Hex)
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

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Digital Watermark Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="© MY STUDIO PREVIEW"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Media Imagery & Payout */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Imagery & Payouts
          </h3>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Storefront Header Banner Image URL
            </label>
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Studio Avatar / Logo URL
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Payout Email (PayPal / Direct ACH)
            </label>
            <input
              type="email"
              value={payoutEmail}
              onChange={(e) => setPayoutEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-6 py-3 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Studio Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
