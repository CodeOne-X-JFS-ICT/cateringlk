"use client";

import React from "react";

type StatusConfig = {
  label: string;
  className: string;
};

const STATUS_MAP: Record<string, StatusConfig> = {
  // Orders
  PENDING:    { label: "Pending",    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50" },
  CONFIRMED:  { label: "Confirmed",  className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50" },
  PREPARING:  { label: "Preparing",  className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-700/50" },
  READY:      { label: "Ready",      className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-700/50" },
  DELIVERED:  { label: "Delivered",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50" },
  CANCELLED:  { label: "Cancelled",  className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700/50" },
  // Quotes
  DRAFT:      { label: "Draft",      className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700" },
  APPROVED:   { label: "Approved",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50" },
  REJECTED:   { label: "Rejected",   className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700/50" },
  // Inquiries
  NEW:        { label: "New",        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50" },
  IN_PROGRESS:{ label: "In Progress",className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50" },
  RESOLVED:   { label: "Resolved",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50" },
  CLOSED:     { label: "Closed",     className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700" },
  // Users
  true:       { label: "Active",     className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50" },
  false:      { label: "Inactive",   className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700/50" },
};

interface StatusBadgeProps {
  status: string | boolean;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const key = String(status);
  const config = STATUS_MAP[key] ?? { label: key, className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700" };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}
