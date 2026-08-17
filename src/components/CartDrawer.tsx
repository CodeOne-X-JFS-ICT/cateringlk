"use client";

import React from "react";
import Link from "next/link";
import { useOrder } from "@/context/OrderContext";

export default function CartDrawer() {
  const {
    cart,
    updateQty,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cartTotalCount,
    cartSubtotal,
    orderType,
    verifiedLocation,
  } = useOrder();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FFFBF8] dark:bg-[#1a1614] h-full p-6 flex flex-col justify-between shadow-2xl border-l border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100">
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-basket-shopping text-[#E36727] text-lg"></i>
              <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                Your Basket
              </h3>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E36727]/10 text-[#E36727] text-[11px] font-bold border border-[#E36727]/20">
            <span>
              {orderType === "delivery"
                ? `🛵 Delivery (${verifiedLocation})`
                : "🛍️ Takeaway Pick-Up"}
            </span>
          </div>

          {/* Cart Items List */}
          <div className="py-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Your basket is currently empty.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 text-xs shadow-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      LKR {item.price.toLocaleString()} x {item.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-[#1a1614] text-slate-800 dark:text-white font-bold cursor-pointer hover:bg-[#E36727] hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="font-bold text-[#E36727]">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-[#E36727] text-white font-bold cursor-pointer hover:bg-amber-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drawer Footer Summary */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Items Count:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {cartTotalCount} items
            </span>
          </div>
          <div className="flex justify-between text-sm font-extrabold">
            <span className="text-slate-900 dark:text-white">Subtotal:</span>
            <span className="gold-gradient-text text-lg">
              LKR {cartSubtotal.toLocaleString()}
            </span>
          </div>

          <Link
            href="/checkout"
            onClick={() => setIsCartDrawerOpen(false)}
            className={`w-full py-3.5 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer text-center block ${
              cart.length === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Proceed to Checkout <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
