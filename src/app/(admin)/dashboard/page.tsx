"use client";

import React, { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for preview if auth fails (since login page isn't built yet)
  const mockStats = {
    orders: { today: 12, pending: 5 },
    revenue: { total: 45000 },
    catering: { pending_quotes: 3 },
    inquiries: { new: 8 },
    catalog: { active_products: 24 },
    team: { active_admins: 2 },
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("http://localhost:5050/api/admin/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        
        if (json.success) {
          setStats(json.data);
        } else {
          // Fallback to mock data for presentation purposes
          setStats(mockStats);
        }
      } catch (err) {
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E36727]"></div>
      </div>
    );
  }

  const statCards = [
    { title: "Today's Orders", value: stats?.orders.today, icon: "fa-bag-shopping", color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Pending Orders", value: stats?.orders.pending, icon: "fa-clock-rotate-left", color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Pending Quotes", value: stats?.catering.pending_quotes, icon: "fa-file-invoice", color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "New Inquiries", value: stats?.inquiries.new, icon: "fa-envelope", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Total Revenue", value: `Rs. ${stats?.revenue.total.toLocaleString()}`, icon: "fa-chart-line", color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Active Products", value: stats?.catalog.active_products, icon: "fa-burger", color: "text-[#E36727]", bg: "bg-[#E36727]/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-extrabold text-slate-900 dark:text-white">
            Welcome back, Admin
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your restaurant today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
            <i className="fa-solid fa-download mr-2"></i> Export Report
          </button>
          <button className="px-4 py-2 bg-[#E36727] hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:scale-105 active:scale-95">
            <i className="fa-solid fa-plus mr-2"></i> Create Order
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {stat.value}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <i className={`fa-solid ${stat.icon} text-xl`}></i>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
              <i className="fa-solid fa-arrow-trend-up mr-1.5"></i> +12% from yesterday
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout for Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-serif font-extrabold text-lg text-slate-900 dark:text-white">Recent Orders</h3>
            <button className="text-sm text-[#E36727] font-bold hover:underline cursor-pointer">View All</button>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-receipt text-2xl text-slate-400"></i>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Orders will appear here once connected to the live API.</p>
          </div>
        </div>

        {/* Recent Quotes Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-serif font-extrabold text-lg text-slate-900 dark:text-white">Recent Quotes</h3>
            <button className="text-sm text-[#E36727] font-bold hover:underline cursor-pointer">View All</button>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-file-invoice text-2xl text-slate-400"></i>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Quote requests will appear here once connected to the live API.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
