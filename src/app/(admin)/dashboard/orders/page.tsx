"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import StatusBadge from "@/components/admin/StatusBadge";
import SlideOver from "@/components/admin/SlideOver";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COLLECTED",
  "CANCELLED",
];

const getNextStatus = (currentStatus: string, orderType: string): string | null => {
  if (orderType === "TAKEAWAY") {
    const flow: Record<string, string | null> = {
      PENDING: "CONFIRMED",
      CONFIRMED: "PREPARING",
      PREPARING: "READY",
      READY: "COLLECTED",
      COLLECTED: null,
      CANCELLED: null,
    };
    return flow[currentStatus] || null;
  } else {
    const flow: Record<string, string | null> = {
      PENDING: "CONFIRMED",
      CONFIRMED: "PREPARING",
      PREPARING: "READY",
      READY: "OUT_FOR_DELIVERY",
      OUT_FOR_DELIVERY: "DELIVERED",
      DELIVERED: null,
      CANCELLED: null,
    };
    return flow[currentStatus] || null;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState(false);

  // Admin notes state inside SlideOver
  const [editingNotes, setEditingNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Print Slip Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Auto-refresh control
  const [autoPoll, setAutoPoll] = useState(true);

  const LIMIT = 15;

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(orderTypeFilter && { order_type: orderTypeFilter }),
      });
      const json = await apiGet(`/admin/orders?${params}`);
      setOrders(json.data || []);
      setTotal(json.pagination?.totalItems ?? json.meta?.total ?? (json.data?.length || 0));
    } catch (e: any) {
      setError(e.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [page, search, statusFilter, orderTypeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Live Auto Polling every 20 seconds
  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [autoPoll, fetchOrders]);

  const openDetail = async (order: any) => {
    setSelected(order);
    setEditingNotes(order.admin_notes || "");
    setDetailLoading(true);
    try {
      const json = await apiGet(`/admin/orders/${order.id}`);
      setSelected(json.data);
      setEditingNotes(json.data.admin_notes || "");
    } catch {
      // keep the list row data
    } finally {
      setDetailLoading(false);
    }
  };

  const advanceStatus = async (orderId: number, newStatus: string) => {
    setUpdating(true);
    try {
      await apiPatch(`/admin/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders(true);
      // refresh detail
      const json = await apiGet(`/admin/orders/${orderId}`);
      setSelected(json.data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    try {
      await apiPatch(`/admin/orders/${selected.id}/notes`, { admin_notes: editingNotes });
      setSelected((prev: any) => ({ ...prev, admin_notes: editingNotes }));
      alert("Order notes updated successfully!");
    } catch (e: any) {
      alert("Failed to save note: " + e.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const totalPages = Math.ceil(total / LIMIT);
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-slate-900 dark:text-white">
              Orders Management
            </h1>
            {autoPoll && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Live Polling</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time management for customer takeaway & express delivery orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {pendingOrdersCount > 0 && (
            <div className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 animate-pulse">
              <i className="fa-solid fa-bell text-xs"></i>
              <span>{pendingOrdersCount} Pending</span>
            </div>
          )}

          <button
            onClick={() => fetchOrders()}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Refresh list"
          >
            <i className={`fa-solid fa-rotate-right ${loading ? "animate-spin" : ""}`}></i>
            <span>Refresh</span>
          </button>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            {total} Total
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 space-y-3 shadow-xs">
        {/* Order Type Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
          {[
            { label: "All Orders", value: "" },
            { label: "Takeaway Only", value: "TAKEAWAY", icon: "fa-bag-shopping" },
            { label: "Delivery Only", value: "DELIVERY", icon: "fa-motorcycle" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setOrderTypeFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                orderTypeFilter === tab.value
                  ? "bg-[#E36727] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.icon && <i className={`fa-solid ${tab.icon}`}></i>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by order ref, customer name or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727] transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 sm:px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727] transition-colors cursor-pointer"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Content: Mobile Cards + Desktop Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 sm:py-24">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-[#E36727]"></div>
          </div>
        ) : error ? (
          <div className="py-20 sm:py-24 text-center text-rose-500 font-medium px-4 text-sm">{error}</div>
        ) : orders.length === 0 ? (
          <div className="py-20 sm:py-24 text-center px-4">
            <i className="fa-solid fa-receipt text-3xl sm:text-4xl text-slate-300 dark:text-slate-700 mb-3 block"></i>
            <p className="text-slate-500 font-medium text-xs sm:text-sm">No orders found matching criteria.</p>
          </div>
        ) : (
          <>
            {/* 1. Mobile Cards View (< 640px) */}
            <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => openDetail(order)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer space-y-2.5"
                >
                  {/* Top row: Ref + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-0.5 rounded-md">
                      {order.order_ref}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Customer details */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {order.customer_name}
                      </p>
                      <a
                        href={`tel:${order.customer_phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-[#E36727] font-semibold"
                      >
                        {order.customer_phone}
                      </a>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Rs. {Number(order.grand_total).toLocaleString()}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {order.payment_method}
                      </span>
                    </div>
                  </div>

                  {/* Badges + timestamp + action */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          order.order_type === "DELIVERY"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {order.order_type === "DELIVERY" ? "🛵 Delivery" : "🛍️ Takeaway"}
                      </span>
                      {order.deliveryZone && (
                        <span className="text-[11px] text-slate-400">
                          {order.deliveryZone.city_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-[#E36727] font-bold text-xs">
                        Manage →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table View (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-5 lg:px-6 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                      Order Ref
                    </th>
                    <th className="text-left px-5 lg:px-6 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-5 lg:px-6 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                      Type / Zone
                    </th>
                    <th className="text-left px-5 lg:px-6 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                      Payment
                    </th>
                    <th className="text-left px-5 lg:px-6 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                      Total
                    </th>
                    <th className="text-left px-5 lg:px-6 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-5 lg:px-6 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                      Time Placed
                    </th>
                    <th className="px-5 lg:px-6 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => openDetail(order)}
                    >
                      <td className="px-5 lg:px-6 py-4 font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {order.order_ref}
                      </td>
                      <td className="px-5 lg:px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.customer_name}
                        </div>
                        <div className="text-xs text-slate-400">{order.customer_phone}</div>
                      </td>
                      <td className="px-5 lg:px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              order.order_type === "DELIVERY"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {order.order_type === "DELIVERY" ? "🛵 Delivery" : "🛍️ Takeaway"}
                          </span>
                          {order.deliveryZone && (
                            <span className="text-xs text-slate-400">
                              ({order.deliveryZone.city_name})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 lg:px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {order.payment_method}
                      </td>
                      <td className="px-5 lg:px-6 py-4 font-bold text-slate-900 dark:text-white">
                        Rs. {Number(order.grand_total).toLocaleString()}
                      </td>
                      <td className="px-5 lg:px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 lg:px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        <div className="text-[10px] text-slate-400">
                          {new Date(order.created_at).toLocaleDateString("en-LK")}
                        </div>
                      </td>
                      <td className="px-5 lg:px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(order);
                          }}
                          className="text-[#E36727] hover:underline text-xs font-bold cursor-pointer"
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              Page {page} of {totalPages} ({total} orders)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ← Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail SlideOver */}
      <SlideOver isOpen={!!selected} onClose={() => setSelected(null)} title="Order Details">
        {detailLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E36727]"></div>
          </div>
        ) : selected && (
          <div className="space-y-5 text-xs sm:text-sm">
            {/* Header Reference & Status */}
            <div className="flex items-start justify-between gap-2 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                  Order Reference
                </p>
                <p className="font-mono font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                  {selected.order_ref}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Placed {new Date(selected.created_at).toLocaleString("en-LK")}
                </p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            {/* Quick Action Links: WhatsApp + Print */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={`https://wa.me/${selected.customer_phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Hello ${selected.customer_name}, regarding your order ${selected.order_ref} with Catering by Ahas Gawwa: Current status is ${selected.status}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800 transition-all"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
                <span>WhatsApp Customer</span>
              </a>

              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-print text-sm"></i>
                <span>Print Kitchen Slip</span>
              </button>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-2.5 text-xs border border-slate-200 dark:border-slate-700/60">
              <h3 className="font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-200 dark:border-slate-700 text-[10px]">
                Fulfillment Details
              </h3>
              <div className="flex gap-2">
                <i className="fa-solid fa-user text-slate-400 w-4 mt-0.5"></i>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selected.customer_name}
                </span>
              </div>
              <div className="flex gap-2">
                <i className="fa-solid fa-phone text-slate-400 w-4 mt-0.5"></i>
                <a
                  href={`tel:${selected.customer_phone}`}
                  className="font-semibold text-[#E36727] hover:underline"
                >
                  {selected.customer_phone}
                </a>
              </div>
              <div className="flex gap-2">
                <i className="fa-solid fa-tag text-slate-400 w-4 mt-0.5"></i>
                <span className="text-slate-700 dark:text-slate-300">
                  Mode: <strong className="text-slate-900 dark:text-white">{selected.order_type}</strong>
                  {selected.verified_location ? ` (${selected.verified_location})` : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <i className="fa-solid fa-clock text-slate-400 w-4 mt-0.5"></i>
                <span className="text-slate-700 dark:text-slate-300">
                  Time Slot: <strong className="text-slate-900 dark:text-white">{selected.time_slot || "ASAP"}</strong>
                </span>
              </div>
              <div className="flex gap-2">
                <i className="fa-solid fa-credit-card text-slate-400 w-4 mt-0.5"></i>
                <span className="text-slate-700 dark:text-slate-300">
                  Payment: <strong className="text-slate-900 dark:text-white">{selected.payment_method}</strong>
                </span>
              </div>

              {selected.delivery_address && (
                <div className="flex gap-2 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                  <i className="fa-solid fa-location-dot text-[#E36727] w-4 mt-0.5"></i>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {selected.delivery_address}
                  </span>
                </div>
              )}
            </div>

            {/* Special Instructions Alert */}
            {selected.special_instructions && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                <p className="font-bold text-amber-800 dark:text-amber-400 uppercase text-[10px] tracking-wider mb-1">
                  Customer Special Instructions:
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {selected.special_instructions}
                </p>
              </div>
            )}

            {/* Order Items Table */}
            {selected.items && selected.items.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Ordered Items ({selected.items.length})
                </h3>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {selected.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800 last:border-0 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {item.product_name_snapshot || item.product?.name || "Product"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Qty: {item.quantity} × Rs. {Number(item.unit_price_snapshot || item.product?.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <p className="font-extrabold text-slate-900 dark:text-white">
                        Rs. {Number(item.line_total || item.subtotal || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-2 border border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Rs. {Number(selected.subtotal || 0).toLocaleString()}
                </span>
              </div>
              {Number(selected.delivery_fee) > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Delivery Fee</span>
                  <span className="font-semibold text-[#E36727]">
                    Rs. {Number(selected.delivery_fee).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span className="text-slate-900 dark:text-white">Grand Total</span>
                <span className="text-[#E36727]">
                  Rs. {Number(selected.grand_total).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Admin Internal Notes */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Kitchen / Admin Notes
              </label>
              <textarea
                rows={2}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Internal notes (e.g. Rider assigned: Kamal, Call made at 12:15...)"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727]"
              ></textarea>
              <button
                type="button"
                disabled={savingNotes}
                onClick={handleSaveNotes}
                className="px-3 py-1.5 text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-all cursor-pointer"
              >
                {savingNotes ? "Saving..." : "Save Internal Note"}
              </button>
            </div>

            {/* Status Transition Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Order Status Action
              </label>

              {/* Next Step Primary Button */}
              {getNextStatus(selected.status, selected.order_type) && (
                <button
                  disabled={updating}
                  onClick={() =>
                    advanceStatus(
                      selected.id,
                      getNextStatus(selected.status, selected.order_type)!
                    )
                  }
                  className="w-full py-3 sm:py-3.5 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-arrow-right"></i>
                  <span>
                    {updating
                      ? "Updating Status..."
                      : `Advance: Mark as ${getNextStatus(selected.status, selected.order_type)?.replace(/_/g, " ")}`}
                  </span>
                </button>
              )}

              {/* Manual Override Status Selector */}
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center pt-1">
                <select
                  value={selected.status}
                  onChange={(e) => advanceStatus(selected.id, e.target.value)}
                  disabled={updating}
                  className="flex-1 text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold cursor-pointer"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      Set to: {st.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>

                {selected.status !== "CANCELLED" && (
                  <button
                    disabled={updating}
                    onClick={() => {
                      if (confirm("Are you sure you want to cancel this order?")) {
                        advanceStatus(selected.id, "CANCELLED");
                      }
                    }}
                    className="py-2 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 transition-all cursor-pointer text-center"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Print Slip Modal */}
      {isPrintModalOpen && selected && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-black p-4 sm:p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="text-center pb-2 border-b border-dashed border-gray-400">
              <h2 className="font-bold text-sm sm:text-base">CATERING BY AHAS GAWWA</h2>
              <p className="text-[10px]">Handapangoda Express Hub</p>
              <p className="text-[10px]">+94 74 201 3332</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>ORDER REF:</span>
                <span className="font-bold">{selected.order_ref}</span>
              </div>
              <div className="flex justify-between">
                <span>TYPE:</span>
                <span className="font-bold">{selected.order_type}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="truncate ml-2">{selected.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>PHONE:</span>
                <span>{selected.customer_phone}</span>
              </div>
              {selected.delivery_address && (
                <div className="pt-1">
                  <span className="font-bold">ADDRESS:</span>
                  <p className="text-[11px] break-words">{selected.delivery_address}</p>
                </div>
              )}
              {selected.special_instructions && (
                <div className="pt-1 text-red-600">
                  <span className="font-bold">INSTRUCTIONS:</span>
                  <p className="text-[11px] break-words">{selected.special_instructions}</p>
                </div>
              )}
            </div>

            <div className="border-t border-b border-dashed border-gray-400 py-2 space-y-1">
              {selected.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between gap-2">
                  <span className="truncate">
                    {item.quantity}x {item.product_name_snapshot || item.product?.name}
                  </span>
                  <span className="shrink-0">Rs. {Number(item.line_total || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1 font-bold">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>Rs. {Number(selected.subtotal || 0).toLocaleString()}</span>
              </div>
              {Number(selected.delivery_fee) > 0 && (
                <div className="flex justify-between">
                  <span>DELIVERY:</span>
                  <span>Rs. {Number(selected.delivery_fee).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs sm:text-sm pt-1 border-t border-gray-400">
                <span>GRAND TOTAL:</span>
                <span>Rs. {Number(selected.grand_total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>PAYMENT:</span>
                <span>{selected.payment_method}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={handlePrintSlip}
                className="flex-1 py-2.5 bg-black text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                Print Now
              </button>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="py-2.5 px-4 bg-gray-200 text-black font-bold rounded-xl cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
