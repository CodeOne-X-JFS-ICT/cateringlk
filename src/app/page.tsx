import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full transition-colors duration-300 font-sans">
      {/* ========================================== */}
      {/* HERO SECTION WITH KEN BURNS BACKGROUND     */}
      {/* ========================================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 sm:py-10 bg-white dark:bg-[#0f0d0c]">
        {/* Animated Hero Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1920&q=80"
            alt="Catering Feast by Ahas Gawwa"
            className="w-full h-full object-cover object-center animate-hero-kenburns opacity-50 dark:opacity-30 filter contrast-105"
          />

          
          {/* Ambient Particle Grid Overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E36727_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-6">
          {/* Sub-headline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E36727]/30 bg-[#E36727]/10 dark:bg-[#E36727]/20 text-[#E36727] text-xs sm:text-sm font-extrabold mb-6 shadow-sm">
            <i className="fa-solid fa-crown text-amber-500"></i> Culinary
            Artistry & Hospitality
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-5xl mx-auto">
            Welcome to{" "}
            <span className="gold-gradient-text">Ahas Gawwa</span> Exceptional
            Dining & Catering
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-800 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Experience authentic Sri Lankan banquets, live cooking action
            stations, and executive dining at our restaurant portal, or create
            custom per-head catering packages for grand events.
          </p>

          {/* 2 Portal Cards Grid */}
          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Portal Card 1: Catering Service */}
            <Link
              href="/catering"
              className="group relative bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/30 rounded-3xl p-6 sm:p-8 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E36727] portal-card-shadow cursor-pointer block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E36727]/15 text-[#E36727] flex items-center justify-center text-2xl group-hover:bg-[#E36727] group-hover:text-white transition-all">
                  <i className="fa-solid fa-utensils"></i>
                </div>
                <span className="text-xs font-bold text-[#E36727] uppercase tracking-wider bg-[#E36727]/10 px-3 py-1 rounded-full border border-[#E36727]/20">
                  Event Catering
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#E36727] transition-colors">
                Catering Service
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Custom banquets, weddings, sacred Dana alms-giving protocols, and
                instant per-head budget calculator.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-extrabold text-[#E36727] uppercase tracking-wider">
                <span>Explore Catering Portal</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1.5 transition-transform"></i>
              </div>
            </Link>

            {/* Portal Card 2: Restaurant Portal */}
            <Link
              href="/restaurant"
              className="group relative bg-[#FFFBF8] dark:bg-[#1a1614] border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500 portal-card-shadow cursor-pointer block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-2xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <i className="fa-solid fa-store"></i>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Fine Dining
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                Restaurant
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Reserve private dining slots, takeaway order options, and express
                delivery within a 6km radius map.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <span>Explore Restaurant Portal</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1.5 transition-transform"></i>
              </div>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300">
            <div className="p-3">
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-[#E36727]">
                12+
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">
                Years Experience
              </div>
            </div>
            <div className="p-3">
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-[#E36727]">
                1,500+
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">
                Events & Feasts
              </div>
            </div>
            <div className="p-3">
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-[#E36727]">
                4.9 ★
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">
                500+ Google Reviews
              </div>
            </div>
            <div className="p-3">
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">
                PHI Hygiene Rated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 2 – OUR STORY                      */}
      {/* ========================================== */}
      <section
        id="our-story"
        className="py-20 bg-[#FBEAD9] dark:bg-[#1a1614] border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image Collage */}
            <div className="lg:col-span-5 relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80"
                  alt="Executive Chef plating food"
                  className="rounded-2xl object-cover w-full h-48 sm:h-56 shadow-md border border-slate-200 dark:border-white/10 translate-y-3"
                />
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80"
                  alt="Restaurant Kitchen Team"
                  className="rounded-2xl object-cover w-full h-48 sm:h-56 shadow-md border border-slate-200 dark:border-white/10 -translate-y-3"
                />
                <img
                  src="https://images.unsplash.com/photo-1483106386347-6d1d6e4e2609?auto=format&fit=crop&w=600&q=80"
                  alt="Buffet banquet setup"
                  className="rounded-2xl object-cover w-full h-48 sm:h-56 shadow-md border border-slate-200 dark:border-white/10 -translate-y-3"
                />
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
                  alt="Waitstaff serving food"
                  className="rounded-2xl object-cover w-full h-48 sm:h-56 shadow-md border border-slate-200 dark:border-white/10 translate-y-3"
                />
              </div>

              {/* Floating Est. Badge */}
              <div className="absolute -bottom-6 -right-2 sm:right-4 bg-white dark:bg-[#0f0d0c] border border-[#E36727]/40 rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E36727]/20 text-[#E36727] flex items-center justify-center text-xl">
                  <i className="fa-solid fa-hat-chef"></i>
                </div>
                <div>
                  <div className="font-serif text-slate-900 dark:text-white font-bold text-sm">
                    Est. 2014
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Master Central Kitchen
                  </div>
                </div>
              </div>
            </div>

            {/* Story Content */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-[#E36727] text-xs uppercase font-extrabold tracking-widest bg-[#E36727]/10 px-3.5 py-1.5 rounded-full border border-[#E36727]/20 inline-block">
                Our Story
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Crafting Authentic Flavors & Unrivaled Hospitality
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                <strong>Ahas Gawwa</strong> began with a passion for bringing
                authentic Sri Lankan spices and refined international culinary
                techniques together. Over 12 years, we have grown from an
                intimate family kitchen to operating Colombo’s premier
                restaurant and central catering facility.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                From daily restaurant dining, takeaway meals, and 6km radius
                delivery to hosting sacred Dana ceremonies and grand wedding
                receptions, every meal is prepared by certified master chefs
                under ISO 22000 hygiene standards.
              </p>

              {/* Certification Badges */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 shadow-xs">
                  <i className="fa-solid fa-certificate text-[#E36727]"></i> PHI
                  Central Kitchen
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 shadow-xs">
                  <i className="fa-solid fa-shield-halved text-[#E36727]"></i> SLSI
                  14001 Compliant
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 shadow-xs">
                  <i className="fa-solid fa-truck-medical text-[#E36727]"></i>{" "}
                  Insulated Delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 3 – ORDERING ADVICE & MATRIX       */}
      {/* ========================================== */}
      <section className="py-20 bg-white dark:bg-[#0f0d0c] border-t border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[#E36727] text-xs uppercase font-extrabold tracking-widest bg-[#E36727]/10 px-3.5 py-1.5 rounded-full border border-[#E36727]/20 inline-block">
              Ordering Advice & Guides
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-3">
              Our Service Matrix
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Select an option below to jump directly to the relevant service
              portal.
            </p>
          </div>

          {/* Service Matrix Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Restaurant Portal Links */}
            <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                  <i className="fa-solid fa-utensils"></i>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                    Restaurant
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Takeaway & 6km Radius Delivery
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/restaurant"
                  className="p-4 rounded-2xl bg-[#FBEAD9]/70 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 hover:border-amber-500 cursor-pointer transition-all flex items-center justify-between group block shadow-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500">
                      Takeaway Orders
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Express pick-up timeslots & available meal boxes
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                </Link>

                <Link
                  href="/restaurant"
                  className="p-4 rounded-2xl bg-[#FBEAD9]/70 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 hover:border-amber-500 cursor-pointer transition-all flex items-center justify-between group block shadow-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500">
                      Delivery Service (6km Radius)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Interactive map, city search & live meal dispatch
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                </Link>
              </div>
            </div>

            {/* Column 2: Catering Service Portal Links */}
            <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#E36727]/20 text-[#E36727] flex items-center justify-center font-bold text-lg">
                  <i className="fa-solid fa-bell-concierge"></i>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                    Catering Service
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Events, Custom Menus & Budget Estimator
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/catering"
                  className="p-4 rounded-2xl bg-[#FBEAD9]/70 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 hover:border-[#E36727] cursor-pointer transition-all flex items-center justify-between group block shadow-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#E36727]">
                      Catering Solutions (Functions List)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Weddings, Sacred Dana, Corporate Galas & Private BBQs
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                </Link>

                <Link
                  href="/catering"
                  className="p-4 rounded-2xl bg-[#FBEAD9]/70 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 hover:border-[#E36727] cursor-pointer transition-all flex items-center justify-between group block shadow-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#E36727]">
                      Planning & Pricing (Cost Estimator)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Interactive Catering Cost Estimator with live LKR quote
                      summary
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 4 – TESTIMONIALS                   */}
      {/* ========================================== */}
      <section className="py-20 bg-[#FBEAD9] dark:bg-[#1a1614] border-t border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#E36727] text-xs uppercase font-extrabold tracking-widest bg-[#E36727]/10 px-3.5 py-1.5 rounded-full border border-[#E36727]/20 inline-block">
              Clients' stories
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-3">
              Client Words & Experience
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white dark:bg-[#26201d] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm relative space-y-4">
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic">
                &ldquo;Ahas Gawwa catered our 250 pax wedding reception in
                Rajagiriya. The black pork curry and live hopper counter were
                incredible! Highly recommend both their catering and
                restaurant.&rdquo;
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  Dr. Asanka Perera
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Wedding Catering • Rajagiriya
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white dark:bg-[#26201d] p-6 rounded-3xl border border-[#E36727]/40 shadow-sm relative space-y-4">
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic">
                &ldquo;Organized a 40 Monk Alms-Giving (Dana) in Nugegoda. Their
                catering team adhered strictly to claypot protocols and morning
                pooja timing. Reverent and flawless service.&rdquo;
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  Mrs. Malini Jayawardena
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Sacred Dana • Nugegoda
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white dark:bg-[#26201d] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm relative space-y-4">
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic">
                &ldquo;We frequently order restaurant delivery within the 6km
                radius and host company AGMs through their catering portal. Food
                is always steaming hot!&rdquo;
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  Dhanushka Silva
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Corporate AGM • Colombo 03
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
