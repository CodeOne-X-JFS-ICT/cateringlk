"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import StatusBadge from "@/components/admin/StatusBadge";
import SlideOver from "@/components/admin/SlideOver";

const INQUIRY_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const CATEGORIES = ["GENERAL", "CATERING", "DELIVERY", "COMPLAINT", "OTHER"];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("NEW");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const LIMIT = 15;

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const json = await apiGet(`/admin/inquiries?${params}`);
      setInquiries(json.data || []);
      setTotal(json.meta?.total || 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const openDetail = async (inquiry: any) => {
    setSelected(inquiry);
    setReplyText("");
    setDetailLoading(true);
    try {
      const json = await apiGet(`/admin/inquiries/${inquiry.id}`);
      setSelected(json.data);
    } catch {
      // keep row data
    } finally {
      setDetailLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await apiPost(`/admin/inquiries/${selected.id}/respond`, { response_text: replyText });
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

  const markResolved = async () => {
    setSending(true);
    try {
      await apiPut(`/admin/inquiries/${selected.id}`, { status: "RESOLVED" });
      const json = await apiGet(`/admin/inquiries/${selected.id}`);
      setSelected(json.data);
      fetchInquiries();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const CATEGORY_ICON: Record<string, string> = {
    GENERAL: "fa-comment",
    CATERING: "fa-utensils",
    DELIVERY: "fa-truck",
    COMPLAINT: "fa-triangle-exclamation",
    OTHER: "fa-circle-question",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white">Inquiries</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Read and respond to customer messages.</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["", ...INQUIRY_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${statusFilter === s ? "bg-[#E36727] text-white shadow-md" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#E36727]/50"}`}
          >
            {s === "" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search by reference, customer name or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
          />
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E36727]"></div>
          </div>
        ) : error ? (
          <div className="py-24 text-center text-slate-500">{error}</div>
        ) : inquiries.length === 0 ? (
          <div className="py-24 text-center">
            <i className="fa-solid fa-inbox text-4xl text-slate-300 mb-4 block"></i>
            <p className="text-slate-500 font-medium">No inquiries found. Inbox is clear!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {inquiries.map((inq) => (
              <button
                key={inq.id}
                onClick={() => openDetail(inq)}
                className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${inq.status === "NEW" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
                  <i className={`fa-solid ${CATEGORY_ICON[inq.category] || "fa-comment"} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`font-bold text-sm truncate ${inq.status === "NEW" ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                      {inq.customer_name}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={inq.status} />
                      <span className="text-xs text-slate-400">{new Date(inq.created_at).toLocaleDateString("en-LK")}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{inq.message || inq.subject || "—"}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{inq.ref_code}</p>
                </div>
              </button>
            ))}
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

      {/* Detail SlideOver */}
      <SlideOver isOpen={!!selected} onClose={() => setSelected(null)} title="Inquiry Details">
        {detailLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E36727]"></div>
          </div>
        ) : selected && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Reference</p>
                <p className="font-mono font-extrabold text-base text-slate-900 dark:text-white">{selected.ref_code}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">From</h3>
              <p className="font-semibold text-slate-900 dark:text-white">{selected.customer_name}</p>
              <p className="text-sm text-slate-400">{selected.customer_phone}</p>
              {selected.customer_email && <p className="text-sm text-slate-400">{selected.customer_email}</p>}
            </div>

            {/* Original Message */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Message</h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.message || selected.subject || "No message content."}</p>
                <p className="text-xs text-slate-400 mt-3">{new Date(selected.created_at).toLocaleString("en-LK")}</p>
              </div>
            </div>

            {/* Existing Responses */}
            {selected.responses && selected.responses.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Responses</h3>
                {selected.responses.map((resp: any) => (
                  <div key={resp.id} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{resp.response_text}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      By {resp.responder?.full_name || "Admin"} · {new Date(resp.created_at).toLocaleString("en-LK")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Box */}
            {selected.status !== "RESOLVED" && selected.status !== "CLOSED" && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="Type your reply to the customer..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors resize-none"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    disabled={sending || !replyText.trim()}
                    onClick={sendReply}
                    className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {sending ? "Sending..." : "Send Reply"}
                  </button>
                  <button
                    disabled={sending}
                    onClick={markResolved}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-60 cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  );
}
