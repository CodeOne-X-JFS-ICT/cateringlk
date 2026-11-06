"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useOrder } from "@/context/OrderContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { toggleCartDrawer, cartTotalCount, openInstantQuoteModal } = useOrder();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    clickCountRef.current += 1;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // 3 rapid clicks will redirect to the secret admin login portal
    if (clickCountRef.current >= 3) {
      e.preventDefault();
      clickCountRef.current = 0;
      router.push("/login");
      return;
    }

    // Reset count if subsequent click doesn't occur within 800ms
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 800);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Takeaway & Delivery", href: "/takeaway&delivery" },
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
            <span className="inline-flex items-center gap-1.5 bg-[#aa8453]/20 text-amber-200 px-2.5 py-0.5 rounded-full text-[12px] leading-[15px] border border-[#aa8453]/40 font-condensed uppercase tracking-[2px]">
              <i className="fa-solid fa-certificate text-[10px] text-[#aa8453]"></i> PHI & ISO Standard
            </span>
            <span className="hidden md:inline text-amber-200/90 text-[13px] font-sans">
              🇱🇰 Catering & Fine Dining by Ahas Gawwa | Colombo & Western Province
            </span>
          </div>

          {/* Right Side: Phone Contact & Theme Switcher Button */}
          <div className="flex items-center gap-4 text-xs">
            <a
              href="tel:+94742013332"
              className="hover:text-white transition-colors flex items-center gap-1.5 font-medium"
            >
              <i className="fa-solid fa-phone text-[#aa8453]"></i>
              <span className="text-[#aa8453] font-normal tracking-[1px]">+94 74 201 3332</span>
            </a>
            <span className="text-amber-700/60">|</span>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 hover:bg-black/30 text-amber-200 border border-amber-400/30 transition-all cursor-pointer shadow-xs active:scale-95 font-condensed text-[12px] uppercase tracking-[2px]"
              aria-label="Toggle Light / Dark Theme"
            >
              {theme === "dark" ? (
                <>
                  <i className="fa-solid fa-sun text-amber-400"></i>
                  <span>LIGHT THEME</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-moon text-amber-300"></i>
                  <span>DARK THEME</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-white/95 dark:bg-[#0f0d0c]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Section (Triple-click opens admin login) */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group select-none cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#aa8453] via-amber-600 to-[#987242] p-1 shadow-lg shadow-[#aa8453]/20 flex flex-col justify-center items-center text-center border border-[#aa8453]/40 group-hover:scale-105 transition-transform duration-300">
              <span className="text-[7px] leading-tight font-serif uppercase tracking-widest text-amber-100 font-normal">
                Catering
              </span>
              <span className="text-[6px] font-sans uppercase tracking-tighter text-amber-200 font-normal">
                by
              </span>
              <span className="text-[7px] leading-tight font-serif uppercase tracking-widest text-white font-normal">
                Ahas Gawwa
              </span>
            </div>
            <div>
              <div className="font-serif font-normal text-xl sm:text-2xl tracking-[1px] text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-[#aa8453] transition-colors">
                AHAS GAWWA
              </div>
              <div className="text-[12px] leading-[15px] uppercase tracking-[5px] text-[#aa8453] font-normal font-condensed -mt-0.5">
                Takeaway & Delivery
              </div>
            </div>
          </Link>

          {/* Desktop Nav Items: Barlow Condensed | 400 | 15px | 24px | 2px–3px */}
          <nav className="hidden md:flex items-center gap-8 text-slate-500 dark:text-slate-300">
            {navLinks.map((link, index) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <React.Fragment key={link.name}>
                  {index === 2 && (
                    <div className="w-2 h-2 rounded-full bg-[#aa8453] hidden lg:block opacity-60"></div>
                  )}
                  <Link
                    href={link.href}
                    className={`transition-colors duration-200 text-[15px] leading-[24px] tracking-[2.5px] font-normal font-condensed uppercase ${isActive
                      ? "text-[#aa8453]"
                      : "text-slate-700 dark:text-slate-300 hover:text-[#aa8453] dark:hover:text-[#aa8453]"
                      }`}
                  >
                    {link.name}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Instant Quote Action CTA & Quick Cart */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCartDrawer}
              type="button"
              className="relative p-2.5 rounded-xl bg-[#aa8453]/10 border border-[#aa8453]/30 text-[#aa8453] hover:bg-[#aa8453] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="View Shopping Cart"
            >
              <i className="fa-solid fa-basket-shopping text-base"></i>
              {cartTotalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#aa8453] text-white text-[10px] font-normal w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0f0d0c] shadow-xs">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* CTA Button: Barlow Condensed | 400 / 500 | 13px–15px | normal | 3px–4px */}
            <button
              type="button"
              onClick={openInstantQuoteModal}
              className="butn-dark hidden sm:block px-5 py-2.5 rounded-xl bg-[#aa8453] hover:bg-[#987242] text-white font-medium text-[14px] leading-normal uppercase tracking-[3px] shadow-md hover:shadow-[#aa8453]/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer font-condensed"
            >
              Instant Quote
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="md:hidden p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10"
            aria-label="Toggle menu"
          >
            <i
              className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"
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
                  className={`block w-full text-left py-2 transition-colors text-[15px] leading-[24px] tracking-[2.5px] font-normal font-condensed uppercase ${isActive
                    ? "text-[#aa8453]"
                    : "text-slate-800 dark:text-slate-200 hover:text-[#aa8453]"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openInstantQuoteModal();
                }}
                className="butn-dark w-full py-3 rounded-xl bg-[#aa8453] hover:bg-[#987242] text-white font-medium text-[14px] leading-normal uppercase tracking-[3px] text-center shadow-md cursor-pointer transition-all font-condensed"
              >
                Instant Quote
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
