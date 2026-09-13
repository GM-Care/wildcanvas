"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newPassword || newPassword.trim().length < 4) {
      setErrorMsg("Your new password or PIN must be at least 4 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Password / PIN updated successfully! Redirecting to sign in...");
        setTimeout(() => {
          router.push("/login");
        }, 1800);
      } else {
        setErrorMsg(data.error || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4 text-center">
        <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Invalid or Incomplete Link</h2>
        <p className="text-xs text-zinc-400">
          This password reset link appears incomplete. Please request a new verification PIN from the forgot password page.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-300 transition-colors"
        >
          Request New Code &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-5 backdrop-blur-md">
      <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Authorized verification token detected for: <strong>{email}</strong></span>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
            New Password or 6-Digit PIN
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new PIN or password"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
            Confirm New Password or PIN
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new PIN or password"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-3 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Save Credentials &amp; Sign In</span>
              <CheckCircle2 className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center border-t border-zinc-800/80">
        <Link
          href="/login"
          className="inline-flex items-center space-x-1 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Create New Password / PIN</h1>
        <p className="text-xs text-zinc-400">
          Choose a secure password or 6-digit PIN to access your account.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-xs">Validating security token...</span>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
