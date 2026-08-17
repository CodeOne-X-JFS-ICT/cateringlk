"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrder, productCatalog, Product } from "@/context/OrderContext";

export default function ProductsPage() {
  const router = useRouter();
  const {
    orderType,
    verifiedLocation,
    cart,
    addToCart,
    updateQty,
    cartTotalCount,
    cartSubtotal,
    toggleCartDrawer,
  } = useOrder();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProducts = productCatalog.filter((product) => {
    const matchesCategory =
      activeCategory === "all" || product.category === activeCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen py-10 transition-colors duration-300 font-sans bg-white dark:bg-[#0f0d0c] text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Order Mode Status Banner */}
        <div className="p-4 rounded-3xl bg-[#E36727]/10 border border-[#E36727]/30 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#E36727] text-white flex items-center justify-center text-lg shadow-md shrink-0">
              <i
                className={`fa-solid ${
                  orderType === "delivery" ? "fa-motorcycle" : "fa-bag-shopping"
                }`}
              ></i>
            </span>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#E36727] tracking-wider">
                Active Order Mode
              </div>
              <div className="font-serif font-bold text-base text-slate-900 dark:text-white">
                {orderType === "delivery"
                  ? `🛵 Express 6km Delivery Order (${verifiedLocation})`
                  : "🛍️ Takeaway Pick-Up Order (Handapangoda Counter)"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/restaurant")}
              className="px-4 py-2 bg-slate-200 dark:bg-[#26201d] hover:bg-slate-300 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Change Mode
            </button>
          </div>
        </div>

        {/* Page Headline & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
              Explore Our Kitchen
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Signature Restaurant Menu Ranges
            </h1>
          </div>

          {/* Category Search Bar */}
          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Fried Rice, Kottu, Pizza..."
                className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
            </div>
          </div>
        </div>

        {/* 5 Meal Category Ranges Filter Tabs */}
        <div className="flex overflow-x-auto gap-2.5 pb-2 no-scrollbar">
          {[
            { key: "all", label: "All Items" },
            { key: "fried-rice", label: "🍚 Fried Rice Range" },
            { key: "kottu", label: "🥘 Kottu Range" },
            { key: "noodles", label: "🥢 Noodles Range" },
            { key: "pizza", label: "🍕 Pizza Range" },
            { key: "special", label: "🔥 Special Range" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? "bg-[#E36727] text-white shadow-md"
                  : "bg-slate-100 dark:bg-[#26201d] text-slate-700 dark:text-slate-300 hover:text-[#E36727]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 text-xs">
              No meal items found matching your search filter.
            </div>
          ) : (
            filteredProducts.map((p: Product) => {
              const cartItem = cart.find((item) => item.id === p.id);
              const qty = cartItem ? cartItem.qty : 0;

              return (
                <div
                  key={p.id}
                  className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden space-y-3 shadow-md hover:border-[#E36727] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-amber-400">
                        {p.portion}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex justify-between items-center border-t border-slate-200 dark:border-white/5">
                    <div className="font-serif font-extrabold text-base text-[#E36727]">
                      LKR {p.price.toLocaleString()}
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center gap-2 bg-[#E36727]/10 border border-[#E36727]/30 px-2 py-1 rounded-xl text-xs">
                        <button
                          onClick={() => updateQty(p.id, -1)}
                          className="w-6 h-6 rounded-lg bg-[#E36727] text-white font-bold cursor-pointer hover:bg-amber-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="font-bold text-[#E36727] px-1">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQty(p.id, 1)}
                          className="w-6 h-6 rounded-lg bg-[#E36727] text-white font-bold cursor-pointer hover:bg-amber-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        className="px-4 py-2 bg-[#E36727] hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer transform hover:scale-105 active:scale-95"
                      >
                        + Add to Basket
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* STICKY FLOATING CART BAR */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 z-30 animate-in slide-in-from-bottom-5 duration-300">
          <button
            onClick={toggleCartDrawer}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E36727] to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-amber-400/30"
          >
            <i className="fa-solid fa-basket-shopping text-base"></i>
            <span>Cart ({cartTotalCount} items)</span>
            <span className="bg-black/30 px-2.5 py-1 rounded-xl font-mono">
              LKR {cartSubtotal.toLocaleString()}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
