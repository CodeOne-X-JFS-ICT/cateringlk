"use client";

import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { AdminSidebarProvider } from "@/components/admin/AdminSidebarContext";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSidebarProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0f0d0c] font-sans">
        {/* Responsive Sidebar (Fixed on Desktop, Off-canvas Drawer on Mobile) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />

          {/* Page Content with mobile-first responsive padding */}
          <main className="flex-1 p-3.5 sm:p-5 lg:p-8 overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
