"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Restaurant", href: "/restaurant" },
    { name: "Catering", href: "/catering" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-300 font-sans shadow-md">
      {/* Top Announcement Bar & Quick Contact Header */}
      <div className="w-full bg-gradient-to-r from-amber-950 via-[#C65A20] to-amber-950 dark:from-[#1a1614] dark:via-neutral-950 dark:to-[#1a1614] text-amber-100 text-xs py-2 px-4 border-b border-amber-800/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          {/* Left Side: Certification Badge + Tagline */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border border-amber-500/30">
              <i className="fa-solid fa-certificate text-[10px]"></i> PHI &
              SLSI 14001 Certified
            </span>
            <span className="hidden md:inline text-amber-200/90 text-xs">
              🇱🇰 Catering & Fine Dining by Ahas Gawwa | Colombo & Western
              Province
            </span>
          </div>

          {/* Right Side: Phone Contact & Theme Switcher Button */}
          <div className="flex items-center gap-4 text-xs">
            <a
              href="tel:+94771234567"
              className="hover:text-white transition-colors flex items-center gap-1.5 font-medium"
            >
              <i className="fa-solid fa-phone text-amber-400"></i> +94 77 123
              4567
            </a>
            <span className="text-amber-700/60">|</span>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 hover:bg-black/30 text-amber-200 border border-amber-400/30 transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Toggle Light / Dark Theme"
            >
              {theme === "dark" ? (
                <>
                  <i className="fa-solid fa-sun text-amber-400"></i>
                  <span className="font-semibold text-[11px] uppercase tracking-wider">
                    LIGHT THEME
                  </span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-moon text-amber-300"></i>
                  <span className="font-semibold text-[11px] uppercase tracking-wider">
                    DARK THEME
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-white/95 dark:bg-[#0f0d0c]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E36727] via-amber-600 to-amber-700 p-1 shadow-lg shadow-[#E36727]/20 flex flex-col justify-center items-center text-center border border-amber-400/40 group-hover:scale-105 transition-transform duration-300">
              <span className="text-[7px] leading-tight font-serif uppercase tracking-widest text-amber-100 font-extrabold">
                Catering
              </span>
              <span className="text-[6px] font-sans uppercase tracking-tighter text-amber-200 font-semibold">
                by
              </span>
              <span className="text-[7px] leading-tight font-serif uppercase tracking-widest text-white font-black">
                Ahas Gawwa
              </span>
            </div>
            <div>
              <div className="font-serif text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-[#E36727] transition-colors">
                AHAS GAWWA
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#E36727] font-bold -mt-1">
                Catering & Restaurant
              </div>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {navLinks.map((link, index) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <React.Fragment key={link.name}>
                  {index === 2 && (
                    <div className="w-2 h-2 rounded-full bg-[#E36727] hidden lg:block opacity-60"></div>
                  )}
                  <Link
                    href={link.href}
                    className={`transition-colors duration-200 tracking-wide ${
                      isActive
                        ? "text-[#E36727] font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:text-[#E36727] dark:hover:text-[#E36727]"
                    }`}
                  >
                    {link.name}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Instant Quote Action CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-[#E36727]/30 transition-all transform hover:scale-105 active:scale-95"
            >
              Instant Quote
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="md:hidden p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10"
            aria-label="Toggle menu"
          >
            <i
              className={`fa-solid ${
                mobileMenuOpen ? "fa-xmark" : "fa-bars"
              } text-xl`}
            ></i>
          </button>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFBF8] dark:bg-[#1a1614] border-b border-slate-200 dark:border-white/10 px-6 py-5 space-y-3 shadow-xl">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left font-semibold py-2 transition-colors ${
                    isActive
                      ? "text-[#E36727] font-bold"
                      : "text-slate-800 dark:text-slate-200 hover:text-[#E36727]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#E36727] text-white font-bold text-center text-sm shadow-md"
              >
                Instant Quote
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
