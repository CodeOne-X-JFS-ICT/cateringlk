"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import StatusBadge from "@/components/admin/StatusBadge";
import SlideOver from "@/components/admin/SlideOver";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];

const STATUS_FLOW: Record<string, string | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState(false);
  const LIMIT = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const json = await apiGet(`/admin/orders?${params}`);
      setOrders(json.data || []);
      setTotal(json.meta?.total || 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openDetail = async (order: any) => {
    setSelected(order);
    setDetailLoading(true);
    try {
      const json = await apiGet(`/admin/orders/${order.id}`);
      setSelected(json.data);
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
      await fetchOrders();
      // refresh detail
      const json = await apiGet(`/admin/orders/${orderId}`);
      setSelected(json.data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white">Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and process all takeaway & delivery orders.</p>
        </div>
        <div className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          {total} total orders
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search by order ref, customer name or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors cursor-pointer"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E36727]"></div>
          </div>
        ) : error ? (
          <div className="py-24 text-center text-slate-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center">
            <i className="fa-solid fa-receipt text-4xl text-slate-300 mb-4 block"></i>
            <p className="text-slate-500 font-medium">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Order Ref</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Total</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white text-xs">{order.order_ref}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{order.customer_name}</div>
                      <div className="text-xs text-slate-400">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">
                        {order.order_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Rs. {Number(order.grand_total).toLocaleString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(order.created_at).toLocaleDateString("en-LK")}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openDetail(order)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#E36727] hover:underline text-xs font-bold cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ← Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
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
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Order Reference</p>
                <p className="font-mono font-extrabold text-lg text-slate-900 dark:text-white">{selected.order_ref}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            {/* Customer */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Customer Info</h3>
              <div className="flex gap-2"><i className="fa-solid fa-user text-slate-400 w-4 mt-0.5"></i><span className="text-sm text-slate-900 dark:text-white">{selected.customer_name}</span></div>
              <div className="flex gap-2"><i className="fa-solid fa-phone text-slate-400 w-4 mt-0.5"></i><span className="text-sm text-slate-900 dark:text-white">{selected.customer_phone}</span></div>
              {selected.delivery_address && (
                <div className="flex gap-2"><i className="fa-solid fa-location-dot text-slate-400 w-4 mt-0.5"></i><span className="text-sm text-slate-900 dark:text-white">{selected.delivery_address}</span></div>
              )}
              {selected.deliveryZone && (
                <div className="flex gap-2"><i className="fa-solid fa-map-pin text-slate-400 w-4 mt-0.5"></i><span className="text-sm text-slate-900 dark:text-white">{selected.deliveryZone.city_name}</span></div>
              )}
            </div>

            {/* Order Items */}
            {selected.items && selected.items.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selected.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.product_name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Rs. {Number(item.subtotal).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">Rs. {Number(selected.subtotal || 0).toLocaleString()}</span>
              </div>
              {selected.delivery_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery Fee</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Rs. {Number(selected.delivery_fee).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-base border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span className="text-slate-900 dark:text-white">Total</span>
                <span className="text-[#E36727]">Rs. {Number(selected.grand_total).toLocaleString()}</span>
              </div>
            </div>

            {/* Status Actions */}
            {STATUS_FLOW[selected.status] && (
              <button
                disabled={updating}
                onClick={() => advanceStatus(selected.id, STATUS_FLOW[selected.status]!)}
                className="w-full py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl transition-all disabled:opacity-60 cursor-pointer"
              >
                {updating ? "Updating..." : `Mark as ${STATUS_FLOW[selected.status]}`}
              </button>
            )}
            {selected.status !== "CANCELLED" && selected.status !== "DELIVERED" && (
              <button
                disabled={updating}
                onClick={() => advanceStatus(selected.id, "CANCELLED")}
                className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 font-bold rounded-xl transition-all disabled:opacity-60 cursor-pointer"
              >
                Cancel Order
              </button>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  );
}
