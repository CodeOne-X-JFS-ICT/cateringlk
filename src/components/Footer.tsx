import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-[#0c0908] light:bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="font-serif text-2xl font-bold text-white mb-2 tracking-wide">
            AHAS GAWWA
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Sri Lanka’s premier destination for fine dining restaurant
            experiences, express 6km radius delivery, and sacred catering
            banquets.
          </p>
        </div>

        <div>
          <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-[#e36727]">
            Restaurant Services
          </div>
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                href="/restaurant"
                className="hover:text-white transition-colors"
              >
                Dining Reservations
              </Link>
            </li>
            <li>
              <Link
                href="/restaurant"
                className="hover:text-white transition-colors"
              >
                Express Takeaway
              </Link>
            </li>
            <li>
              <Link
                href="/restaurant"
                className="hover:text-white transition-colors"
              >
                6km Radius Map Delivery
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-[#e36727]">
            Catering Solutions
          </div>
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                href="/catering"
                className="hover:text-white transition-colors"
              >
                Wedding Receptions
              </Link>
            </li>
            <li>
              <Link
                href="/catering"
                className="hover:text-white transition-colors"
              >
                Sacred Dana Protocols
              </Link>
            </li>
            <li>
              <Link
                href="/catering"
                className="hover:text-white transition-colors"
              >
                Cost Estimator Engine
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-[#e36727]">
            Safety & Standards
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            ISO 22000 Food Safety & Public Health Inspector (PHI) Certified
            Central Facilities.
          </p>
          <div className="flex gap-4 text-[#e36727] text-lg">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="WhatsApp"
            >
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 dark:border-white/10 pt-6 text-center text-slate-500 font-medium">
        © 2026 Catering & Restaurant by Ahas Gawwa. All rights reserved. |
        Colombo Western Province, Sri Lanka.
      </div>
    </footer>
  );
}
