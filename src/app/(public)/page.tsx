"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  tag: string;
  text: string;
  avatar: string;
}

const testimonialsData: Testimonial[] = [
  {
    id: 1,
    name: "Heshan Kaluthanthri",
    rating: 5,
    tag: "Delivery & Takeaway",
    text: "I've ordered from Catering by Ahas Gawwa several times through their delivery and pickup service, and my experience has been very positive. The food is consistently fresh, delicious, and well-packaged, arriving in great condition. The portions are generous, and the quality has been consistently good. The ordering and pickup process is smooth, and the staff are friendly and efficient. Overall, I'd rate both the food and service 4.5/5. I would definitely recommend them for anyone looking for quality catering or takeaway meals.",
    avatar: "HK",
  },
  {
    id: 2,
    name: "Yesith Bimsara",
    rating: 5,
    tag: "Catering & Hotel",
    text: "I've ordered from Ahas Gawwa Hotel's catering service several times, and the quality has been consistently excellent. The Chicken Fried Rice, Cheese Kottu, and Seafood Rice are absolutely delicious and full of flavor. Every order has been fresh, well-prepared, and satisfying. A big hats off to the entire team for maintaining such great taste, quality, and service. Keep up the fantastic work—I highly recommend Ahas Gawwa Hotel to anyone looking for delicious food!",
    avatar: "YB",
  },
  {
    id: 3,
    name: "Lahiru Withanage",
    rating: 5,
    tag: "Special Events & Banquets",
    text: "🌟 Unforgettable Taste & Service! Catering by Ahas Gawwa truly lives up to its name — Miracle in the Sky! The food is very very delicious, packed with flavor and freshness. Portion sizes are generous, perfect for sharing or satisfying a big appetite. They offer online payment options, which makes ordering super convenient. The team is extremely kind and professional, making the whole experience smooth and pleasant. You won't find another catering service like this — they deliver quality worth every rupee you spend.",
    avatar: "LW",
  },
  {
    id: 4,
    name: "Sandesh Gunathilaka",
    rating: 5,
    tag: "Regular Dine-in & Takeaway",
    text: "Food ⭐⭐⭐⭐⭐ | Service ⭐⭐⭐⭐⭐ | Prices ⭐⭐⭐⭐⭐ | Location & Dine-in Quality ⭐⭐⭐⭐⭐. I've been visiting since a while now. Foods are served Hot and Neat. Can't say much about dine-in experience since I always order takeaway, but the place is always clean. Staff members are super friendly and always on time. Best place to get something to eat between Ingiriya and Padukka. Highly recommended 🙂.",
    avatar: "SG",
  },
  {
    id: 5,
    name: "Sohan Prabhath Weerasinghe",
    rating: 5,
    tag: "50+ Verified Orders",
    text: "I've ordered from this restaurant more than 50 times over the past few months actually, it might even be more than that. Usually I order once or twice a week, sometimes visiting the place and sometimes getting delivery to my home. Most of the time I order their kottu or rice in different portion sizes. What I really appreciate is the consistency. From the very first time I ordered until now, the food quality has remained the same. The taste, freshness, and portions are always good. Overall, I'm very satisfied and will definitely continue ordering from here.",
    avatar: "SW",
  },
];

