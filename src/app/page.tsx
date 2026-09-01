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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E36727]/30 bg-[#E36727]/10 dark:bg-[#E36727]/20 text-[#E36727] text-xs sm:text-sm font-extrabold mb-6 shadow-sm">
            <i className="fa-solid fa-crown text-amber-500"></i> Sri Lanka’s Premier
            Catering & Dining Hub
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-5xl mx-auto">
            Authentic Culinary Heritage for{" "}
            <span className="gold-gradient-text">Sacred & Grand Occasions</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            From reverent Alms-Giving (Dana) & wedding receptions to fine dining, instant takeaway, and express 6km radius delivery across Colombo.
          </p>

          {/* Interactive Portal Selection Matrix Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            {/* Card 1: Catering Service Portal */}
            <div className="group relative bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-[#E36727]/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md portal-card-shadow hover:border-[#E36727] transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E36727] to-amber-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-utensils"></i>
                </div>
                <div className="inline-block text-[10px] font-extrabold text-[#E36727] uppercase tracking-widest bg-[#E36727]/10 px-2.5 py-0.5 rounded-full">
                  Grand & Sacred Events
                </div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  Catering Service Portal
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Compute itemized quotes, select functions (Dana, Weddings, Corporate), and explore Sri Lankan & international menus.
                </p>
              </div>

              <Link
                href="/catering"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-[#E36727]/30 transition-all flex items-center justify-center gap-2 transform group-hover:translate-x-1"
              >
                <span>Launch Catering Estimator</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </div>

            {/* Card 2: Restaurant Portal */}
            <div className="group relative bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md portal-card-shadow hover:border-[#E36727] transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E36727] to-amber-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-chair"></i>
                </div>
                <div className="inline-block text-[10px] font-extrabold text-[#E36727] uppercase tracking-widest bg-[#E36727]/10 px-2.5 py-0.5 rounded-full">
                  Dining, Takeaway & Delivery
                </div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  Restaurant Portal
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Reserve private dining slots, schedule takeaway meal boxes, or verify your 6km radius for express hot delivery.
                </p>
              </div>

              <Link
                href="/restaurant"
                className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-[#26201d] hover:bg-[#E36727] dark:hover:bg-[#E36727] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 transform group-hover:translate-x-1 border border-slate-700 dark:border-white/10"
              >
                <span>Enter Restaurant Portal</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200 dark:border-white/10">
            <div className="p-3 text-center">
              <div className="font-serif text-3xl font-extrabold text-[#E36727]">
                12+
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold mt-1">
                Years Heritage
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="font-serif text-3xl font-extrabold text-[#E36727]">
                1,500+
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold mt-1">
                Banquets Served
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="font-serif text-3xl font-extrabold text-[#E36727]">
                4.9 ★
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold mt-1">
                500+ Verified Reviews
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="font-serif text-3xl font-extrabold text-emerald-500">
                100%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold mt-1">
                PHI Hygiene Rated
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFFBF8] dark:bg-[#0f0d0c] border border-[#E36727] p-4 rounded-3xl shadow-2xl text-center space-y-1">
                <div className="font-serif font-extrabold text-2xl text-[#E36727]">
                  Est. 2014
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Authentic Taste
                </div>
              </div>
            </div>

            {/* Right Story Text */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1.5 rounded-full border border-[#E36727]/20 inline-block">
                Our Culinary Story
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Crafting Culinary Miracles for Over a Decade
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Founded with a deep reverence for Sri Lankan hospitality and culinary tradition, <strong>Catering by Ahas Gawwa</strong> has grown into Western Province’s most trusted catering partner and dining hub.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold pt-2">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 space-y-1.5 shadow-xs">
                  <div className="text-[#E36727] font-bold flex items-center gap-2">
                    <i className="fa-solid fa-hands-praying"></i> Sacred Alms Giving
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-normal leading-relaxed text-[11px]">
                    Strict vegetarian/mild protocols & pure claypot presentations for Sangha Dana.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 space-y-1.5 shadow-xs">
                  <div className="text-[#E36727] font-bold flex items-center gap-2">
                    <i className="fa-solid fa-shield-heart"></i> PHI & ISO Certified
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-normal leading-relaxed text-[11px]">
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
            <span className="text-[#E36727] text-xs uppercase font-extrabold tracking-widest bg-[#E36727]/10 px-3.5 py-1.5 rounded-full border border-[#E36727]/20 inline-block">
              Choose Your Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              Portals & Culinary Offerings
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Select any portal below to compute itemized quotes or order meals directly online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Matrix Item 1 */}
            <div className="bg-[#FFFBF8] dark:bg-[#1a1614] p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 hover:border-[#E36727] transition-all shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-[#E36727]/10 text-[#E36727] flex items-center justify-center text-xl group-hover:bg-[#E36727] group-hover:text-white transition-all">
                <i className="fa-solid fa-calculator"></i>
              </div>
              <h3 className="font-serif font-bold text-2xl text-slate-900 dark:text-white">
                Interactive Catering Estimator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compute guest counts, choose Silver/Gold/Platinum tiers, add live hopper & BBQ stations for immediate quotes in LKR.
              </p>
              <Link
                href="/catering"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-[#E36727] hover:underline pt-2"
              >
                <span>Calculate Catering Cost</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

            {/* Matrix Item 2 */}
            <div className="bg-[#FFFBF8] dark:bg-[#1a1614] p-8 rounded-3xl border border-[#E36727]/40 space-y-4 portal-card-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-[#E36727] text-white flex items-center justify-center text-xl shadow-md">
                <i className="fa-solid fa-basket-shopping"></i>
              </div>
              <h3 className="font-serif font-bold text-2xl text-slate-900 dark:text-white">
                Browse Restaurant Product Menu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Explore our 5 signature ranges (Fried Rice, Kottu, Noodles, Pizza & Specials) with instant basket ordering.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-[#E36727] hover:underline pt-2"
              >
                <span>Explore Meal Ranges</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

            {/* Matrix Item 3 */}
            <div className="bg-[#FFFBF8] dark:bg-[#1a1614] p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 hover:border-[#E36727] transition-all shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-[#E36727]/10 text-[#E36727] flex items-center justify-center text-xl group-hover:bg-[#E36727] group-hover:text-white transition-all">
                <i className="fa-solid fa-motorcycle"></i>
              </div>
              <h3 className="font-serif font-bold text-2xl text-slate-900 dark:text-white">
                6km Radius Express Delivery
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Verify your suburb address in Handapangoda, Padukka, Ingiriya, or Horana for hot thermal-box delivery.
              </p>
              <Link
                href="/restaurant"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-[#E36727] hover:underline pt-2"
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
              <span className="text-[#E36727] text-xs uppercase font-extrabold tracking-widest bg-[#E36727]/10 px-3.5 py-1.5 rounded-full border border-[#E36727]/20 inline-block">
                Clients&apos; Stories
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-3">
                Client Words & Experience
              </h2>
            </div>

            {/* Slider Navigation Arrows & Counter */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                0{currentSlide + 1} / 0{testimonialsData.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                  className="w-11 h-11 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-300 dark:border-white/10 hover:border-[#E36727] text-slate-800 dark:text-white hover:text-[#E36727] flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95"
                  aria-label="Previous Testimonial"
                >
                  <i className="fa-solid fa-chevron-left text-sm"></i>
                </button>

                <button
                  type="button"
                  onClick={handleNextSlide}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#E36727] to-amber-600 text-white hover:from-amber-500 hover:to-[#E36727] flex items-center justify-center transition-all shadow-md shadow-[#E36727]/25 cursor-pointer active:scale-95"
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
            className="max-w-4xl mx-auto bg-white dark:bg-[#26201d] p-8 sm:p-12 rounded-3xl border border-[#E36727]/30 shadow-2xl portal-card-shadow relative overflow-hidden transition-all duration-300"
          >
            {/* Watermark Quote Icon */}
            <div className="absolute top-6 right-8 text-amber-500/10 dark:text-amber-500/5 text-8xl font-serif select-none pointer-events-none">
              <i className="fa-solid fa-quote-right"></i>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Star Rating & Verified Badge */}
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-1.5 text-amber-500 text-base">
                  {[...Array(activeTestimonial.rating)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star"></i>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <i className="fa-solid fa-circle-check"></i> Verified Google Review
                </span>
              </div>

              {/* Review Text */}
              <blockquote className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed italic font-normal">
                &ldquo;{activeTestimonial.text}&rdquo;
              </blockquote>

              {/* Client Profile Footer */}
              <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E36727] to-amber-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    {activeTestimonial.avatar}
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-base text-slate-900 dark:text-white">
                      {activeTestimonial.name}
                    </h3>
                  </div>
                </div>

                <span className="px-3.5 py-1 rounded-full bg-[#E36727]/10 text-[#E36727] text-xs font-bold border border-[#E36727]/20 hidden sm:inline-block">
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
                className={`transition-all duration-300 cursor-pointer rounded-full ${
                  currentSlide === idx
                    ? "w-8 h-2.5 bg-[#E36727]"
                    : "w-2.5 h-2.5 bg-slate-300 dark:bg-white/20 hover:bg-[#E36727]/50"
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
