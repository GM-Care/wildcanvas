"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Camera, Shield, User, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMsg("");

    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      router.push("/");
    } else {
      setErrorMsg("Invalid credentials. Please verify your email and password.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20">
          <Camera className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          Sign In to WildCanvas
        </h1>
        <p className="text-xs text-zinc-400">
          Access your creator studio, admin console, or buyer download vault.
        </p>
      </div>

      {/* 1-Click Quick Demo Login Switcher */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 pb-2 border-b border-zinc-800">
          <span className="flex items-center space-x-1.5 text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>1-Click Demo Persona Login</span>
          </span>
          <span className="text-[10px] text-zinc-500">No typing needed</span>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => quickLogin("admin")}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-rose-500/50 hover:bg-rose-500/5 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Super Admin</div>
                <div className="text-[10px] text-zinc-400">Support@gm-care.in • PIN: 123456</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
              Platform Admin
            </span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin("tenant")}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-amber-500/50 hover:bg-amber-500/5 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Camera className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Apex Safari Studios</div>
                <div className="text-[10px] text-zinc-400">creator@wildcanvas.com</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              Tenant Creator
            </span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin("buyer")}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-sky-500/50 hover:bg-sky-500/5 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Art Buyer / Collector</div>
                <div className="text-[10px] text-zinc-400">buyer@example.com</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
              Customer Vault
            </span>
          </button>
        </div>
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Or Sign In with Credentials
        </h3>

        {errorMsg && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Support@gm-care.in"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">
              Password / PIN
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Forgot Password / PIN?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password or 6-digit PIN (e.g. 123456)"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
          <div className="text-[10px] text-zinc-500 mt-1.5 flex flex-wrap items-center gap-1.5">
            <span>Admin PIN:</span>
            <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded">123456</span>
            <span className="text-zinc-600">•</span>
            <span>Demo accounts password:</span>
            <span className="font-mono text-zinc-400">password123</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-3 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
