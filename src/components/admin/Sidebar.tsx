"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

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
  }, []);

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

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl z-20">
      {/* Brand Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/50 bg-slate-950/50">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E36727] to-amber-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all">
            <i className="fa-solid fa-utensils"></i>
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-white text-lg tracking-wide group-hover:text-[#E36727] transition-colors">
              CateringLK
            </h1>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              Admin Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4 px-2">
          Main Menu
        </div>
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-[#E36727]/10 text-[#E36727] shadow-sm border border-[#E36727]/20"
                  : "hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <i
                className={`fa-solid ${item.icon} text-base transition-transform group-hover:scale-110 ${
                  isActive ? "text-[#E36727]" : "text-slate-500"
                }`}
              ></i>
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E36727] shadow-[0_0_8px_#E36727]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-950/30">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
            {userRole === "SUPER_ADMIN" ? "SA" : "AD"}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-bold text-white truncate">Admin User</div>
            <div className="text-[10px] text-slate-400 truncate">
              {userRole === "SUPER_ADMIN" ? "Super Admin" : "Store Admin"}
            </div>
          </div>
          <button 
            className="w-8 h-8 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Sign Out"
            onClick={() => {
              localStorage.removeItem("admin_token");
              document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/login";
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
