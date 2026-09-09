"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Zap,
  RefreshCw,
  Sliders,
  ExternalLink,
  Layers,
  Lock,
} from "lucide-react";

export default function AdminPaymentsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [form, setForm] = useState({
    gateway: "razorpay",
    enabled: true,
    mode: "test" as "test" | "live",
    keyId: "",
    keySecret: "",
    webhookSecret: "",
    currency: "INR",
    autoCapture: true,
  });

  const [hasStoredSecret, setHasStoredSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setForm((prev) => ({
            ...prev,
            enabled: data.config.enabled ?? true,
            mode: data.config.mode ?? "test",
            keyId: data.config.keyId ?? "",
            keySecret: data.config.keySecretMasked ?? "",
            webhookSecret: data.config.webhookSecret ?? "",
            currency: "INR",
            autoCapture: data.config.autoCapture ?? true,
          }));
          setHasStoredSecret(Boolean(data.config.hasSecret));
        }
      }
    } catch {
      setStatusMsg({ type: "error", text: "Failed to load payment settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/payments/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: "success", text: "Razorpay settings successfully saved!" });
        if (data.config) {
          setForm((prev) => ({
            ...prev,
            keySecret: data.config.keySecretMasked || prev.keySecret,
          }));
          setHasStoredSecret(Boolean(data.config.hasSecret));
        }
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Network error while saving" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/payments/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyId: form.keyId,
          keySecret: form.keySecret,
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network failure connecting to test endpoint: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Super Admin Console</span>
        </Link>

        {/* Quick Nav Tabs */}
        <div className="flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl text-xs">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            Overview
          </Link>
          <Link
            href="/admin/tenants"
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            Tenants
          </Link>
          <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
            Payment Gateway
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-rose-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Financial Infrastructure</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <span>Razorpay Payment Gateway</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                INR (₹) India
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Configure official Razorpay API keys, manage payment capture rules, and verify credentials in real time.
            </p>
          </div>

          <a
            href="https://dashboard.razorpay.com/#/access/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl"
          >
            <span>Razorpay Dashboard</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`rounded-2xl border p-4 text-xs font-semibold flex items-center space-x-2 ${
            statusMsg.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-24 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading payment gateway configurations...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-md space-y-6">
              {/* Gateway Status & Mode */}
              <div className="space-y-4 pb-6 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-white block">Gateway Status</label>
                    <p className="text-xs text-zinc-400">Enable or temporarily suspend Razorpay checkout across the platform.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.enabled ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Mode Selector */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-2">Environment Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, mode: "test" }))}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        form.mode === "test"
                          ? "border-amber-500 bg-amber-500/10 text-amber-300"
                          : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="font-bold text-xs">Test Mode (Sandbox)</div>
                      <div className="text-[11px] opacity-75 mt-0.5">rzp_test_... (Virtual INR transactions)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, mode: "live" }))}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        form.mode === "live"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                          : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="font-bold text-xs">Live Production</div>
                      <div className="text-[11px] opacity-75 mt-0.5">rzp_live_... (Real INR settlements)</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* API Credentials */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Razorpay Key ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.keyId}
                    onChange={(e) => setForm({ ...form, keyId: e.target.value })}
                    placeholder="rzp_test_1234567890abcdef"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Find this under Razorpay Dashboard → Settings → API Keys.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Razorpay Key Secret <span className="text-rose-400">*</span>
                    </label>
                    {hasStoredSecret && (
                      <span className="text-[11px] font-medium text-emerald-400 flex items-center space-x-1">
                        <Lock className="h-3 w-3" />
                        <span>Key Secret is stored securely</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={form.keySecret}
                      onChange={(e) => setForm({ ...form, keySecret: e.target.value })}
                      placeholder={hasStoredSecret ? "••••••••••••••••" : "Enter Key Secret"}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Used to generate orders and verify HMAC-SHA256 signatures at Cloudflare Edge.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Webhook Secret (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.webhookSecret}
                    onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
                    placeholder="whsec_..."
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Optional secret to verify incoming asynchronous webhook payloads.
                  </p>
                </div>
              </div>

              {/* Currency & Capture Settings */}
              <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Currency</label>
                  <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 px-4 py-2 text-xs text-amber-400 font-bold flex items-center justify-between">
                    <span>INR (₹) Indian Rupee</span>
                    <span className="text-[10px] text-zinc-500 font-normal uppercase">Platform Native</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Payment Capture</label>
                  <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 px-4 py-2 text-xs text-zinc-300 flex items-center justify-between">
                    <span>Automatic Capture (Instant)</span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Enabled</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing || (!form.keyId && !hasStoredSecret)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                      <span>Verifying with Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span>Test API Connection</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 text-xs font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Save Razorpay Configuration</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Result Display */}
              {testResult && (
                <div
                  className={`rounded-2xl border p-4 text-xs font-semibold flex items-center space-x-2 ${
                    testResult.success
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar / Diagnostics & Features */}
          <div className="space-y-6">
            {/* Status Summary Card */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <CreditCard className="h-4 w-4 text-amber-400" />
                <span>Gateway Status</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Payment Gateway:</span>
                  <span className="font-bold text-white">Razorpay India</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Active Currency:</span>
                  <span className="font-bold text-amber-400">INR (₹)</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Configured State:</span>
                  <span
                    className={`font-semibold ${
                      form.keyId && hasStoredSecret ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {form.keyId && hasStoredSecret ? "Live / Connected" : "Sandbox Simulator"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Edge WebCrypto:</span>
                  <span className="font-bold text-emerald-400">Active (HMAC-SHA256)</span>
                </div>
              </div>
            </div>

            {/* Indian Payment Rails Supported */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Supported Indian Payment Rails
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When buyers checkout on WildCanvas, Razorpay automatically presents the most popular Indian payment instruments:
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span><strong>UPI Instant</strong>: Google Pay, PhonePe, Paytm, BHIM</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span><strong>NetBanking</strong>: 50+ Indian banks (HDFC, SBI, ICICI, Axis)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span><strong>Cards</strong>: RuPay, Visa, Mastercard, Maestro</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span><strong>Wallets & PayLater</strong>: Mobikwik, Airtel Money, Simpl</span>
                </li>
              </ul>
            </div>

            {/* Smart Edge Sandbox Note */}
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 text-xs space-y-2">
              <div className="font-bold text-amber-400 flex items-center space-x-1.5">
                <Zap className="h-3.5 w-3.5" />
                <span>Zero-Blocker Sandbox Simulator</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                If Razorpay API keys are not yet entered or in development mode, the checkout drawer activates an intelligent in-app simulator. Buyers can test photo purchases, order generation, and high-res R2 download grants instantly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
