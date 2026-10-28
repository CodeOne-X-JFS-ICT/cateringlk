"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { apiGet } from "@/lib/apiClient";
import { useAdminSidebar } from "./AdminSidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [newInquiriesCount, setNewInquiriesCount] = useState<number>(0);
  const { theme, toggleTheme } = useTheme();
  const { isOpen, closeSidebar } = useAdminSidebar();

  useEffect(() => {
    // Read and decode the JWT token to get the role
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || "ADMIN");
      } catch (e) {
        setUserRole("ADMIN"); // fallback
      }
    }

    // Fetch dashboard stats for badges
    apiGet("/admin/dashboard/stats")
      .then((res) => {
        if (res?.data?.inquiries?.new !== undefined) {
          setNewInquiriesCount(res.data.inquiries.new);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: "fa-chart-pie", roles: ["ADMIN", "SUPER_ADMIN"] },
    { name: "Orders", path: "/dashboard/orders", icon: "fa-bag-shopping", roles: ["ADMIN", "SUPER_ADMIN"] },
    { name: "Catering Quotes", path: "/dashboard/quotes", icon: "fa-file-invoice-dollar", roles: ["ADMIN", "SUPER_ADMIN"] },
    { name: "Menu Catalog", path: "/dashboard/menu", icon: "fa-burger", roles: ["ADMIN", "SUPER_ADMIN"] },
    { name: "Inquiries", path: "/dashboard/inquiries", icon: "fa-envelope", roles: ["ADMIN", "SUPER_ADMIN"] },
    { name: "Team Management", path: "/dashboard/users", icon: "fa-users", roles: ["SUPER_ADMIN"] },
    { name: "Settings", path: "/dashboard/settings", icon: "fa-gear", roles: ["SUPER_ADMIN"] },
  ];

  // Filter items based on the user's role
  const visibleNavItems = navItems.filter((item) =>
    !userRole || item.roles.includes(userRole)
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Logo & Close Button (Mobile) */}
      <div className="h-16 sm:h-20 flex items-center justify-between px-5 sm:px-6 border-b border-slate-800/50 bg-slate-950/50">
        <Link href="/dashboard" onClick={closeSidebar} className="flex items-center gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#E36727] to-amber-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all">
            <i className="fa-solid fa-utensils text-sm sm:text-base"></i>
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-white text-base sm:text-lg tracking-wide group-hover:text-[#E36727] transition-colors">
              CateringLK
            </h1>
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              Admin Portal
            </p>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={closeSidebar}
          className="lg:hidden w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close navigation sidebar"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 sm:px-4 space-y-1 custom-scrollbar">
        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-2">
          Main Menu
        </div>
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-[#E36727]/10 text-[#E36727] shadow-sm border border-[#E36727]/20 font-bold"
                  : "hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <i
                className={`fa-solid ${item.icon} text-base transition-transform group-hover:scale-110 ${
                  isActive ? "text-[#E36727]" : "text-slate-500"
                }`}
              ></i>
              <span className="truncate">{item.name}</span>
              {item.name === "Inquiries" && newInquiriesCount > 0 ? (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white shadow-sm">
                  {newInquiriesCount}
                </span>
              ) : isActive ? (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E36727] shadow-[0_0_8px_#E36727]"></div>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 sm:p-4 border-t border-slate-800/50 bg-slate-950/30">
        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {userRole === "SUPER_ADMIN" ? "SA" : "AD"}
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="text-xs font-bold text-white truncate">Admin User</div>
            <div className="text-[10px] text-slate-400 truncate">
              {userRole === "SUPER_ADMIN" ? "Super Admin" : "Store Admin"}
            </div>
          </div>
          {/* Theme Quick Toggle */}
          <button
            type="button"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-700 hover:text-amber-400 text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle dark / light theme"
            onClick={toggleTheme}
          >
            <i className={`fa-solid ${theme === "dark" ? "fa-sun text-amber-400" : "fa-moon text-slate-300"} text-xs`}></i>
          </button>
          <button
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Sign Out"
            onClick={() => {
              localStorage.removeItem("admin_token");
              document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/login";
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs sm:text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl z-20 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl border-r border-slate-800 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
