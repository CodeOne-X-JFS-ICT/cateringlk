"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("http://localhost:5050/api/admin/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard stats.");
        
        const json = await res.json();
        
        if (json.success) {
          setStats(json.data);
        } else {
          setError(json.message || "Failed to load stats.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#E36727]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center px-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-triangle-exclamation text-xl sm:text-2xl"></i>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Dashboard</h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-5 px-4 py-2 bg-[#E36727] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-amber-600 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    { title: "Today's Orders", value: stats?.orders?.today || 0, icon: "fa-bag-shopping", color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Pending Orders", value: stats?.orders?.pending || 0, icon: "fa-clock-rotate-left", color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Pending Quotes", value: stats?.catering?.pending_quotes || 0, icon: "fa-file-invoice", color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "New Inquiries", value: stats?.inquiries?.new || 0, icon: "fa-envelope", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Total Revenue", value: `Rs. ${(stats?.revenue?.total || 0).toLocaleString()}`, icon: "fa-chart-line", color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Active Products", value: stats?.catalog?.active_products || 0, icon: "fa-burger", color: "text-[#E36727]", bg: "bg-[#E36727]/10" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 dark:text-white">
            Welcome back, Admin
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
            Here's what's happening with your restaurant today.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard/orders"
            className="flex-1 sm:flex-initial text-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <i className="fa-solid fa-list-check mr-2 text-[#E36727]"></i> View Orders
          </Link>
          <Link
            href="/dashboard/quotes"
            className="flex-1 sm:flex-initial text-center px-4 py-2 bg-[#E36727] hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <i className="fa-solid fa-plus mr-1.5 sm:mr-2"></i> Create Quote
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 sm:mt-2">
                  {stat.value}
                </h3>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                <i className={`fa-solid ${stat.icon} text-base sm:text-xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout for Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden flex flex-col min-h-[260px] sm:h-[380px]">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-serif font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Recent Orders</h3>
            <Link href="/dashboard/orders" className="text-xs sm:text-sm text-[#E36727] font-bold hover:underline cursor-pointer">View All →</Link>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <i className="fa-solid fa-receipt text-xl sm:text-2xl text-slate-400"></i>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs">
              Manage takeaway and delivery orders live in the Orders tab.
            </p>
            <Link href="/dashboard/orders" className="mt-3 text-xs font-bold text-[#E36727] hover:underline">
              Go to Orders Management
            </Link>
          </div>
        </div>

        {/* Recent Quotes Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden flex flex-col min-h-[260px] sm:h-[380px]">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-serif font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Recent Quotes</h3>
            <Link href="/dashboard/quotes" className="text-xs sm:text-sm text-[#E36727] font-bold hover:underline cursor-pointer">View All →</Link>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <i className="fa-solid fa-file-invoice text-xl sm:text-2xl text-slate-400"></i>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs">
              Manage catering leads, quotation sheets, and advance payments.
            </p>
            <Link href="/dashboard/quotes" className="mt-3 text-xs font-bold text-[#E36727] hover:underline">
              Go to Catering Quotes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
