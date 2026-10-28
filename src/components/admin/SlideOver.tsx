"use client";

import React, { useEffect, useRef } from "react";

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlideOver({ isOpen, onClose, title, children }: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full sm:max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-300 z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
          <h2 className="font-serif font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white truncate pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close panel"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
