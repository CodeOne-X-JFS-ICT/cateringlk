"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({
  showLabel = false,
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-16 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={
          isDark
            ? "Dark mode active. Click to switch to light mode."
            : "Light mode active. Click to switch to dark mode."
        }
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        onClick={toggleTheme}
        className="relative w-16 h-8 p-1 rounded-full bg-slate-200/90 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#E36727]/60 dark:hover:border-[#E36727]/60 transition-colors duration-300 cursor-pointer shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E36727]/40 group flex items-center justify-between"
      >
        {/* Sun Icon Track Indicator */}
        <span
          className={`w-6 h-6 flex items-center justify-center text-amber-500 transition-opacity duration-200 ${
            isDark ? "opacity-40 group-hover:opacity-75" : "opacity-0"
          }`}
        >
          <i className="fa-solid fa-sun text-xs"></i>
        </span>

        {/* Moon Icon Track Indicator */}
        <span
          className={`w-6 h-6 flex items-center justify-center text-indigo-400 dark:text-amber-200 transition-opacity duration-200 ${
            isDark ? "opacity-0" : "opacity-40 group-hover:opacity-75"
          }`}
        >
          <i className="fa-solid fa-moon text-xs"></i>
        </span>

        {/* Sliding Thumb */}
        <span
          className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ease-out transform shadow-md group-hover:scale-105 ${
            isDark
              ? "translate-x-8 bg-slate-900 border border-slate-700 text-amber-300 shadow-slate-950/50"
              : "translate-x-0 bg-white border border-slate-200 text-amber-500 shadow-slate-400/30"
          }`}
        >
          <i
            className={`fa-solid ${
              isDark ? "fa-moon text-[11px]" : "fa-sun text-xs"
            } transition-transform duration-300 ${
              isDark ? "-rotate-12" : "rotate-0"
            }`}
          ></i>
        </span>
      </button>

      {showLabel && (
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 select-none">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </div>
  );
}
