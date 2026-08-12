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
    <header className="sticky top-0 z-50 w-full transition-colors duration-300 font-sans shadow-xl">
      {/* Top Announcement & Quick Contact Header */}
      <div className="w-full bg-[#140e0a] dark:bg-[#0c0907] light:bg-[#f6f2ea] text-stone-300 dark:text-stone-300 light:text-stone-700 text-xs py-2 px-4 sm:px-8 border-b border-[#2d221a] dark:border-[#261b14] light:border-amber-200/60 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left Side: Certification Badge + Fine Dining Tagline */}
          <div className="flex items-center flex-wrap gap-2.5 text-[11px] sm:text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#2a1d0d]/80 dark:bg-[#2a1d0d] light:bg-amber-100 border border-[#b4781c]/60 dark:border-[#b4781c]/60 light:border-amber-400/60 text-[#f59e0b] dark:text-[#fbbf24] light:text-amber-900 font-medium shadow-xs">
              <svg
                className="w-3.5 h-3.5 fill-current text-amber-400 animate-pulse"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l2.4 3.2 3.9-.7-.7 3.9 3.2 2.4-2.4 3.2.7 3.9-3.9-.7-2.4 3.2-2.4-3.2-3.9.7.7-3.9-3.2-2.4 3.2-2.4-.7-3.9 3.9.7L12 2z" />
              </svg>
              <span className="font-semibold tracking-wide">
                PHI & SLSI 14001 Certified
              </span>
            </div>

            <span className="text-amber-500 font-bold hidden xs:inline">LK</span>
            <span className="text-stone-300 dark:text-stone-300 light:text-stone-800 font-medium">
              Catering & Fine Dining by Ahas Gawwa
            </span>
            <span className="text-stone-500 hidden md:inline">|</span>
            <span className="text-stone-400 dark:text-stone-400 light:text-stone-600 hidden md:inline">
              Colombo & Western Province
            </span>
          </div>

          {/* Right Side: Phone Contact & Theme Toggle */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto text-[11px] sm:text-xs">
            <a
              href="tel:+94771234567"
              className="flex items-center gap-1.5 font-medium text-amber-500 hover:text-amber-400 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <span className="tracking-wider text-stone-200 dark:text-stone-200 light:text-stone-800 font-semibold">
                +94 77 123 4567
              </span>
            </a>

            <span className="text-stone-600 dark:text-stone-600 light:text-stone-300">
              |
            </span>

            {/* Theme Toggle Pill Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/60 dark:border-amber-500/60 light:border-amber-600/70 bg-amber-500/10 dark:bg-amber-950/40 light:bg-amber-100 hover:bg-amber-500/20 text-[#f59e0b] dark:text-[#fbbf24] light:text-amber-900 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <>
                  {/* Sun Icon for Light Mode Option */}
                  <svg
                    className="w-3.5 h-3.5 fill-current text-amber-400"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                  </svg>
                  <span>LIGHT THEME</span>
                </>
              ) : (
                <>
                  {/* Moon Icon for Dark Mode Option */}
                  <svg
                    className="w-3.5 h-3.5 fill-current text-amber-700"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.3 2c.43 0 .77.35.75.78-.19 4.09 3.03 7.37 7.13 7.23.43-.01.78.33.78.76 0 5.42-4.41 9.83-9.83 9.83-5.42 0-9.83-4.41-9.83-9.83C1.3 5.35 5.71 1 11.13 1c.39 0 .77.34.77.78-.01.07.4.22.4.22z" />
                  </svg>
                  <span>DARK THEME</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="w-full bg-[#110c09] dark:bg-[#0f0b09] light:bg-[#ffffff] text-stone-100 dark:text-stone-100 light:text-stone-900 border-b border-[#261c15] dark:border-[#211710] light:border-stone-200 transition-colors py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Orange Badge Icon */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 via-amber-600 to-amber-700 shadow-md shadow-orange-950/40 p-1 flex flex-col justify-center items-center text-center border border-amber-400/40 group-hover:scale-105 transition-transform duration-200">
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

            {/* Logo Text Title & Subtitle */}
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-black tracking-wide text-stone-100 dark:text-stone-100 light:text-stone-900 group-hover:text-amber-500 transition-colors">
                AHAS GAWWA
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase">
                Catering & Restaurant
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-sm">
            {navLinks.map((link, index) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <React.Fragment key={link.name}>
                  {index === 2 && (
                    <span className="text-amber-600 dark:text-amber-600 light:text-amber-500 text-xs select-none">
                      •
                    </span>
                  )}
                  <Link
                    href={link.href}
                    className={`relative py-1 transition-colors duration-200 tracking-wide ${
                      isActive
                        ? "text-orange-500 dark:text-orange-400 light:text-orange-600 font-bold"
                        : "text-stone-300 dark:text-stone-300 light:text-stone-700 hover:text-orange-400 dark:hover:text-orange-400 light:hover:text-orange-600"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                    )}
                  </Link>
                </React.Fragment>
              );
            })}
          </div>

          {/* Right Action Button & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* INSTANT QUOTE CTA Button */}
            <Link
              href="/contact"
              className="relative group inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-orange-950/40 hover:shadow-orange-500/20 active:scale-95 transition-all duration-200 border border-amber-300/30"
            >
              <span>INSTANT QUOTE</span>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="md:hidden p-2 rounded-lg bg-stone-800/60 dark:bg-stone-900/80 light:bg-stone-100 text-stone-300 dark:text-stone-300 light:text-stone-700 hover:text-white border border-stone-700/50"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                ) : (
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-stone-800/80 dark:border-stone-800 light:border-stone-200 flex flex-col gap-3 pb-2 animate-in slide-in-from-top duration-200">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-amber-500/10 text-orange-500 border-l-4 border-orange-500"
                      : "text-stone-300 dark:text-stone-300 light:text-stone-700 hover:bg-stone-800/40"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
}
