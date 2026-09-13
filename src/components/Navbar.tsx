"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  Camera,
  ShoppingBag,
  User,
  Shield,
  LayoutDashboard,
  Layers,
  ChevronDown,
  LogOut,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, logout, quickLogin } = useAuth();
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="group flex items-center space-x-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/20 transition-transform group-hover:scale-105">
              <Camera className="h-5 w-5 text-zinc-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Wild<span className="text-amber-400">Canvas</span>
              </span>
              <span className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase -mt-1">
                Multi-Tenant Photos
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/" || pathname.startsWith("/marketplace")
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              Marketplace
            </Link>
            <Link
              href="/studios"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/studios")
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              Creator Studios
            </Link>
          </nav>
        </div>

        {/* Right Section: Persona Switcher, Cart, Portals, Profile */}
        <div className="flex items-center space-x-3">
          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsDemoMenuOpen(!isDemoMenuOpen);
                setIsUserMenuOpen(false);
              }}
              className="flex items-center space-x-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
              title="Switch demo persona between Super Admin, Creator/Tenant, and Buyer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Demo Switcher:</span>
              <span className="capitalize font-bold text-white">
                {user ? user.role.replace("_ADMIN", "") : "Guest"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {isDemoMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-zinc-400 border-b border-zinc-800 mb-1">
                  1-Click Role Emulation
                </div>
                <button
                  onClick={() => {
                    quickLogin("admin");
                    setIsDemoMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-left text-xs rounded-lg hover:bg-zinc-800 text-zinc-200 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-rose-400" />
                    <div>
                      <div className="font-medium text-white">Super Admin</div>
                      <div className="text-[10px] text-zinc-400">Support@gm-care.in • PIN: 123456</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Platform</span>
                </button>
                <button
                  onClick={() => {
                    quickLogin("tenant");
                    setIsDemoMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-left text-xs rounded-lg hover:bg-zinc-800 text-zinc-200 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Camera className="h-4 w-4 text-amber-400" />
                    <div>
                      <div className="font-medium text-white">Apex Safari Studios</div>
                      <div className="text-[10px] text-zinc-400">creator@wildcanvas.com</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Tenant</span>
                </button>
                <button
                  onClick={() => {
                    quickLogin("buyer");
                    setIsDemoMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-left text-xs rounded-lg hover:bg-zinc-800 text-zinc-200 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-sky-400" />
                    <div>
                      <div className="font-medium text-white">Art Buyer</div>
                      <div className="text-[10px] text-zinc-400">buyer@example.com</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">Customer</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Portal Shortcuts */}
          {user?.role === "SUPER_ADMIN" && (
            <Link
              href="/admin"
              className="hidden lg:flex items-center space-x-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}

          {user?.role === "TENANT_ADMIN" && (
            <Link
              href="/studio"
              className="hidden lg:flex items-center space-x-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Creator Studio</span>
            </Link>
          )}

          {user && (
            <Link
              href="/account/downloads"
              className="hidden lg:flex items-center space-x-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors"
            >
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <span>My Vault</span>
            </Link>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:text-white transition-colors"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-zinc-950 shadow-md">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account / Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsDemoMenuOpen(false);
                }}
                className="flex items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:text-white transition-colors"
              >
                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 uppercase">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {user.role === "SUPER_ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg"
                      >
                        <Shield className="h-4 w-4 text-rose-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {user.role === "TENANT_ADMIN" && (
                      <>
                        <Link
                          href="/studio"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg"
                        >
                          <LayoutDashboard className="h-4 w-4 text-amber-400" />
                          <span>Creator Studio</span>
                        </Link>
                        {user.tenantSlug && (
                          <Link
                            href={`/s/${user.tenantSlug}`}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg"
                          >
                            <ExternalLink className="h-4 w-4 text-emerald-400" />
                            <span>View Public Storefront</span>
                          </Link>
                        )}
                      </>
                    )}

                    <Link
                      href="/account/downloads"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg"
                    >
                      <Layers className="h-4 w-4 text-sky-400" />
                      <span>Purchased Photos Vault</span>
                    </Link>
                  </div>

                  <div className="border-t border-zinc-800 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