export default function Home() {
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonialsData.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? testimonialsData.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonialsData.length);
  };

  const activeTestimonial = testimonialsData[currentSlide];

  return (
    <div className="w-full transition-colors duration-300 font-sans">
      {/* ========================================== */}
      {/* HERO SECTION WITH KEN BURNS BACKGROUND     */}
      {/* ========================================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 sm:py-12 bg-[#b59484]/20 dark:bg-[#0f0d0c]">
        {/* Animated Hero Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1920&q=80"
            alt="Catering Feast by Ahas Gawwa"
            className="w-full h-full object-cover object-center animate-hero-kenburns opacity-40 dark:opacity-30 filter contrast-105"
          />

          {/* Ambient Particle Grid Overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#aa8453_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4">
          {/* Hero Tagline / Subtitle: Barlow Condensed | 400 | 12px | 15px | 6px | uppercase */}
          <div className="hero-tagline inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#aa8453]/30 bg-[#aa8453]/10 text-[#aa8453] text-[12px] leading-[15px] tracking-[6px] font-normal font-condensed uppercase mb-6 shadow-sm">
            <i className="fa-solid fa-crown text-[#aa8453]"></i> Sri Lanka’s Premier Catering & Takeaway Hub
          </div>

          {/* Hero Title (H1): Gilda Display | 400 | 30px–45px | 1.25em | 10px */}
          <h1 className="hero-title font-serif font-normal text-[30px] sm:text-[45px] leading-[1.25em] tracking-[10px] text-slate-900 dark:text-white max-w-5xl mx-auto uppercase">
            Authentic Culinary Heritage for{" "}
            <span className="gold-gradient-text font-semibold dark:font-normal">Sacred & Grand Occasions</span>
          </h1>

          {/* Lead Description: Barlow | 800 | 16px–18px | 1.8em | extrabold */}
          <p className="lead-desc mt-6 text-[16px] sm:text-[18px] leading-[1.8em] text-slate-900 dark:text-slate-300 max-w-3xl mx-auto font-extrabold font-sans">
            FROM REVERENT ALMS-GIVING (DANA) & WEDDING RECEPTIONS TO FINE DINING, INSTANT TAKEAWAY, AND EXPRESS 6KM RADIUS DELIVERY ACROSS COLOMBO.
          </p>

          {/* Interactive Portal Selection Matrix Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            {/* Card 1: Catering Service Portal */}
            <div className="group relative bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-[#aa8453]/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md portal-card-shadow hover:border-[#aa8453] transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#aa8453] to-[#987242] text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-utensils"></i>
                </div>
                {/* Section Tag: Barlow Condensed | 400 | 12px–15px | 15px | 6px–10px | #aa8453 */}
                <div className="section-tag inline-block text-[12px] leading-[15px] font-normal text-[#aa8453] uppercase tracking-[6px] bg-[#aa8453]/10 px-3 py-1 rounded-full font-condensed">
                  Grand & Sacred Events
                </div>
                {/* Card Heading (H2): Gilda Display | 400 | 20px–24px | 1.25em | 1px */}
                <h2 className="font-serif font-normal uppercase text-[28px] sm:text-[32px] leading-[1.25em] tracking-[1px] text-slate-900 dark:text-white whitespace-nowrap">
                  Catering Service
                </h2>
                {/* Body Paragraph: Barlow | 400 | 15px | 1.75em | normal */}
                <p className="body-paragraph text-[15px] leading-[1.75em] text-slate-600 dark:text-slate-300 font-normal font-sans">
                  Compute itemized quotes, select functions (Dana, Weddings, Corporate), and explore Sri Lankan & international menus.
                </p>
              </div>

              {/* CTA Button: Barlow Condensed | 500 | 14px | normal | 3px–4px | uppercase | #aa8453 */}
              <Link
                href="/catering"
                className="butn-dark w-full py-3.5 rounded-2xl bg-[#aa8453] hover:bg-[#987242] text-white font-medium text-[14px] leading-normal uppercase tracking-[3px] shadow-md transition-all flex items-center justify-center gap-2 transform group-hover:translate-x-1 font-condensed"
              >
                <span>Launch Catering Estimator</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </div>

            {/* Card 2: Restaurant Portal */}
            <div className="group relative bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md portal-card-shadow hover:border-[#aa8453] transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#aa8453] to-[#987242] text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-chair"></i>
                </div>
                {/* Section Tag: Barlow Condensed | 400 | 12px–15px | 15px | 6px–10px | #aa8453 */}
                <div className="section-tag inline-block text-[12px] leading-[15px] font-normal text-[#aa8453] uppercase tracking-[6px] bg-[#aa8453]/10 px-3 py-1 rounded-full font-condensed">
                  Takeaway & Delivery
                </div>
                {/* Card Heading (H2): Gilda Display | 400 | 20px–24px | 1.25em | 1px */}
                <h2 className="font-serif font-normal uppercase text-[24px] sm:text-[26px] leading-[1.25em] tracking-[1px] text-slate-900 dark:text-white">
                  Takeaway & Delivery Service
                </h2>
                {/* Body Paragraph: Barlow | 400 | 15px | 1.75em | normal */}
                <p className="body-paragraph text-[15px] leading-[1.75em] text-slate-600 dark:text-slate-300 font-normal font-sans">
                  Reserve takeaway meal boxes, or verify your 6km radius for express hot delivery.
                </p>
              </div>

              {/* CTA Button */}
              <Link
                href="/takeaway&delivery"
                className="butn-dark w-full py-3.5 rounded-2xl bg-[#aa8453] hover:bg-[#987242] text-white font-medium text-[14px] leading-normal uppercase tracking-[3px] shadow-md transition-all flex items-center justify-center gap-2 transform group-hover:translate-x-1 border border-transparent font-condensed"
              >
                <span>Explore Portal</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200 dark:border-white/10">
            <div className="p-3 text-center">
              <div className="featured-numeral font-serif font-normal text-3xl sm:text-4xl text-[#ef8a2e]">
                3+
              </div>
              <div className="section-tag text-[12px] leading-[15px] text-slate-500 dark:text-slate-400 uppercase tracking-[6px] font-normal mt-2 font-condensed">
                Years Heritage
              </div>
            </div>

            <div className="p-3 text-center">
              <div className="featured-numeral font-serif font-normal text-3xl sm:text-4xl text-[#ef8a2e]">
                4.9 ★
              </div>
              <div className="section-tag text-[12px] leading-[15px] text-slate-500 dark:text-slate-400 uppercase tracking-[6px] font-normal mt-2 font-condensed">
                70+ Google reviews
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="featured-numeral font-serif font-normal text-3xl sm:text-4xl text-emerald-500">
                100%
              </div>
              <div className="section-tag text-[12px] leading-[15px] text-slate-500 dark:text-slate-400 uppercase tracking-[6px] font-normal mt-2 font-condensed">
                PHI Hygiene Standard
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 2 – OUR STORY / HERITAGE           */}
      {/* ========================================== */}
      <section className="py-20 bg-[#FFFBF8] dark:bg-[#1a1614] border-t border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Collage Images */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden shadow-lg h-52 border border-slate-200 dark:border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80"
                    alt="Traditional Sri Lankan Feast Setup"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-lg h-40 border border-slate-200 dark:border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
                    alt="Fine Dining Ambiance"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="rounded-3xl overflow-hidden shadow-lg h-40 border border-slate-200 dark:border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"
                    alt="Grand Wedding Banquet"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-lg h-52 border border-slate-200 dark:border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
                    alt="Chefs Cooking Fresh Meals"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFFBF8] dark:bg-[#0f0d0c] border border-[#aa8453] p-4 rounded-3xl shadow-2xl text-center space-y-1">
                <div className="featured-numeral font-serif font-normal text-2xl text-[#aa8453]">
                  Est. 2014
                </div>
                <div className="text-[12px] leading-[15px] uppercase font-normal text-slate-500 dark:text-slate-400 tracking-[6px] font-condensed">
                  Authentic Taste
                </div>
              </div>
            </div>

            {/* Right Story Text */}
            <div className="lg:col-span-6 space-y-6">
              {/* Section Subtitle / Tag: Barlow Condensed | 400 | 12px–15px | 15px | 6px–10px | #aa8453 */}
              <span className="section-subtitle text-[#aa8453] text-[12px] leading-[15px] font-normal uppercase tracking-[6px] bg-[#aa8453]/10 px-3.5 py-1.5 rounded-full border border-[#aa8453]/20 inline-block font-condensed">
                Our Culinary Story
              </span>

              {/* Section Heading (H2): Gilda Display | 400 | 30px–40px | 1.25em | 1px */}
              <h2 className="section-heading font-serif font-normal uppercase text-[30px] sm:text-[40px] leading-[1.25em] tracking-[1px] text-slate-900 dark:text-white">
                Crafting Culinary Miracles for Over a Decade
              </h2>

              {/* Body Paragraph: Barlow | 400 | 15px | 1.75em | normal */}
              <p className="body-paragraph text-[15px] leading-[1.75em] text-slate-600 dark:text-slate-300 font-normal font-sans">
                Founded with a deep reverence for Sri Lankan hospitality and culinary tradition, <strong>Catering by Ahas Gawwa</strong> has grown into Western Province’s most trusted catering partner and dining hub.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold pt-2">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 space-y-1.5 shadow-xs">
                  <div className="text-[#aa8453] font-normal flex items-center gap-2 font-condensed text-[14px] uppercase tracking-[3px]">
                    <i className="fa-solid fa-hands-praying"></i> Sacred Alms Giving
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-normal leading-[1.75em] text-[14px] font-sans">
                    Strict vegetarian/mild protocols & pure claypot presentations for Sangha Dana.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 space-y-1.5 shadow-xs">
                  <div className="text-[#aa8453] font-normal flex items-center gap-2 font-condensed text-[14px] uppercase tracking-[3px]">
                    <i className="fa-solid fa-shield-heart"></i> PHI & ISO Certified
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-normal leading-[1.75em] text-[14px] font-sans">
                    Central kitchens operating under strict public health & safety protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 3 – SERVICE NAVIGATION MATRIX      */}
      {/* ========================================== */}
      <section className="py-20 bg-white dark:bg-[#0f0d0c] border-t border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            {/* Section Subtitle / Tag: Barlow Condensed | 400 | 12px–15px | 15px | 6px–10px | #aa8453 */}
            <span className="section-subtitle text-[#aa8453] text-[12px] leading-[15px] uppercase font-normal tracking-[6px] bg-[#aa8453]/10 px-3.5 py-1.5 rounded-full border border-[#aa8453]/20 inline-block font-condensed">
              Choose Your Journey
            </span>
            {/* Section Heading (H2): Gilda Display | 400 | 30px–40px | 1.25em | 1px */}
            <h2 className="section-heading font-serif font-normal uppercase text-[30px] sm:text-[40px] leading-[1.25em] tracking-[1px] text-slate-900 dark:text-white">
              Portals & Culinary Offerings
            </h2>
            {/* Lead Description */}
            <p className="lead-desc text-slate-600 dark:text-slate-400 text-[16px] leading-[1.8em] font-sans font-normal">
              Select any portal below to compute itemized quotes or order meals directly online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Matrix Item 1 */}
            <div className="bg-[#FFFBF8] dark:bg-[#1a1614] p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 hover:border-[#aa8453] transition-all shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-[#aa8453]/10 text-[#aa8453] flex items-center justify-center text-xl group-hover:bg-[#aa8453] group-hover:text-white transition-all">
                <i className="fa-solid fa-calculator"></i>
              </div>
              {/* Card Heading (H3): Gilda Display | 400 | 18px–30px | 1.3em–1.4em | normal */}
              <h3 className="card-heading font-serif font-normal uppercase text-[22px] sm:text-[26px] leading-[1.35em] text-slate-900 dark:text-white">
                Interactive Catering Estimator
              </h3>
              {/* Body Paragraph */}
              <p className="body-paragraph text-[15px] leading-[1.75em] text-slate-500 dark:text-slate-400 font-sans font-normal">
                Compute guest counts, choose Silver/Gold/Platinum tiers, add live hopper & BBQ stations for immediate quotes in LKR.
              </p>
              <Link
                href="/catering"
                className="inline-flex items-center gap-2 text-[14px] leading-normal font-medium text-[#aa8453] hover:underline pt-2 font-condensed uppercase tracking-[3px]"
              >
                <span>Calculate Catering Cost</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

            {/* Matrix Item 2 */}
            <div className="bg-[#FFFBF8] dark:bg-[#1a1614] p-8 rounded-3xl border border-[#aa8453]/40 space-y-4 portal-card-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-[#aa8453] text-white flex items-center justify-center text-xl shadow-md">
                <i className="fa-solid fa-basket-shopping"></i>
              </div>
              {/* Card Heading (H3): Gilda Display | 400 | 18px–30px */}
              <h3 className="card-heading font-serif font-normal uppercase text-[22px] sm:text-[26px] leading-[1.35em] text-slate-900 dark:text-white">
                Browse Our Meals
              </h3>
              <p className="body-paragraph text-[15px] leading-[1.75em] text-slate-500 dark:text-slate-400 font-sans font-normal">
                Explore our 5 signature ranges (Fried Rice, Kottu, Noodles, Pizza & Specials) with instant basket ordering.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-[14px] leading-normal font-medium text-[#aa8453] hover:underline pt-2 font-condensed uppercase tracking-[3px]"
              >
                <span>Explore Meal Ranges</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

            {/* Matrix Item 3 */}
            <div className="bg-[#FFFBF8] dark:bg-[#1a1614] p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 hover:border-[#aa8453] transition-all shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-[#aa8453]/10 text-[#aa8453] flex items-center justify-center text-xl group-hover:bg-[#aa8453] group-hover:text-white transition-all">
                <i className="fa-solid fa-motorcycle"></i>
              </div>
              {/* Card Heading (H3): Gilda Display | 400 | 18px–30px */}
              <h3 className="card-heading font-serif font-normal uppercase text-[22px] sm:text-[26px] leading-[1.35em] text-slate-900 dark:text-white">
                6km Radius Express Delivery
              </h3>
              <p className="body-paragraph text-[15px] leading-[1.75em] text-slate-500 dark:text-slate-400 font-sans font-normal">
                Verify your suburb address in Handapangoda, Padukka, Ingiriya, or Horana for hot thermal-box delivery.
              </p>
              <Link
                href="/takeaway&delivery"
                className="inline-flex items-center gap-2 text-[14px] leading-normal font-medium text-[#aa8453] hover:underline pt-2 font-condensed uppercase tracking-[3px]"
              >
                <span>Check Delivery Radius</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 4 – INTERACTIVE TESTIMONIALS SLIDER */}
      {/* ========================================== */}
      <section className="py-20 bg-[#FBEAD9] dark:bg-[#1a1614] border-t border-slate-200 dark:border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header & Carousel Navigation Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
            <div>
              {/* Section Subtitle / Tag: Barlow Condensed | 400 | 12px–15px | 15px | 6px–10px | #aa8453 */}
              <span className="section-subtitle text-[#aa8453] text-[12px] leading-[15px] uppercase font-normal tracking-[6px] bg-[#aa8453]/10 px-3.5 py-1.5 rounded-full border border-[#aa8453]/20 inline-block font-condensed">
                Customers&apos; Feedbacks
              </span>
              {/* Section Heading (H2): Gilda Display | 400 | 30px–40px | 1.25em | 1px */}
              <h2 className="section-heading font-serif font-normal uppercase text-[30px] sm:text-[40px] leading-[1.25em] tracking-[1px] text-slate-900 dark:text-white mt-3">
                Customers Words & Experience...
              </h2>
            </div>

            {/* Slider Navigation Arrows & Counter */}
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-mono font-normal text-slate-500 dark:text-slate-400">
                0{currentSlide + 1} / 0{testimonialsData.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                  className="w-11 h-11 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-300 dark:border-white/10 hover:border-[#aa8453] text-slate-800 dark:text-white hover:text-[#aa8453] flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95"
                  aria-label="Previous Testimonial"
                >
                  <i className="fa-solid fa-chevron-left text-sm"></i>
                </button>

                <button
                  type="button"
                  onClick={handleNextSlide}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                  className="w-11 h-11 rounded-2xl bg-[#aa8453] hover:bg-[#987242] text-white flex items-center justify-center transition-all shadow-md shadow-[#aa8453]/25 cursor-pointer active:scale-95"
                  aria-label="Next Testimonial"
                >
                  <i className="fa-solid fa-chevron-right text-sm"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Testimonial Carousel Card */}
          <div
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="max-w-4xl mx-auto bg-white dark:bg-[#26201d] p-8 sm:p-12 rounded-3xl border border-[#aa8453]/30 shadow-2xl portal-card-shadow relative overflow-hidden transition-all duration-300"
          >
            {/* Watermark Quote Icon */}
            <div className="absolute top-6 right-8 text-[#aa8453]/15 dark:text-[#aa8453]/10 text-8xl font-serif select-none pointer-events-none">
              <i className="fa-solid fa-quote-right"></i>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Star Rating & Verified Badge */}
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-1.5 text-[#aa8453] text-base">
                  {[...Array(activeTestimonial.rating)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star"></i>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1.5 text-[12px] leading-[15px] font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-condensed uppercase tracking-[2px]">
                  <i className="fa-solid fa-circle-check"></i> Verified Google Review
                </span>
              </div>

              {/* Review Text: Body Paragraph | Barlow | 400 | 15px | 1.75em */}
              <blockquote className="body-paragraph text-slate-700 dark:text-slate-200 text-[15px] sm:text-[16px] leading-[1.75em] italic font-normal font-sans">
                &ldquo;{activeTestimonial.text}&rdquo;
              </blockquote>

              {/* Client Profile Footer */}
              <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#aa8453] to-[#987242] text-white font-normal text-[14px] flex items-center justify-center shadow-md font-condensed">
                    {activeTestimonial.avatar}
                  </div>
                  <div>
                    {/* Card Heading (H3): Gilda Display | 400 | 18px–30px */}
                    <h3 className="card-heading font-serif font-normal text-[18px] sm:text-[20px] text-slate-900 dark:text-white">
                      {activeTestimonial.name}
                    </h3>
                  </div>
                </div>

                {/* Tag: Barlow Condensed | 400 | 12px–15px | 15px | 6px–10px | #aa8453 */}
                <span className="section-tag px-3.5 py-1 rounded-full bg-[#aa8453]/10 text-[#aa8453] text-[12px] leading-[15px] font-normal border border-[#aa8453]/20 hidden sm:inline-block font-condensed uppercase tracking-[3px]">
                  {activeTestimonial.tag}
                </span>
              </div>
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex justify-center items-center gap-2.5 mt-8">
            {testimonialsData.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 cursor-pointer rounded-full ${currentSlide === idx
                  ? "w-8 h-2.5 bg-[#aa8453]"
                  : "w-2.5 h-2.5 bg-slate-300 dark:bg-white/20 hover:bg-[#aa8453]/50"
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
