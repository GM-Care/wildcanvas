"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: Email Request; Step 2: OTP & New Password/PIN
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setPreviewOtp(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep(2);
        setSuccessMsg(data.message || "A 6-digit verification code has been dispatched to your email.");
        if (data.previewOtp) {
          setPreviewOtp(data.previewOtp);
        }
      } else {
        setErrorMsg(data.error || "Failed to send verification code.");
      }
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & Set New Password/PIN
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otp || otp.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification PIN.");
      return;
    }

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
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Password / PIN reset successfully! Redirecting to sign in...");
        setTimeout(() => {
          router.push("/login");
        }, 1800);
      } else {
        setErrorMsg(data.error || "Failed to reset password.");
      }
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          {step === 1 ? "Reset Password / PIN" : "Enter Verification PIN"}
        </h1>
        <p className="text-xs text-zinc-400">
          {step === 1
            ? "Enter your account email and we'll dispatch a 6-digit verification code via Gmail."
            : `Enter the 6-digit code sent to ${email} and choose your new credentials.`}
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-5 backdrop-blur-md">
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

        {/* Simulator OTP Notification (if in demo mode) */}
        {previewOtp && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Simulation Mode Code:</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Testing verification PIN:</span>
              <span className="font-mono text-base font-extrabold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded tracking-widest">
                {previewOtp}
              </span>
            </div>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Support@gm-care.in"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Works for Super Admin (<span className="text-amber-400">Support@gm-care.in</span>) or any registered creator.
              </p>
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
                  <span>Send Verification Code</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Verification Code & Password Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                6-Digit Verification PIN
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-[8px] font-mono text-lg font-bold rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-amber-400 placeholder-zinc-700 focus:border-amber-400 focus:outline-none"
              />
            </div>

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
                  <span>Save New Password &amp; Sign In</span>
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                &larr; Use different email
              </button>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="text-amber-400 hover:text-amber-300 transition-colors flex items-center space-x-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Resend Code</span>
              </button>
            </div>
          </form>
        )}

        {/* Back to Login Link */}
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
    </div>
  );
}
