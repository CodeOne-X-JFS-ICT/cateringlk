"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOrder, Product, productCatalog } from "@/context/OrderContext";

interface DishGroup {
  key: string;
  name: string;
  category: string;
  desc: string;
  img: string;
  portions: Product[];
}

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
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [selectedPortions, setSelectedPortions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/public/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const json = await response.json();

        if (json.success && json.data) {
          // Flatten categories into an array of products
          const mappedProducts = json.data.flatMap((cat: any) =>
            cat.products.map((p: any) => ({
              id: p.id.toString(),
              category: cat.slug,
              name: p.name,
              desc: p.description,
              price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
              portion: p.portion_label,
              img: p.image_url,
            }))
          );
          setFetchedProducts(mappedProducts);
        } else {
          // Fallback to local catalog
          setFetchedProducts(productCatalog);
        }
      } catch (err: any) {
        // Fallback to local catalog if backend is momentarily unreachable
        setFetchedProducts(productCatalog);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Group individual portion products into dish cards
  const dishGroups = useMemo<DishGroup[]>(() => {
    const map = new Map<string, DishGroup>();
    fetchedProducts.forEach((p) => {
      const groupKey = `${p.category}_${p.name}`;
      if (!map.has(groupKey)) {
        map.set(groupKey, {
          key: groupKey,
          name: p.name,
          category: p.category,
          desc: p.desc,
          img: p.img,
          portions: [],
        });
      }
      map.get(groupKey)!.portions.push(p);
    });
    return Array.from(map.values());
  }, [fetchedProducts]);

  // Filter dish cards based on category tab and search query
  const filteredDishes = useMemo(() => {
    return dishGroups.filter((dish) => {
      const matchesCategory =
        activeCategory === "all" || dish.category === activeCategory;
      const matchesSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [dishGroups, activeCategory, searchQuery]);

  const categoryTabs = [
    { key: "all", label: "All Items" },
    { key: "rice", label: "🍚 Rice Range" },
    { key: "kottu", label: "🥘 Kottu Range" },
    { key: "noodles", label: "🥢 Noodles Range" },
    { key: "special", label: "🔥 Special Range" },
    { key: "bites", label: "🍗 Bite Range" },
  ];

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
              onClick={() => router.push("/takeaway&delivery")}
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
              Catering by Ahas Gawwa
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Takeaway & Delivery Menu
            </h1>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Rice, Kottu, Biriyani, Bites..."
                className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
            </div>
          </div>
        </div>

        {/* Category Ranges Filter Tabs */}
        <div className="flex overflow-x-auto gap-2.5 pb-2 no-scrollbar">
          {categoryTabs.map((cat) => (
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
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E36727]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 text-sm bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800/30">
            <i className="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500 text-xs">
                No menu items found matching your search filter.
              </div>
            ) : (
              filteredDishes.map((dish) => {
                // Determine currently selected portion variant for this dish card
                const activePortionProduct =
                  dish.portions.find((p) => p.id === selectedPortions[dish.key]) ||
                  dish.portions[0];

                const cartItem = cart.find((item) => item.id === activePortionProduct.id);
                const qty = cartItem ? cartItem.qty : 0;

                return (
                  <div
                    key={dish.key}
                    className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-md hover:border-[#E36727] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={dish.img}
                          alt={dish.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-amber-400">
                          {activePortionProduct.portion}
                        </span>
                      </div>

                      {/* Content & Portion Selector */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                            {dish.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                            {dish.desc}
                          </p>
                        </div>

                        {/* Interactive Portion Selector Pills */}
                        {dish.portions.length > 1 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Choose Portion:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {dish.portions.map((portionItem) => {
                                const isSelected =
                                  portionItem.id === activePortionProduct.id;
                                return (
                                  <button
                                    key={portionItem.id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedPortions((prev) => ({
                                        ...prev,
                                        [dish.key]: portionItem.id,
                                      }))
                                    }
                                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                                      isSelected
                                        ? "bg-[#E36727] text-white border-[#E36727] shadow-xs"
                                        : "bg-slate-100 dark:bg-[#26201d] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#E36727]/50"
                                    }`}
                                  >
                                    {portionItem.portion}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-4 pt-3 flex justify-between items-center border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/10">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {activePortionProduct.portion}
                        </div>
                        <div className="font-serif font-extrabold text-base text-[#E36727]">
                          LKR {activePortionProduct.price.toLocaleString()}
                        </div>
                      </div>

                      {qty > 0 ? (
                        <div className="flex items-center gap-2 bg-[#E36727]/10 border border-[#E36727]/30 px-2 py-1 rounded-xl text-xs">
                          <button
                            onClick={() => updateQty(activePortionProduct.id, -1)}
                            className="w-6 h-6 rounded-lg bg-[#E36727] text-white font-bold cursor-pointer hover:bg-amber-600 transition-colors"
                          >
                            -
                          </button>
                          <span className="font-bold text-[#E36727] px-1">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(activePortionProduct.id, 1)}
                            className="w-6 h-6 rounded-lg bg-[#E36727] text-white font-bold cursor-pointer hover:bg-amber-600 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(activePortionProduct)}
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
        )}
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
