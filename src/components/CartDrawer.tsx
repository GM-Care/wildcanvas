"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Trash2,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Loader2,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/currency";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartDrawer() {
  const router = useRouter();
  const { items, removeItem, clearCart, totalCents, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "");
  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Simulation modal state
  const [showSimModal, setShowSimModal] = useState(false);
  const [simOrderData, setSimOrderData] = useState<any>(null);
  const [isSimVerifying, setIsSimVerifying] = useState(false);

  // Load Razorpay official checkout.js dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const email = user?.email || buyerEmail;
    const name = user?.name || buyerName || "Art Collector";

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address to receive your digital licenses and tokens.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      // 1. Create Razorpay order
      const createRes = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          buyerEmail: email,
          buyerName: name,
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initiate Razorpay order");
      }

      // 2. Check if live Razorpay keys are configured and checkout.js is available
      if (!orderData.isSimulation && window.Razorpay && orderData.keyId) {
        // Open official Razorpay modal
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: "INR",
          name: "WildCanvas India",
          description: `Digital Photography Rights (${items.length} works)`,
          image: "/icons/wildcanvas-logo.png",
          order_id: orderData.razorpayOrderId,
          prefill: {
            name,
            email,
          },
          theme: {
            color: "#f59e0b",
          },
          handler: async function (response: any) {
            await finalizePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderNumber: orderData.orderNumber,
              email,
              name,
            });
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.on("payment.failed", function (resp: any) {
          setErrorMsg(resp.error?.description || "Payment was rejected or cancelled.");
          setIsProcessing(false);
        });
        rzpInstance.open();
      } else {
        // Open WildCanvas Razorpay Test Sandbox Simulator
        setSimOrderData({
          orderNumber: orderData.orderNumber,
          razorpayOrderId: orderData.razorpayOrderId,
          amount: orderData.amount,
          email,
          name,
        });
        setShowSimModal(true);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Checkout error encountered.");
      setIsProcessing(false);
    }
  };

  // Finalize order by verifying signature at edge
  const finalizePayment = async (params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderNumber: string;
    email: string;
    name: string;
  }) => {
    setIsProcessing(true);
    setIsSimVerifying(true);
    try {
      const verifyRes = await fetch("/api/checkout/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: params.razorpay_order_id,
          razorpay_payment_id: params.razorpay_payment_id,
          razorpay_signature: params.razorpay_signature,
          orderNumber: params.orderNumber,
          items,
          buyerEmail: params.email,
          buyerName: params.name,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Payment verification failed.");
      }

      // Order successfully authorized & verified!
      clearCart();
      setShowSimModal(false);
      setIsCartOpen(false);
      router.push(`/checkout/success?orderNumber=${verifyData.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to finalize digital licensing grants.");
    } finally {
      setIsProcessing(false);
      setIsSimVerifying(false);
    }
  };

  const handleSimulatePayment = (instrument: "UPI" | "CARD" | "NETBANKING") => {
    if (!simOrderData) return;
    const simPaymentId = `pay_sim_${instrument.toLowerCase()}_${Math.random().toString(36).substring(2, 10)}`;
    finalizePayment({
      razorpay_order_id: simOrderData.razorpayOrderId,
      razorpay_payment_id: simPaymentId,
      razorpay_signature: "simulated_signature_ok",
      orderNumber: simOrderData.orderNumber,
      email: simOrderData.email,
      name: simOrderData.name,
    });
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
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300 font-mono">
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
                  Browse our high-resolution curated photography and acquire digital licenses in Indian Rupees (₹).
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
                >
                  Explore Indian Marketplace
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.photoId}-${item.licenseTierId}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3.5 flex items-center space-x-3.5"
                >
                  <img
                    src={item.previewUrl}
                    alt={item.photoTitle}
                    className="h-16 w-20 rounded-xl object-cover bg-zinc-900 shrink-0 select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {item.photoTitle}
                    </h4>
                    <p className="text-xs text-zinc-400">{item.tenantName}</p>
                    <span className="inline-block text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md mt-1 border border-amber-500/20">
                      {item.licenseName}
                    </span>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-sm font-bold text-white">
                      {formatINR(item.priceCents)}
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
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/90 space-y-4">
              {/* Buyer Information */}
              {!user && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Delivery Email <span className="text-amber-400">*</span>
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
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Price Summary (INR) */}
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-200">{formatINR(totalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>License Rights & R2 Delivery</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total Payable</span>
                  <span className="text-amber-400">{formatINR(totalCents)}</span>
                </div>
              </div>

              {/* Razorpay Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-3.5 text-xs sm:text-sm font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Pay with Razorpay • {formatINR(totalCents)}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Secured by Razorpay • UPI, Cards & NetBanking</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Razorpay Sandbox Test Simulator Modal */}
      {showSimModal && simOrderData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    ₹
                  </div>
                  <h3 className="text-base font-bold text-white">Razorpay Sandbox Simulator</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Select an Indian payment instrument to simulate instant authorization:
                </p>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Brief */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Order Reference:</span>
                <span className="font-mono text-zinc-200">{simOrderData.orderNumber}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Customer Email:</span>
                <span className="text-zinc-200">{simOrderData.email}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Amount:</span>
                <span className="text-amber-400">{formatINR(simOrderData.amount)}</span>
              </div>
            </div>

            {/* Simulation Payment Rails */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={isSimVerifying}
                onClick={() => handleSimulatePayment("UPI")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/60 hover:border-amber-500 hover:bg-amber-500/5 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      UPI Instant Payment
                    </div>
                    <div className="text-[11px] text-zinc-500">Google Pay, PhonePe, Paytm, BHIM</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Instant
                </span>
              </button>

              <button
                type="button"
                disabled={isSimVerifying}
                onClick={() => handleSimulatePayment("CARD")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/60 hover:border-amber-500 hover:bg-amber-500/5 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      Credit / Debit Card
                    </div>
                    <div className="text-[11px] text-zinc-500">RuPay, Visa, Mastercard, Maestro</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800">
                  Zero OTP
                </span>
              </button>

              <button
                type="button"
                disabled={isSimVerifying}
                onClick={() => handleSimulatePayment("NETBANKING")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/60 hover:border-amber-500 hover:bg-amber-500/5 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      Indian NetBanking
                    </div>
                    <div className="text-[11px] text-zinc-500">HDFC, SBI, ICICI, Axis & 50+ Banks</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800">
                  Direct
                </span>
              </button>
            </div>

            {isSimVerifying && (
              <div className="flex items-center justify-center space-x-2 text-xs text-amber-400 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying WebCrypto HMAC signature & creating download grant...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
