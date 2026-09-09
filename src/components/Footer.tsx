import React from "react";
import Link from "next/link";
import { Camera, Cloud, ShieldCheck, Zap, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 font-bold">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white">
                Wild<span className="text-amber-400">Canvas</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              The high-performance multi-tenant digital photography marketplace powered by Cloudflare R2 zero-egress object storage and cryptographic digital asset rights protection.
            </p>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-[11px] text-amber-400 font-medium">
              <Cloud className="h-3 w-3" />
              <span>Cloudflare R2 Native Engine</span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Explore All Photos
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Wildlife" className="hover:text-white transition-colors">
                  Wildlife & Safari
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Architecture" className="hover:text-white transition-colors">
                  Architecture & Minimalist
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Landscape" className="hover:text-white transition-colors">
                  Landscape & Aerials
                </Link>
              </li>
              <li>
                <Link href="/studios" className="hover:text-white transition-colors">
                  Photographer Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Creators & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Platform & Creators
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/studio" className="hover:text-white transition-colors">
                  Creator Studio Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Super Admin Console
                </Link>
              </li>
              <li>
                <Link href="/architecture" className="hover:text-white transition-colors">
                  R2 Storage Architecture
                </Link>
              </li>
              <li>
                <Link href="/account/downloads" className="hover:text-white transition-colors">
                  Buyer Asset Vault
                </Link>
              </li>
              <li>
                <Link href="/licensing" className="hover:text-white transition-colors">
                  License Tiers Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Digital Rights & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Security & Guarantees
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start space-x-2">
                <Lock className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>HMAC time-expiring signed original download tokens</span>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldCheck className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <span>Dynamic watermarking & anti-theft overlay shields</span>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
                <span>Zero-egress multi-region edge delivery via Cloudflare CDN</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} WildCanvas Multi-Tenant Platform. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span>Enterprise Multi-Tenant SaaS</span>
            <span>Cloudflare R2 Integration</span>
            <span>Next.js 15 Full-Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
