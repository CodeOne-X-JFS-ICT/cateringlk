"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiGet, apiPut } from "@/lib/apiClient";
import StatusBadge from "@/components/admin/StatusBadge";
import SlideOver from "@/components/admin/SlideOver";

const QUOTE_STATUSES = ["PENDING", "DRAFT", "APPROVED", "REJECTED"];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const LIMIT = 15;

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const json = await apiGet(`/admin/catering/quotes?${params}`);
      setQuotes(json.data || []);
      setTotal(json.meta?.total || 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const openDetail = async (quote: any) => {
    setSelected(quote);
    setAdminNotes(quote.admin_notes || "");
    setDetailLoading(true);
    try {
      const json = await apiGet(`/admin/catering/quotes/${quote.id}`);
      setSelected(json.data);
      setAdminNotes(json.data.admin_notes || "");
    } catch {
      // keep row data
    } finally {
      setDetailLoading(false);
    }
  };

  const updateQuote = async (newStatus: string) => {
    setUpdating(true);
    try {
      await apiPut(`/admin/catering/quotes/${selected.id}`, {
        status: newStatus,
        admin_notes: adminNotes,
      });
      await fetchQuotes();
      const json = await apiGet(`/admin/catering/quotes/${selected.id}`);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white">Catering Quotes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review and approve catering quote requests.</p>
        </div>
        <div className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          {total} total quotes
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search by quote ref, customer name or phone..."
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
          {QUOTE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
        ) : quotes.length === 0 ? (
          <div className="py-24 text-center">
            <i className="fa-solid fa-file-invoice text-4xl text-slate-300 mb-4 block"></i>
            <p className="text-slate-500 font-medium">No quotes found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Quote Ref</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Event</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Pax</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Estimate</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white text-xs">{quote.quote_ref}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{quote.customer_name}</div>
                      <div className="text-xs text-slate-400">{quote.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{quote.eventType?.name || "—"}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{quote.pax_count}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Rs. {Number(quote.grand_total || 0).toLocaleString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={quote.status} /></td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(quote.created_at).toLocaleDateString("en-LK")}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openDetail(quote)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#E36727] hover:underline text-xs font-bold cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">← Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Quote Detail SlideOver */}
      <SlideOver isOpen={!!selected} onClose={() => setSelected(null)} title="Quote Details">
        {detailLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E36727]"></div>
          </div>
        ) : selected && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Quote Reference</p>
                <p className="font-mono font-extrabold text-lg text-slate-900 dark:text-white">{selected.quote_ref}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            {/* Event Details */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Event Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400">Event</span><p className="font-bold text-slate-900 dark:text-white">{selected.eventType?.name || "—"}</p></div>
                <div><span className="text-slate-400">Tier</span><p className="font-bold text-slate-900 dark:text-white">{selected.tier?.name || "—"}</p></div>
                <div><span className="text-slate-400">Pax Count</span><p className="font-bold text-slate-900 dark:text-white">{selected.pax_count} people</p></div>
                <div><span className="text-slate-400">Location</span><p className="font-bold text-slate-900 dark:text-white">{selected.location?.city_name || selected.event_location || "—"}</p></div>
                {selected.event_date && <div className="col-span-2"><span className="text-slate-400">Event Date</span><p className="font-bold text-slate-900 dark:text-white">{new Date(selected.event_date).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}</p></div>}
              </div>
            </div>

            {/* Customer */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Customer</h3>
              <p className="font-semibold text-slate-900 dark:text-white">{selected.customer_name}</p>
              <p className="text-sm text-slate-400">{selected.customer_phone}</p>
              {selected.customer_email && <p className="text-sm text-slate-400">{selected.customer_email}</p>}
            </div>

            {/* Add-ons */}
            {selected.quoteAddons && selected.quoteAddons.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Live Action Stations</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.quoteAddons.map((qa: any) => (
                    <span key={qa.id} className="text-xs font-bold bg-[#E36727]/10 text-[#E36727] px-3 py-1.5 rounded-full border border-[#E36727]/20">
                      {qa.addon?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Pricing</h3>
              <div className="flex justify-between font-extrabold text-base">
                <span className="text-slate-900 dark:text-white">Estimated Total</span>
                <span className="text-[#E36727]">Rs. {Number(selected.grand_total || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Add private notes about this quote..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            {selected.status === "PENDING" && (
              <div className="flex gap-3">
                <button disabled={updating} onClick={() => updateQuote("APPROVED")} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all disabled:opacity-60 cursor-pointer">
                  ✓ Approve
                </button>
                <button disabled={updating} onClick={() => updateQuote("REJECTED")} className="flex-1 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 font-bold rounded-xl transition-all disabled:opacity-60 cursor-pointer">
                  ✕ Reject
                </button>
              </div>
            )}
            <button disabled={updating} onClick={() => updateQuote(selected.status)} className="w-full py-3 bg-[#E36727]/10 hover:bg-[#E36727]/20 text-[#E36727] font-bold rounded-xl transition-all disabled:opacity-60 cursor-pointer">
              {updating ? "Saving..." : "Save Notes"}
            </button>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
