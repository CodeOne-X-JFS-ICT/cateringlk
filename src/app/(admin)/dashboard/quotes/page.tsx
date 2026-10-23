"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiGet, apiPut } from "@/lib/apiClient";
import StatusBadge from "@/components/admin/StatusBadge";
import SlideOver from "@/components/admin/SlideOver";
import CreateQuoteModal from "@/components/admin/quotes/CreateQuoteModal";
import RecordPaymentModal from "@/components/admin/quotes/RecordPaymentModal";
import QuotePrintModal from "@/components/admin/quotes/QuotePrintModal";

const QUOTE_STATUS_TABS = [
  { id: "", label: "All Quotes" },
  { id: "PENDING", label: "Pending" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "QUOTED", label: "Quoted" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail & SlideOver
  const [selected, setSelected] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [modalQuote, setModalQuote] = useState<any | null>(null);

  // Fetch Quotes
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

      const [quotesRes, statsRes] = await Promise.all([
        apiGet(`/admin/catering/quotes?${params}`),
        apiGet("/admin/catering/quotes/stats").catch(() => null),
      ]);

      setQuotes(quotesRes.data || []);
      setTotal(quotesRes.pagination?.totalItems ?? quotesRes.meta?.total ?? quotesRes.data?.length ?? 0);
      if (statsRes && statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Open Full Detail
  const openDetail = async (quote: any) => {
    setSelected(quote);
    setAdminNotes(quote.admin_notes || "");
    setDetailLoading(true);
    try {
      const json = await apiGet(`/admin/catering/quotes/${quote.id}`);
      setSelected(json.data);
      setAdminNotes(json.data.admin_notes || "");
    } catch {
      // Keep row state
    } finally {
      setDetailLoading(false);
    }
  };

  // Update Quote Status or Notes
  const updateQuoteStatus = async (newStatus: string) => {
    if (!selected) return;
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
      alert(e.message || "Failed to update quote");
    } finally {
      setUpdating(false);
    }
  };

  const saveAdminNotesOnly = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      await apiPut(`/admin/catering/quotes/${selected.id}`, {
        admin_notes: adminNotes,
      });
      await fetchQuotes();
      alert("Admin notes saved.");
    } catch (e: any) {
      alert(e.message || "Failed to save notes");
    } finally {
      setUpdating(false);
    }
  };

  // WhatsApp Proposal Formatter
  const openWhatsAppQuote = (q: any) => {
    const phone = (q.customer_phone || "").replace(/[^0-9]/g, "");
    const formattedPhone = phone.startsWith("0") ? "94" + phone.slice(1) : phone;
    const msg = `Dear ${q.customer_name},\n\nThank you for choosing Catering by Ahas Gawwa. Here is your quotation summary:\n\n• Quote Ref: ${q.quote_ref}\n• Event: ${q.eventType?.name || "Catering Event"}\n• Menu: ${q.package?.name || q.tier?.name || "Banquet Menu"}\n• Guest Count: ${q.pax_count} Pax\n• Event Date: ${q.event_date || "To be confirmed"}\n• Grand Estimated Total: LKR ${Number(q.grand_total || 0).toLocaleString()}\n• 30% Advance Deposit Required: LKR ${Number(q.advance_amount || 0).toLocaleString()}\n\nPlease let us know if you wish to confirm. Our team is ready to assist!`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <i className="fa-solid fa-file-invoice-dollar text-[#E36727]"></i> Catering Quotes & Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage catering leads, pricing proposals, advance deposits, and event bookings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-600 hover:to-[#E36727] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 transform hover:scale-[1.02]"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Create New Quote</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
              <p className="text-2xl font-serif font-extrabold text-amber-500 mt-0.5">
                {stats.counts?.pending || 0}
              </p>
              <span className="text-[10px] text-slate-400">Requires contact within 2h</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg">
              <i className="fa-solid fa-clock"></i>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Negotiation</p>
              <p className="text-2xl font-serif font-extrabold text-indigo-500 mt-0.5">
                {(stats.counts?.contacted || 0) + (stats.counts?.quoted || 0)}
              </p>
              <span className="text-[10px] text-slate-400">
                {stats.counts?.quoted || 0} formal quotes sent
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg">
              <i className="fa-solid fa-comments-dollar"></i>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Bookings</p>
              <p className="text-2xl font-serif font-extrabold text-emerald-500 mt-0.5">
                {stats.counts?.confirmed || 0}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">
                Rs. {Number(stats.financials?.advances_collected || 0).toLocaleString()} advance paid
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Value</p>
              <p className="text-xl sm:text-2xl font-serif font-extrabold text-[#E36727] mt-0.5">
                Rs. {Number(stats.financials?.pipeline_value || 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400">{stats.counts?.total || 0} total quotations</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#E36727]/10 text-[#E36727] flex items-center justify-center text-lg">
              <i className="fa-solid fa-chart-line"></i>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-slate-800">
          {QUOTE_STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#E36727] text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search quotes by reference (e.g. CQ-2026), customer name, or phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727] transition-colors"
          />
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E36727]"></div>
          </div>
        ) : error ? (
          <div className="py-24 text-center text-rose-500 font-semibold">{error}</div>
        ) : quotes.length === 0 ? (
          <div className="py-24 text-center">
            <i className="fa-solid fa-file-invoice text-4xl text-slate-300 mb-3 block"></i>
            <p className="text-slate-500 font-medium text-sm">No catering quotes found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    Quote Ref
                  </th>
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    Menu / Occasion
                  </th>
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    Event Date
                  </th>
                  <th className="text-center px-5 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    Pax
                  </th>
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    Estimate & Deposit
                  </th>
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    onClick={() => openDetail(quote)}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        {quote.quote_ref}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{quote.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{quote.customer_phone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {quote.package?.name || quote.tier?.name || "Banquet Package"}
                      </div>
                      <div className="text-[11px] text-slate-400">{quote.eventType?.name || "Event"}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {quote.event_date
                          ? new Date(quote.event_date).toLocaleDateString("en-LK", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "TBD"}
                      </div>
                      <div className="text-[10px] text-slate-400">{quote.event_time_slot || "Slot TBD"}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center font-extrabold text-slate-900 dark:text-white">
                      {quote.pax_count}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        Rs. {Number(quote.grand_total || 0).toLocaleString()}
                      </div>
                      <div className="mt-0.5">
                        <StatusBadge status={quote.payment_status || "UNPAID"} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={quote.status} />
                    </td>
                    <td
                      className="px-5 py-3.5 text-right space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        title="Quick WhatsApp"
                        onClick={() => openWhatsAppQuote(quote)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                      >
                        <i className="fa-brands fa-whatsapp text-sm"></i>
                      </button>
                      <button
                        title="Print Quote Slip"
                        onClick={() => {
                          setModalQuote(quote);
                          setIsPrintModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-print text-sm"></i>
                      </button>
                      <button
                        onClick={() => openDetail(quote)}
                        className="px-2.5 py-1 text-xs font-bold text-[#E36727] hover:underline cursor-pointer"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              Page {page} of {totalPages} ({total} quotes)
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

      {/* Quote Detail SlideOver */}
      <SlideOver isOpen={!!selected} onClose={() => setSelected(null)} title="Quote Details">
        {detailLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E36727]"></div>
          </div>
        ) : (
          selected && (
            <div className="space-y-6 text-xs font-sans">
              {/* Header Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">
                    Quotation Reference
                  </span>
                  <p className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                    {selected.quote_ref}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Submitted: {new Date(selected.created_at).toLocaleString("en-LK")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={selected.status} />
                  <StatusBadge status={selected.payment_status || "UNPAID"} />
                </div>
              </div>

              {/* Status Transition Stepper */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Update Lead Status
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {["PENDING", "CONTACTED", "QUOTED", "CONFIRMED", "CANCELLED"].map((st) => {
                    const isCurrent = selected.status === st;
                    return (
                      <button
                        key={st}
                        disabled={updating}
                        onClick={() => updateQuoteStatus(st)}
                        className={`py-2 px-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-[#E36727] text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Box */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Customer Information
                  </h3>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${selected.customer_phone}`}
                      className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[11px] font-bold hover:bg-emerald-500/20"
                    >
                      <i className="fa-solid fa-phone mr-1"></i> Call
                    </a>
                    <button
                      onClick={() => openWhatsAppQuote(selected)}
                      className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[11px] font-bold hover:bg-emerald-500/20 cursor-pointer"
                    >
                      <i className="fa-brands fa-whatsapp mr-1"></i> WhatsApp
                    </button>
                  </div>
                </div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">{selected.customer_name}</p>
                <p className="text-slate-600 dark:text-slate-300">{selected.customer_phone}</p>
                {selected.customer_email && (
                  <p className="text-slate-400">{selected.customer_email}</p>
                )}
              </div>

              {/* Event Logistics */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2.5 border border-slate-200 dark:border-slate-700">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Event Particulars
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Occasion</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selected.eventType?.name || "Private Banquet"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Guest Count</span>
                    <span className="font-bold text-[#E36727]">{selected.pax_count} Pax</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selected.event_date
                        ? new Date(selected.event_date).toLocaleDateString("en-LK", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "TBD"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Time Slot</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selected.event_time_slot || "Slot TBD"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Venue / Location</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selected.custom_location || selected.location?.city_name || "Client Specified Venue"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Menu & Live Stations */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Menu & Inclusions
                </h3>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">
                      {selected.package?.name || selected.tier?.name || "Banquet Menu"}
                    </span>
                    <span className="text-[#E36727]">
                      Rs. {Number(selected.base_rate_per_pax || 0).toLocaleString()} / plate
                    </span>
                  </div>
                  {selected.package?.inclusions_text && (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {selected.package.inclusions_text}
                    </p>
                  )}

                  {selected.quoteAddons && selected.quoteAddons.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Live Action Stations Added:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.quoteAddons.map((qa: any) => (
                          <span
                            key={qa.id}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E36727]/10 text-[#E36727] border border-[#E36727]/20"
                          >
                            {qa.addon?.name} (+Rs. {Number(qa.price_per_pax).toLocaleString()})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comprehensive Financial Ledger */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Financial Ledger
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Food Subtotal ({selected.pax_count} Pax):</span>
                    <span>Rs. {Number(selected.food_subtotal || Number(selected.base_rate_per_pax || 0) * selected.pax_count).toLocaleString()}</span>
                  </div>
                  {Number(selected.service_charge || 0) > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>10% Service Charge:</span>
                      <span>Rs. {Number(selected.service_charge).toLocaleString()}</span>
                    </div>
                  )}
                  {Number(selected.transport_fee || 0) > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Transport / Logistics:</span>
                      <span>+ Rs. {Number(selected.transport_fee).toLocaleString()}</span>
                    </div>
                  )}
                  {Number(selected.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount Applied:</span>
                      <span>- Rs. {Number(selected.discount_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Grand Total:</span>
                    <span className="text-[#E36727]">Rs. {Number(selected.grand_total || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold pt-1">
                    <span>30% Advance Required:</span>
                    <span>Rs. {Number(selected.advance_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-extrabold pt-1">
                    <span>Total Paid to Date:</span>
                    <span>Rs. {Number(selected.total_paid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-white font-extrabold pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Balance Due on Event:</span>
                    <span className="text-amber-500">Rs. {Number(selected.balance_remaining || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payments History & Record Payment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Payment Receipts
                  </h3>
                  <button
                    onClick={() => {
                      setModalQuote(selected);
                      setIsPaymentModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i> Record Payment
                  </button>
                </div>

                {selected.payments && selected.payments.length > 0 ? (
                  <div className="space-y-1.5">
                    {selected.payments.map((p: any) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {p.receipt_id}
                          </span>
                          <span className="text-[10px] text-slate-400 block uppercase">
                            {p.payment_method} • {new Date(p.paid_at || p.created_at).toLocaleDateString("en-LK")}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-600">
                            Rs. {Number(p.amount).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 block">
                            {p.payment_type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                    No payment recorded yet.
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Internal Catering Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Private coordinator notes, timeline follow-up..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-[#E36727] resize-none"
                />
                <button
                  disabled={updating}
                  onClick={saveAdminNotesOnly}
                  className="mt-1.5 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {updating ? "Saving..." : "Save Internal Notes"}
                </button>
              </div>

              {/* Bottom Quick Tools */}
              <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setModalQuote(selected);
                    setIsPrintModalOpen(true);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-print"></i>
                  <span>Print Formal Quote</span>
                </button>
                <button
                  onClick={() => openWhatsAppQuote(selected)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </div>
          )
        )}
      </SlideOver>

      {/* MODALS */}
      <CreateQuoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => fetchQuotes()}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setModalQuote(null);
        }}
        quote={modalQuote}
        onPaymentRecorded={async () => {
          await fetchQuotes();
          if (selected) {
            const json = await apiGet(`/admin/catering/quotes/${selected.id}`);
            setSelected(json.data);
          }
        }}
      />

      <QuotePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setModalQuote(null);
        }}
        quote={modalQuote}
      />
    </div>
  );
}
