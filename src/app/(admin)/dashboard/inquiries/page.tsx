"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import StatusBadge from "@/components/admin/StatusBadge";
import SlideOver from "@/components/admin/SlideOver";
import CreateQuoteModal from "@/components/admin/quotes/CreateQuoteModal";

const INQUIRY_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const CATEGORIES = [
  { key: "", label: "All Categories", icon: "fa-layer-group" },
  { key: "CATERING", label: "Catering", icon: "fa-utensils" },
  { key: "RESTAURANT", label: "Restaurant", icon: "fa-champagne-glasses" },
  { key: "TAKEAWAY", label: "Takeaway", icon: "fa-bag-shopping" },
  { key: "DELIVERY", label: "Delivery", icon: "fa-truck" },
  { key: "GENERAL", label: "General", icon: "fa-comment" },
  { key: "OTHER", label: "Other", icon: "fa-circle-question" },
];

const CATEGORY_STYLES: Record<string, { icon: string; bg: string; text: string }> = {
  CATERING: { icon: "fa-utensils", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
  RESTAURANT: { icon: "fa-champagne-glasses", bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400" },
  TAKEAWAY: { icon: "fa-bag-shopping", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400" },
  DELIVERY: { icon: "fa-truck", bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400" },
  GENERAL: { icon: "fa-comment", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
  OTHER: { icon: "fa-sparkles", bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
};

const CANNED_REPLIES = [
  "Thank you for reaching out! Our catering team is reviewing your event details.",
  "We have availability on your selected date. Our manager will call you today.",
  "We have emailed our formal catering quotation to your address.",
  "Your takeaway/express order has been noted and reserved with our kitchen.",
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("NEW");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState({
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });

  // Action states
  const [replyText, setReplyText] = useState("");
  const [adminNotesText, setAdminNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [sending, setSending] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Quote conversion state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteInitialData, setQuoteInitialData] = useState<any>(null);

  const LIMIT = 12;

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      });
      const json = await apiGet(`/admin/inquiries?${params}`);
      setInquiries(json.data || []);
      setTotal(json.meta?.total || 0);
      if (json.metrics) {
        setMetrics(json.metrics);
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const openDetail = async (inquiry: any) => {
    setSelected(inquiry);
    setReplyText("");
    setAdminNotesText(inquiry.admin_notes || "");
    setDetailLoading(true);
    try {
      const json = await apiGet(`/admin/inquiries/${inquiry.id}`);
      setSelected(json.data);
      setAdminNotesText(json.data.admin_notes || "");
    } catch {
      // keep row data
    } finally {
      setDetailLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      await apiPost(`/admin/inquiries/${selected.id}/respond`, { response_text: replyText.trim() });
      setReplyText("");
      const json = await apiGet(`/admin/inquiries/${selected.id}`);
      setSelected(json.data);
      fetchInquiries();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!selected) return;
    setSending(true);
    try {
      await apiPut(`/admin/inquiries/${selected.id}`, { status: newStatus });
      const json = await apiGet(`/admin/inquiries/${selected.id}`);
      setSelected(json.data);
      fetchInquiries();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  const saveAdminNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    try {
      await apiPut(`/admin/inquiries/${selected.id}`, { admin_notes: adminNotesText.trim() });
      const json = await apiGet(`/admin/inquiries/${selected.id}`);
      setSelected(json.data);
      alert("Internal notes saved.");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const deleteInquiry = async () => {
    if (!selected) return;
    if (!confirm(`Are you sure you want to permanently delete inquiry ${selected.ref_code}? This action cannot be undone.`)) {
      return;
    }
    setSending(true);
    try {
      await apiDelete(`/admin/inquiries/${selected.id}`);
      setSelected(null);
      fetchInquiries();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  const copyRefCode = () => {
    if (!selected?.ref_code) return;
    navigator.clipboard.writeText(selected.ref_code);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const convertToQuote = () => {
    if (!selected) return;
    setQuoteInitialData({
      customerName: selected.customer_name || "",
      customerPhone: selected.customer_phone || "",
      customerEmail: selected.customer_email || "",
      paxCount: selected.pax_count || 50,
      eventDate: selected.target_date || "",
      customLocation: selected.suburb || "",
      specialNotes: `Converted from Inquiry ${selected.ref_code}: ${selected.message || ""}`,
      adminNotes: `Lead generated from inquiry ${selected.ref_code}.`,
    });
    setQuoteModalOpen(true);
  };

  const cleanPhone = (phoneStr: string) => {
    return phoneStr ? phoneStr.replace(/[^0-9]/g, "") : "";
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <i className="fa-solid fa-inbox text-[#E36727]"></i>
            Customer Inquiries
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review incoming event queries, direct messages, and WhatsApp inquiries.
          </p>
        </div>
        <button
          onClick={() => fetchInquiries()}
          className="self-start sm:self-auto px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#E36727] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <i className="fa-solid fa-rotate text-xs"></i> Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => { setStatusFilter(""); setPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "" ? "border-[#E36727] shadow-md bg-amber-50/50 dark:bg-amber-950/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">All Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-envelope-open-text"></i>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics.total}</p>
        </div>

        <div
          onClick={() => { setStatusFilter("NEW"); setPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "NEW" ? "border-blue-500 shadow-md bg-blue-50/50 dark:bg-blue-950/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              New / Unread
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-bell"></i>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{metrics.new}</p>
        </div>

        <div
          onClick={() => { setStatusFilter("IN_PROGRESS"); setPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "IN_PROGRESS" ? "border-amber-500 shadow-md bg-amber-50/50 dark:bg-amber-950/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{metrics.in_progress}</p>
        </div>

        <div
          onClick={() => { setStatusFilter("RESOLVED"); setPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "RESOLVED" ? "border-emerald-500 shadow-md bg-emerald-50/50 dark:bg-emerald-950/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.resolved}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
            Status:
          </span>
          {["", ...INQUIRY_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === s
                  ? "bg-[#E36727] text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {s === "" ? "All Statuses" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/60 pt-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
            Category:
          </span>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => { setCategoryFilter(c.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                categoryFilter === c.key
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <i className={`fa-solid ${c.icon} text-[10px]`}></i>
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative pt-2">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-5 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search by reference code (AG-INQ-...), customer name, phone, email, or suburb..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727] transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-3.5 top-4.5 text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {/* Inquiries Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E36727]"></div>
            <p className="text-xs text-slate-400 font-medium">Loading inquiries...</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center text-red-500 font-medium">{error}</div>
        ) : inquiries.length === 0 ? (
          <div className="py-24 text-center space-y-2">
            <i className="fa-solid fa-inbox text-5xl text-slate-300 dark:text-slate-700 mb-2 block"></i>
            <p className="text-slate-700 dark:text-slate-300 font-bold">No inquiries found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no customer inquiries matching the selected filters or search terms.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {inquiries.map((inq) => {
              const catConfig = CATEGORY_STYLES[inq.category] || CATEGORY_STYLES.GENERAL;
              const hasResponses = inq.responses && inq.responses.length > 0;

              return (
                <button
                  key={inq.id}
                  onClick={() => openDetail(inq)}
                  className="w-full text-left px-6 py-4.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group flex items-start gap-4 cursor-pointer"
                >
                  {/* Category Avatar */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${catConfig.bg} ${catConfig.text}`}>
                    <i className={`fa-solid ${catConfig.icon} text-base`}></i>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`font-bold text-sm truncate ${inq.status === "NEW" ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-700 dark:text-slate-300"}`}>
                          {inq.customer_name}
                        </span>
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {inq.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={inq.status} />
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(inq.created_at).toLocaleDateString("en-LK")}
                        </span>
                      </div>
                    </div>

                    {/* Inquiry Message Excerpt */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
                      {inq.message || "No inquiry message provided."}
                    </p>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {inq.ref_code}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-phone text-[10px]"></i> {inq.customer_phone}
                      </span>
                      {inq.suburb && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <i className="fa-solid fa-map-pin text-[10px]"></i> {inq.suburb}
                          </span>
                        </>
                      )}
                      {inq.pax_count && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <i className="fa-solid fa-users text-[10px]"></i> {inq.pax_count} Pax
                          </span>
                        </>
                      )}
                      {inq.target_date && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <i className="fa-regular fa-calendar text-[10px]"></i> {inq.target_date}
                          </span>
                        </>
                      )}
                      {hasResponses && (
                        <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                          <i className="fa-solid fa-reply"></i> {inq.responses.length} {inq.responses.length === 1 ? "reply" : "replies"}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} inquiries
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ← Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SlideOver Detail Drawer */}
      <SlideOver
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Inquiry Details & Communication"
      >
        {detailLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E36727]"></div>
          </div>
        ) : selected && (
          <div className="space-y-6 pb-6">
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                  Reference Code
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-lg text-slate-900 dark:text-white">
                    {selected.ref_code}
                  </span>
                  <button
                    onClick={copyRefCode}
                    title="Copy Reference"
                    className="p-1.5 text-xs text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <i className={`fa-solid ${copiedRef ? "fa-check text-emerald-500" : "fa-copy"}`}></i>
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={selected.status} />
                <span className="text-[11px] text-slate-400">
                  {new Date(selected.created_at).toLocaleString("en-LK")}
                </span>
              </div>
            </div>

            {/* Status Change Dropdown */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Change Status:
              </span>
              <select
                value={selected.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={sending}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-[#E36727] cursor-pointer"
              >
                {INQUIRY_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Communication Actions */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Quick Actions
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* WhatsApp button */}
                <a
                  href={`https://wa.me/${cleanPhone(selected.customer_phone)}?text=${encodeURIComponent(
                    `Hi ${selected.customer_name}, thank you for contacting Catering by Ahas Gawwa regarding inquiry ${selected.ref_code}. How can we assist you with your event?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <i className="fa-brands fa-whatsapp text-sm"></i> WhatsApp
                </a>

                {/* Call button */}
                <a
                  href={`tel:${selected.customer_phone}`}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <i className="fa-solid fa-phone text-xs"></i> Call Customer
                </a>

                {/* Email button */}
                {selected.customer_email ? (
                  <a
                    href={`mailto:${selected.customer_email}?subject=${encodeURIComponent(
                      `Catering by Ahas Gawwa — Inquiry ${selected.ref_code}`
                    )}`}
                    className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <i className="fa-solid fa-envelope text-xs"></i> Email
                  </a>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold text-center">
                    No Email Provided
                  </div>
                )}

                {/* Convert to Catering Quote button */}
                <button
                  onClick={convertToQuote}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-file-invoice-dollar text-xs"></i> Create Quote
                </button>
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Customer Information
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Customer Name</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selected.customer_name}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Phone Number</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{selected.customer_phone}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Email</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {selected.customer_email || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Category</span>
                  <span className="font-bold text-[#E36727] uppercase">{selected.category}</span>
                </div>
                {selected.target_date && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Target Event Date</span>
                    <p className="font-bold text-amber-600 dark:text-amber-400">{selected.target_date}</p>
                  </div>
                )}
                {selected.suburb && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Location / Suburb</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{selected.suburb}</p>
                  </div>
                )}
                {selected.pax_count && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Guest Count</span>
                    <p className="font-bold text-slate-900 dark:text-white">{selected.pax_count} Pax</p>
                  </div>
                )}
              </div>
            </div>

            {/* Original Customer Message */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Original Message / Requirements
              </span>
              <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selected.message || "No custom message provided."}
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-lock text-amber-500"></i> Internal Staff Notes (Private)
                </span>
                <button
                  onClick={saveAdminNotes}
                  disabled={savingNotes}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#E36727] hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingNotes ? "Saving..." : "Save Note"}
                </button>
              </div>
              <textarea
                value={adminNotesText}
                onChange={(e) => setAdminNotesText(e.target.value)}
                rows={2}
                placeholder="Add private staff notes e.g., 'Called customer, confirmed monk dana menu'..."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#E36727] resize-none"
              ></textarea>
            </div>

            {/* Communication Thread */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                Responses & Staff Communication ({selected.responses?.length || 0})
              </span>

              {selected.responses && selected.responses.length > 0 ? (
                <div className="space-y-3">
                  {selected.responses.map((resp: any) => (
                    <div
                      key={resp.id}
                      className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-4 space-y-1.5"
                    >
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {resp.response_text}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <i className="fa-solid fa-user-tie text-[9px]"></i>
                          {resp.responder?.full_name || "Staff Admin"}
                        </span>
                        <span>{new Date(resp.created_at).toLocaleString("en-LK")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-400">No staff replies recorded yet.</p>
                </div>
              )}
            </div>

            {/* Reply Input Box */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Record New Staff Reply
              </span>

              {/* Quick Canned Chips */}
              <div className="flex flex-wrap gap-1.5">
                {CANNED_REPLIES.map((canned, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReplyText(canned)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#E36727] hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors border border-transparent cursor-pointer"
                  >
                    {canned.slice(0, 30)}...
                  </button>
                ))}
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                placeholder="Type response to log in the inquiry record..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-[#E36727] transition-colors resize-none"
              />

              <div className="flex gap-2">
                <button
                  disabled={sending || !replyText.trim()}
                  onClick={sendReply}
                  className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  {sending ? "Recording..." : "Record Reply"}
                </button>

                {selected.status !== "RESOLVED" && (
                  <button
                    disabled={sending}
                    onClick={() => updateStatus("RESOLVED")}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-check text-xs"></i> Mark Resolved
                  </button>
                )}
              </div>
            </div>

            {/* Delete Inquiry (Danger zone) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                disabled={sending}
                onClick={deleteInquiry}
                className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1.5 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-trash-can text-xs"></i> Delete Inquiry
              </button>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Quote Creation Modal (for inquiry to quote conversion) */}
      <CreateQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        onCreated={() => {
          setQuoteModalOpen(false);
          alert("Quote created successfully from inquiry!");
        }}
        initialData={quoteInitialData}
      />
    </div>
  );
}
