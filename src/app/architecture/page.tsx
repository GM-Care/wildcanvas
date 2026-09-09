import React from "react";
import Link from "next/link";
import {
  Cloud,
  Shield,
  Lock,
  Zap,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowRight,
  Server,
  Key,
} from "lucide-react";
import { isR2Configured } from "@/lib/r2";

export default function ArchitecturePage() {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "wildcanvas-storage";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
          <Cloud className="h-3.5 w-3.5" />
          <span>Storage Engine Specification</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Cloudflare R2 Dual-Tier Storage Architecture
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
          Digital photography platforms handle massive master files: 45MP uncompressed RAW images, 16-bit TIFFs, and ultra-high-bitrate JPEGs (30MB – 120MB per photo). Traditional S3 storage charges punishing egress fees of \$0.09/GB, turning successful photo sales into margin erosion. WildCanvas eliminates bandwidth fees with Cloudflare R2.
        </p>
      </div>

      {/* Live Connection Status */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isR2Configured ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
            <Cloud className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">Cloudflare R2 Engine Status:</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isR2Configured ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
                {isR2Configured ? "Live Cloudflare R2" : "Zero-Config Local Simulation"}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5 font-mono">
              Target Bucket: {bucketName} • Region: auto (Global Anycast)
            </div>
          </div>
        </div>

        <Link
          href="/marketplace"
          className="flex items-center justify-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-xs font-bold text-zinc-950 transition-colors shrink-0"
        >
          <span>Test In Marketplace</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Dual-Tier Diagram Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier 1: Public WebP CDN Previews */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <Zap className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Tier 1: Global Edge Preview Cache</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Publicly visible, highly optimized WebP images delivered via Cloudflare’s 330+ global edge locations.
          </p>
          <ul className="space-y-2 text-xs text-zinc-300">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <span>Dynamic watermark overlay prevents uncredited commercial reproduction</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <span>Edge caching with automatic Brotli/Gzip and AVIF compression</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <span>Sub-20ms TTFB worldwide for instant masonry gallery rendering</span>
            </li>
          </ul>
        </div>

        {/* Tier 2: Private Vault High-Res Originals */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div className="flex items-center space-x-2.5 text-emerald-400">
            <Lock className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Tier 2: Private Encrypted Master Vault</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Original uncompressed RAW (.CR3, .NEF, .ARW, .3FR), TIFF, and 100% quality master files are strictly private.
          </p>
          <ul className="space-y-2 text-xs text-zinc-300">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>No public URLs. Accessible exclusively via time-expiring presigned S3 URLs</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>Download Grants are verified against authorized order items</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>Strict download rate-limiting (e.g. 5 downloads per license token)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Economics Comparison Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <span>Egress Cost Economics: Cloudflare R2 vs Traditional Cloud</span>
        </h3>
        <p className="text-xs text-zinc-400">
          Hypothetical scenario: 1,000 photo sales/month with 50MB master files (50,000 GB transferred).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-1 text-center">
            <div className="text-xs text-zinc-400">AWS S3 Standard</div>
            <div className="text-2xl font-extrabold text-red-400">$4,500 / mo</div>
            <div className="text-[11px] text-zinc-500">at $0.09/GB egress</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-1 text-center">
            <div className="text-xs text-zinc-400">Google Cloud Storage</div>
            <div className="text-2xl font-extrabold text-red-400">$4,000 / mo</div>
            <div className="text-[11px] text-zinc-500">at $0.08/GB egress</div>
          </div>

          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-1 text-center shadow-lg shadow-amber-500/5">
            <div className="text-xs font-bold text-amber-300">Cloudflare R2 (WildCanvas)</div>
            <div className="text-2xl font-extrabold text-emerald-400">$0.00 Egress</div>
            <div className="text-[11px] text-amber-300/80">Only ~$0.75 for at-rest storage</div>
          </div>
        </div>
      </div>

      {/* Direct-to-R2 Upload Architecture */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Server className="h-4 w-4 text-amber-400" />
          <span>Client-to-R2 Direct Presigned Upload Pipeline</span>
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          When a creator uploads a 60MB file in the studio, it does NOT pass through the Next.js API server (which would exceed payload body limits and tie up server threads). Instead:
        </p>

        <div className="rounded-xl bg-zinc-950 p-4 font-mono text-xs text-zinc-300 space-y-2 border border-zinc-800">
          <div className="text-amber-400">1. Creator Browser: Requests presigned upload token from /api/upload/presign</div>
          <div className="text-zinc-400">2. WildCanvas Server: Uses @aws-sdk/s3-request-presigner to sign PutObjectCommand</div>
          <div className="text-emerald-400">3. Creator Browser: Uploads raw binary directly to Cloudflare R2 bucket endpoint</div>
          <div className="text-sky-400">4. Background Hook: Parses EXIF telemetry and registers photo in PostgreSQL/SQLite</div>
        </div>
      </div>
    </div>
  );
}
