"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useAdminSidebar } from "./AdminSidebarContext";

export default function Topbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAdminSidebar();

  // Simple logic to generate a page title from the URL
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    const pathParts = pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace("-", " ");
  };

  return (
    <header className="h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3.5 sm:px-6 lg:px-8 shadow-xs sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <i className="fa-solid fa-bars text-sm"></i>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <h2 className="font-serif text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white transition-colors truncate">
            {getPageTitle()}
          </h2>
          <span className="hidden xs:inline-flex bg-[#E36727]/10 text-[#E36727] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:py-1 rounded-md border border-[#E36727]/20 shrink-0">
            Live System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Search - visible on medium and larger screens */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search orders, quotes..."
            className="w-48 lg:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-[#E36727] transition-colors"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#E36727] hover:border-[#E36727]/50 transition-colors cursor-pointer shrink-0"
          aria-label="View notifications"
          title="Notifications"
        >
          <i className="fa-regular fa-bell text-xs sm:text-sm"></i>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}
