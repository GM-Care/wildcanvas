"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Sliders, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function AdminTenantsManagementPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

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
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, ...updates }),
      });
      if (res.ok) {
        setStatusMsg("Tenant updated successfully!");
        fetchTenants();
      }
    } catch {
      setStatusMsg("Failed to update tenant.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      <Link
        href="/admin"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Admin Console</span>
      </Link>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-rose-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Tenant Governance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Manage Tenant Accounts & Take Rates
        </h1>
        <p className="text-xs text-zinc-400">
          Control platform commission percentages, suspend or activate storefronts, and audit photographer accounts.
        </p>
      </div>

      {statusMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-24 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading tenants...</span>
        </div>
      ) : (
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
                      className="h-12 w-12 rounded-2xl overflow-hidden bg-zinc-800 border-2 shrink-0"
                      style={{ borderColor: t.brandColor }}
                    >
                      {t.logoUrl ? (
                        <img src={t.logoUrl} alt={t.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-white">
                          {t.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight">{t.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{t.owner.name}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                  {t.bio || "No bio provided."}
                </p>

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
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}
                    >
                      <option value="ACTIVE" className="bg-zinc-900 text-white">ACTIVE</option>
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
                      <option value="0.10">10% Platform Fee</option>
                      <option value="0.12">12% Platform Fee</option>
                      <option value="0.15">15% Standard Fee</option>
                      <option value="0.20">20% Premium Fee</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span>Published Works:</span>
                    <span className="font-semibold text-white">{t._count.photos}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <Link
                  href={`/s/${t.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  View Public Storefront →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
