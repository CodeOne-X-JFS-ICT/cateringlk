"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();

  // Simple logic to generate a page title from the URL
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Overview";
    const pathParts = pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace("-", " ");
  };

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-xl font-extrabold text-slate-900 dark:text-white">
          {getPageTitle()}
        </h2>
        <span className="bg-[#E36727]/10 text-[#E36727] text-[10px] font-bold px-2 py-1 rounded-md border border-[#E36727]/20">
          Live System
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search orders or quotes..."
            className="w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-2.5 text-slate-400 text-sm"></i>
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#E36727] hover:border-[#E36727]/50 transition-colors cursor-pointer">
          <i className="fa-regular fa-bell"></i>
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}
