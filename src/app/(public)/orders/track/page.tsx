"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const TAKEAWAY_STEPS = [
  { key: "PENDING", label: "Received", desc: "Order submitted to kitchen", icon: "fa-receipt" },
  { key: "CONFIRMED", label: "Confirmed", desc: "Kitchen accepted order", icon: "fa-thumbs-up" },
  { key: "PREPARING", label: "Preparing", desc: "Freshly cooking your meal", icon: "fa-fire-burner" },
  { key: "READY", label: "Ready", desc: "Packed at pick-up counter", icon: "fa-box-archive" },
  { key: "COLLECTED", label: "Collected", desc: "Order handed over to you", icon: "fa-circle-check" },
];

const DELIVERY_STEPS = [
  { key: "PENDING", label: "Received", desc: "Order submitted to kitchen", icon: "fa-receipt" },
  { key: "CONFIRMED", label: "Confirmed", desc: "Kitchen accepted order", icon: "fa-thumbs-up" },
  { key: "PREPARING", label: "Cooking", desc: "Chefs preparing your food", icon: "fa-fire-burner" },
  { key: "READY", label: "Dispatched", desc: "Sealed & ready for rider", icon: "fa-box" },
  { key: "OUT_FOR_DELIVERY", label: "On The Way", desc: "Express rider delivering", icon: "fa-motorcycle" },
  { key: "DELIVERED", label: "Delivered", desc: "Safely arrived at your door", icon: "fa-circle-check" },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [orderRef, setOrderRef] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStatus = useCallback(async (refToSearch: string) => {
    const trimmed = refToSearch.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5050/api/public/orders/${encodeURIComponent(trimmed)}/status`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Order not found. Please check your reference code.");
      }
      setOrder(json.data);
    } catch (err: any) {
      setOrder(null);
      setError(err.message || "Could not fetch order status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialRef) {
      setOrderRef(initialRef);
      fetchStatus(initialRef);
    }
  }, [initialRef, fetchStatus]);

  // Periodic polling if order is still active
  useEffect(() => {
    if (!autoRefresh || !order) return;
    if (order.status === "DELIVERED" || order.status === "COLLECTED" || order.status === "CANCELLED") {
      return;
    }

    const interval = setInterval(() => {
      fetchStatus(order.order_ref);
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh, order, fetchStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(orderRef);
  };

  const steps = order?.order_type === "DELIVERY" ? DELIVERY_STEPS : TAKEAWAY_STEPS;
  const currentStepIdx = steps.findIndex((s) => s.key === order?.status);

  return (
    <div className="w-full min-h-screen py-10 transition-colors duration-300 font-sans bg-white dark:bg-[#0f0d0c] text-slate-800 dark:text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/takeaway&delivery"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#E36727] hover:underline"
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Takeaway & Delivery
          </Link>
          {order && (
            <button
              onClick={() => fetchStatus(order.order_ref)}
              disabled={loading}
              className="text-xs font-bold text-slate-500 hover:text-[#E36727] flex items-center gap-1.5 cursor-pointer"
            >
              <i className={`fa-solid fa-rotate-right ${loading ? "animate-spin" : ""}`}></i>
              <span>Refresh Status</span>
            </button>
          )}
        </div>

        {/* Title & Tracker Search Box */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
            Real-Time Tracking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Enter your order reference number to see live progress from kitchen preparation to final delivery.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-2 max-w-md mx-auto">
            <input
              type="text"
              required
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="e.g. ORD-20261014-0001"
              className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#E36727]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
            <i className="fa-solid fa-circle-exclamation mr-1.5"></i>
            {error}
          </div>
        )}

        {/* Order Details & Stepper */}
        {order && (
          <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
            {/* Top Order Badge Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Order Reference
                </p>
                <p className="font-mono font-extrabold text-2xl text-slate-900 dark:text-white">
                  {order.order_ref}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at).toLocaleDateString("en-LK")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#E36727]/10 text-[#E36727] border border-[#E36727]/20 uppercase">
                  {order.order_type === "DELIVERY" ? "🛵 Express Delivery" : "🛍️ Takeaway Pick-up"}
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Cancelled Banner */}
            {order.status === "CANCELLED" ? (
              <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-center space-y-2">
                <i className="fa-solid fa-circle-xmark text-3xl text-red-500"></i>
                <h3 className="font-bold text-red-600 dark:text-red-400 text-base">This Order Has Been Cancelled</h3>
                <p className="text-xs text-red-500 dark:text-red-400">
                  Please contact our counter helpline at <a href="tel:+94742013332" className="underline font-bold">+94 74 201 3332</a> for inquiries or refunds.
                </p>
              </div>
            ) : (
              /* Live Progress Stepper */
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Live Preparation & Delivery Progress
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {steps.map((step, idx) => {
                    const isDone = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;
                    return (
                      <div
                        key={step.key}
                        className={`p-4 rounded-2xl border text-center transition-all ${
                          isCurrent
                            ? "bg-[#E36727]/10 border-[#E36727] ring-2 ring-[#E36727]/30 shadow-md"
                            : isDone
                            ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-50 dark:bg-[#26201d] border-slate-200 dark:border-white/5 opacity-40"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold ${
                            isCurrent
                              ? "bg-[#E36727] text-white animate-pulse"
                              : isDone
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                          }`}
                        >
                          <i className={`fa-solid ${step.icon}`}></i>
                        </div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">{step.label}</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Items & Customer Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-white/10">
              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Items Ordered
                </h4>
                <div className="space-y-2 bg-slate-50 dark:bg-[#26201d] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-white/5 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.product_name_snapshot}</p>
                        <p className="text-slate-400">Qty: {item.quantity} × Rs. {Number(item.unit_price_snapshot).toLocaleString()}</p>
                      </div>
                      <p className="font-extrabold text-[#E36727]">Rs. {Number(item.line_total).toLocaleString()}</p>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Rs. {Number(order.subtotal).toLocaleString()}</span>
                    </div>
                    {Number(order.delivery_fee) > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Delivery Fee</span>
                        <span className="font-bold text-[#E36727]">Rs. {Number(order.delivery_fee).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                      <span>Grand Total</span>
                      <span className="text-[#E36727]">Rs. {Number(order.grand_total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery / Pickup Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Fulfillment Details
                </h4>
                <div className="bg-slate-50 dark:bg-[#26201d] p-4 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">{order.customer_name} ({order.customer_phone})</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Time Slot</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{order.time_slot || "ASAP (30-40 mins)"}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{order.payment_method}</span>
                  </div>

                  {order.delivery_address && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Address</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{order.delivery_address}</span>
                    </div>
                  )}

                  {order.special_instructions && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Kitchen Instructions</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{order.special_instructions}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assistance Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs">
              <div className="flex items-center gap-3">
                <i className="fa-brands fa-whatsapp text-2xl text-emerald-500"></i>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Need updates on this order?</p>
                  <p className="text-slate-500">Our customer care team is available on WhatsApp.</p>
                </div>
              </div>
              <a
                href={`https://wa.me/94742013332?text=${encodeURIComponent(`Hi Catering by Ahas Gawwa, inquiry regarding my order ${order.order_ref}`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E36727]"></div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
