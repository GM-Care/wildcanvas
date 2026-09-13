"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Mail,
  Lock,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  HelpCircle,
  Eye,
  EyeOff,
  Server,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function AdminSmtpSettingsPage() {
  const [host, setHost] = useState("smtp.gmail.com");
  const [port, setPort] = useState(465);
  const [user, setUser] = useState("Support@gm-care.in");
  const [pass, setPass] = useState("");
  const [passMasked, setPassMasked] = useState("");
  const [fromName, setFromName] = useState("WildCanvas Security");
  const [isConfigured, setIsConfigured] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/smtp");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setHost(data.config.host || "smtp.gmail.com");
          setPort(data.config.port || 465);
          setUser(data.config.user || "Support@gm-care.in");
          setFromName(data.config.fromName || "WildCanvas Security");
          setPassMasked(data.config.passMasked || "");
          setIsConfigured(data.config.isConfigured || false);
          if (data.config.passMasked) {
            setPass(data.config.passMasked);
          }
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/admin/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host,
          port: Number(port),
          user,
          pass,
          fromName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: "success", text: "Gmail SMTP configuration saved successfully." });
        await fetchSettings();
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to save SMTP settings." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error occurred while saving." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/admin/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          user,
          testRecipient: user,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: "success", text: data.message });
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to send test email." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error during test email." });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24 text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading Gmail SMTP settings...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {/* Back Link */}
      <Link
        href="/admin"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Super Admin Console</span>
      </Link>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Mail className="h-3.5 w-3.5" />
            <span>Outbound Mail Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Gmail SMTP &amp; App Password Configuration
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure secure Google SMTP dispatch for Forgot Password OTP verification, merchant notifications, and platform alerts.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center space-x-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-xs self-start sm:self-auto">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isConfigured ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-amber-400 animate-pulse"
            }`}
          />
          <div>
            <div className="font-bold text-white">
              {isConfigured ? "Gmail SMTP Connected" : "Simulation / Safe Mode"}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              {isConfigured ? "Live Dispatch Active" : "App Password Needed"}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1 border-b border-zinc-800 pb-2 text-xs font-semibold">
        <Link
          href="/admin"
          className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors"
        >
          Overview
        </Link>
        <Link
          href="/admin/tenants"
          className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors"
        >
          Tenants &amp; Studios
        </Link>
        <Link
          href="/admin/payments"
          className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors"
        >
          Razorpay Gateway
        </Link>
        <Link
          href="/admin/smtp"
          className="px-4 py-2 rounded-xl bg-zinc-800 text-white transition-colors flex items-center space-x-1.5"
        >
          <span>Gmail SMTP</span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        </Link>
      </div>

      {/* Alerts */}
      {statusMsg && (
        <div
          className={`rounded-2xl border p-4 text-xs flex items-center space-x-2 ${
            statusMsg.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Gmail Credentials</h2>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">smtp.gmail.com:465 (SSL)</span>
            </div>

            {/* Gmail User */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Google / Gmail Account Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Support@gm-care.in"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                The primary sender email address used for outbound verification PINs and system messages.
              </p>
            </div>

            {/* Google App Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Google App Password (16 Characters)
                </label>
                <span className="text-[10px] text-amber-400">Requires 2-Step Verification</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder={passMasked || "e.g. abcd efgh ijkl mnop"}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 pr-10 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Generated from your Google Account settings. Spaces are ignored automatically.
              </p>
            </div>

            {/* Sender Display Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Sender Display Name
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="WildCanvas Security"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Advanced Host & Port */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  SSL / SMTPS Port
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-800">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-6 py-2.5 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save SMTP Settings</span>
              </button>

              <button
                type="button"
                onClick={handleTestEmail}
                disabled={isTesting}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-emerald-400" />}
                <span>Send Test Email to {user}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Setup Guide (1 Col) */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-amber-400">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                How to Generate an App Password
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Google no longer permits standard passwords for third-party SMTP. Follow these 5 quick steps:
            </p>

            <ol className="text-xs text-zinc-300 space-y-3 pl-4 list-decimal marker:text-amber-400">
              <li>
                Open your Google Account at{" "}
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline inline-flex items-center"
                >
                  myaccount.google.com <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </li>
              <li>
                Navigate to <strong>Security</strong> &rarr; ensure <strong>2-Step Verification</strong> is ON.
              </li>
              <li>
                Under 2-Step Verification, scroll down and click <strong>App passwords</strong>.
              </li>
              <li>
                Enter an app name like <strong className="text-white">WildCanvas</strong> and click <strong>Create</strong>.
              </li>
              <li>
                Copy the generated 16-character code (e.g. <span className="font-mono text-amber-300">abcd efgh ijkl mnop</span>) and paste it into the field on the left.
              </li>
            </ol>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-300/90 leading-relaxed">
              <strong>Edge Runtime Ready:</strong> WildCanvas dispatches emails over direct TLS sockets compatible with Cloudflare Workers without requiring Node.js servers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
