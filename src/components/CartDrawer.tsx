"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { X, Trash2, ShieldCheck, ArrowRight, Sparkles, ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const router = useRouter();
  const { items, removeItem, clearCart, totalCents, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "");
  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const email = user?.email || buyerEmail;
    const name = user?.name || buyerName || "Collector";

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address to receive your download tokens.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          buyerEmail: email,
          buyerName: name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Order completed!
      clearCart();
      setIsCartOpen(false);
      router.push(`/checkout/success?orderNumber=${data.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col text-zinc-100">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Cart & Licensing</h2>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {items.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="h-16 w-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center text-zinc-600 mb-4">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-base font-semibold text-zinc-300">Your cart is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mt-1 mb-6">
                  Browse our high-resolution curated photography and select a license to acquire digital asset rights.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
                >
                  Explore Marketplace
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.photoId}-${item.licenseTierId}`}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 flex items-center space-x-3.5"
                >
                  <img
                    src={item.previewUrl}
                    alt={item.photoTitle}
                    className="h-16 w-20 rounded-lg object-cover bg-zinc-900 shrink-0 select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {item.photoTitle}
                    </h4>
                    <p className="text-xs text-zinc-400">{item.tenantName}</p>
                    <span className="inline-block text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded mt-1">
                      {item.licenseName}
                    </span>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-sm font-bold text-white">
                      ${(item.priceCents / 100).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.photoId, item.licenseTierId)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                      title="Remove from cart"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Section */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/80 space-y-4">
              {/* Buyer Information */}
              {!user && (
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Digital Delivery Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              )}

              {errorMsg && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Price Summary */}
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${(totalCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform License Rights & Cloudflare R2 Delivery</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total Amount</span>
                  <span className="text-amber-400">${(totalCents / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-3 text-sm font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authorizing Licensing Grant...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Complete Digital Order • ${(totalCents / 100).toFixed(2)}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Instant high-res access tokens generated upon payment.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
