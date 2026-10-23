"use client";

import React, { useState } from "react";

export default function ContactPage() {
  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("CATERING");
  const [targetDate, setTargetDate] = useState("");
  const [suburb, setSuburb] = useState("");
  const [pax, setPax] = useState(100);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    ref_code: string;
    message: string;
    customer_name: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Status Lookup State
  const [trackRef, setTrackRef] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedInquiry, setTrackedInquiry] = useState<any | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Distance Checker Tool State
  const [distanceInput, setDistanceInput] = useState("");
  const [distanceResult, setDistanceResult] = useState<React.ReactNode | null>(
    null
  );

  // Modal State
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");

  const showNotice = (title: string, desc: string) => {
    setNoticeTitle(title);
    setNoticeDesc(desc);
    setIsNoticeOpen(true);
  };

  // Suburb Distance Calculation Simulator
  const handleDistanceCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const val = distanceInput.trim().toLowerCase();

    if (!val) {
      setDistanceResult(
        <span className="text-amber-500">
          Please type a suburb name e.g., Nugegoda.
        </span>
      );
      return;
    }

    const closeSuburbs = [
      "rajagiriya",
      "nawala",
      "nugegoda",
      "kotte",
      "battaramulla",
      "colombo 08",
      "colombo 05",
    ];
    const mediumSuburbs = [
      "dehiwala",
      "mount lavinia",
      "maharagama",
      "malabe",
      "colombo 03",
      "colombo 07",
      "borella",
      "wattala",
    ];

    if (closeSuburbs.some((s) => val.includes(s) || s.includes(val))) {
      setDistanceResult(
        <span className="text-emerald-500 font-semibold flex items-center gap-1">
          <i className="fa-solid fa-circle-check"></i> Approx 2 - 5 KM from
          kitchen (Free delivery available for qualifying orders).
        </span>
      );
    } else if (mediumSuburbs.some((s) => val.includes(s) || s.includes(val))) {
      setDistanceResult(
        <span className="text-amber-500 font-semibold flex items-center gap-1">
          <i className="fa-solid fa-truck"></i> Approx 6 - 12 KM from kitchen
          (Standard delivery active).
        </span>
      );
    } else {
      setDistanceResult(
        <span className="text-[#E36727] font-semibold flex items-center gap-1">
          <i className="fa-solid fa-map-pin"></i> Direct insulated hot delivery
          available across Western Province for{" "}
          <strong className="uppercase">{val}</strong>.
        </span>
      );
    }
  };

  // Form Submit Handler (Real API)
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError("Please provide your name.");
      return;
    }
    if (!phone.trim()) {
      setSubmitError("Please provide a valid phone or WhatsApp number.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("http://localhost:5050/api/public/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim() || undefined,
          category,
          target_date: targetDate || undefined,
          suburb: suburb.trim() || undefined,
          pax_count: pax ? Number(pax) : undefined,
          message: message.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to submit inquiry. Please try again.");
      }

      setSubmitSuccess({
        ref_code: json.data?.ref_code || "AG-INQ-SUCCESS",
        message: json.message || "Thank you! Your inquiry has been received.",
        customer_name: name.trim(),
      });

      // Reset form fields
      setName("");
      setPhone("");
      setEmail("");
      setTargetDate("");
      setSuburb("");
      setMessage("");
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while sending your inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  // Inquiry Status Tracking Handler
  const handleTrackInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = trackRef.trim().toUpperCase();
    if (!cleanRef) return;

    setTrackingLoading(true);
    setTrackError(null);
    setTrackedInquiry(null);

    try {
      const res = await fetch(`http://localhost:5050/api/public/inquiries/track/${encodeURIComponent(cleanRef)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || `No inquiry found with code ${cleanRef}.`);
      }
      setTrackedInquiry(json.data);
    } catch (err: any) {
      setTrackError(err.message || "Unable to find inquiry reference.");
    } finally {
      setTrackingLoading(false);
    }
  };

  // WhatsApp Direct inquiry trigger
  const sendWhatsAppDirectInquiry = () => {
    const text = `Hi Ahas Gawwa, I'd like to make an inquiry:\n- Name: ${name || "Customer"}\n- Category: ${category}\n- Target Date: ${targetDate || "Flexible"}\n- Guest Count: ${pax} Pax\n- Note: ${message || "General inquiry"}`;
    window.open(
      `https://wa.me/94742013332?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="w-full transition-colors duration-300 font-sans bg-white dark:bg-[#0f0d0c] text-slate-800 dark:text-slate-100">
      {/* SECTION 1: HERO SECTION & DIRECT CONTACT DETAILS */}
      <section
        id="contact-hero"
        className="relative min-h-[75vh] flex items-center justify-center overflow-hidden py-16 sm:py-10"
      >
        {/* Animated Hero Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1920&q=80"
            alt="Ahas Gawwa Kitchen & Dining Background"
            className="w-full h-full object-cover object-center animate-hero-kenburns opacity-50 dark:opacity-30 filter contrast-105"
          />
          {/* Ambient Accent Overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E36727_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-2">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs sm:text-sm font-extrabold mb-6 shadow-sm">
            <i className="fa-solid fa-headset"></i> We&apos;re Here to Assist You 24/7
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-4xl mx-auto">
            Get in Touch with <span className="gold-gradient-text">Ahas Gawwa</span>
          </h1>

          <p className="mt-4 text-base sm:text-xl text-slate-900 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Have a question regarding restaurant reservations, takeaway orders, or custom catering packages for your special event? Connect with our master culinary team directly.
          </p>

          {/* Section 1 Primary Contact Cards: Address, Email, Phone */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            {/* 1. Address Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-amber-500/40 dark:border-amber-500/40 backdrop-blur-md portal-card-shadow space-y-3 hover:border-[#E36727] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E36727] to-amber-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Our Physical Location
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                Central Kitchen & Restaurant
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                No. 226, Arakawila
                <br />
                Handapangoda
              </p>
              <a
                href="#find-us"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E36727] hover:underline pt-2"
              >
                <span>View on Google Map</span>
                <i className="fa-solid fa-arrow-down text-[10px]"></i>
              </a>
            </div>

            {/* 2. Email Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-amber-500/40 dark:border-amber-500/40 backdrop-blur-md portal-card-shadow space-y-3 hover:border-[#E36727] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E36727] to-amber-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Direct E-mail Correspondence
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                Email Addresses
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                <p className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-info text-[#E36727] text-[11px]"></i>
                  <a
                    href="mailto:info@catering.lk"
                    className="hover:text-[#E36727] font-semibold"
                  >
                    info@catering.lk
                  </a>
                </p>
              </div>
              <a
                href="mailto:catering@ahasgawwa.lk"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E36727] hover:underline pt-2"
              >
                <span>Send Email Message</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </a>
            </div>

            {/* 3. Phone Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-amber-500/40 dark:border-amber-500/40 backdrop-blur-md portal-card-shadow space-y-3 hover:border-[#E36727] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E36727] to-amber-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-phone"></i>
              </div>
              <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Direct Phone Lines
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                Call Hotlines
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                <p className="flex items-center gap-2">
                  <i className="fa-solid fa-mobile-screen text-emerald-500 text-[11px]"></i>
                  <a
                    href="tel:+94742013332"
                    className="hover:text-[#E36727] font-bold text-slate-900 dark:text-white"
                  >
                    +94 74 201 3332
                  </a>{" "}
                  (Mobile / WhatsApp)
                </p>
                <p className="flex items-center gap-2">
                  <i className="fa-solid fa-phone-flip text-[#E36727] text-[11px]"></i>
                  <a
                    href="tel:+94112175275"
                    className="hover:text-[#E36727] font-bold text-slate-900 dark:text-white"
                  >
                    +94 11 217 5275
                  </a>{" "}
                  (Office Landline)
                </p>
              </div>
              <a
                href="https://wa.me/94742013332"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
              >
                <span>Open WhatsApp Chat</span>
                <i className="fa-brands fa-whatsapp text-sm"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FIND US (GOOGLE MAP & LOCATION DIRECTIONS) */}
      <section
        id="find-us"
        className="py-16 sm:py-24 bg-white dark:bg-[#0f0d0c] border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
              Find Us
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              Locate Our Kitchen & Restaurant
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Conveniently situated along Nawala Road connecting Rajagiriya, Nugegoda, Kotte, and central Colombo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Location Info Panel (Left) */}
            <div className="lg:col-span-4 bg-[#FBEAD9] dark:bg-[#1a1614] border border-amber-200 dark:border-amber-200/40 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-lg">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                  <i className="fa-solid fa-clock"></i> Open 7 Days a Week
                </div>

                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  Operating Hours
                </h3>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between pb-2 border-b border-amber-200 dark:border-white/10">
                    <span className="font-semibold">Monday - Sunday:</span>
                    <span className="font-bold text-[#E36727]">
                      7:00 AM – 10:30 PM
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-amber-200 dark:border-white/10">
                    <span className="font-semibold">Breakfast Hours:</span>
                    <span>7:00 AM – 10:30 AM</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-amber-200 dark:border-white/10">
                    <span className="font-semibold">Lunch Buffet:</span>
                    <span>12:00 PM – 3:30 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Dinner Dining:</span>
                    <span>6:30 PM – 10:30 PM</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-square-parking text-[#E36727]"></i>{" "}
                    Visitor Parking Facilities
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                    Dedicated secure parking space available for up to 25 cars and catering delivery dispatch vehicles.
                  </p>
                </div>
              </div>

              {/* Distance Checker Tool */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Check Distance from Your Suburb
                </label>
                <form onSubmit={handleDistanceCheck} className="flex gap-2">
                  <input
                    type="text"
                    value={distanceInput}
                    onChange={(e) => setDistanceInput(e.target.value)}
                    placeholder="e.g. Nugegoda, Colombo 03, Battaramulla"
                    className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E36727] text-white font-bold text-xs rounded-xl hover:bg-amber-600 transition-all cursor-pointer shrink-0"
                  >
                    Check
                  </button>
                </form>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 min-h-[18px]">
                  {distanceResult}
                </div>
              </div>
            </div>

            {/* Google Map Container (Right) */}
            <div className="lg:col-span-8 bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-3xl p-3 shadow-xl flex flex-col">
              <div className="relative w-full h-96 sm:h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                {/* Embedded Google Map */}
                <iframe
                  title="Ahas Gawwa Location Map"
                  className="w-full h-full filter contrast-105"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63384.46628298207!2d80.14106971664121!3d6.826972822009899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3b3003f850aef%3A0x1a81112e03fc4530!2sCATERING%20by%20AHAS%20GAWWA!5e0!3m2!1sen!2slk!4v1786599526916!5m2!1sen!2slk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                ></iframe>

                {/* Floating Map Badge Overlay */}
                <div className="absolute bottom-4 left-4 bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-amber-500/40 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl max-w-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Ahas Gawwa Central Hub
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    No. 142, Nawala Road, Rajagiriya
                  </p>
                  <a
                    href="https://maps.google.com/?q=CATERING+by+AHAS+GAWWA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E36727] hover:underline pt-1"
                  >
                    <span>Get GPS Directions</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                  </a>
                </div>
              </div>

              {/* Map Quick Links Bar */}
              <div className="p-3 sm:p-4 flex flex-wrap justify-between items-center gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <i className="fa-solid fa-truck-fast text-[#E36727]"></i>
                  <span>
                    6km Free Delivery Radius for Restaurant Orders &gt; LKR 3,000
                  </span>
                </div>
                <a
                  href="https://maps.google.com/?q=CATERING+by+AHAS+GAWWA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 hover:border-[#E36727] font-bold text-slate-900 dark:text-white transition-all flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-map-location-dot text-[#E36727]"></i>{" "}
                  Open in Google Maps App
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SEND DIRECT INQUIRIES FORM */}
      <section
        id="inquiries"
        className="py-16 sm:py-24 bg-[#FBEAD9] dark:bg-[#1a1614] border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
              Direct Inquiries
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              Send Direct Message & Inquiry
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Fill in the details below and our customer coordinator will call or WhatsApp you within 2 hours.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white dark:bg-[#26201d] border border-amber-400 dark:border-amber-200/40 rounded-3xl p-6 sm:p-10 shadow-3xl portal-card-shadow">
            {submitSuccess ? (
              <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-inner">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 text-[#E36727] text-xs font-mono font-bold tracking-widest border border-[#E36727]/30">
                    REFERENCE: {submitSuccess.ref_code}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    Inquiry Received!
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                    Thank you <strong className="text-slate-900 dark:text-white">{submitSuccess.customer_name}</strong>! Your inquiry has been routed to our event coordinators. We will contact you within 2 hours.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <a
                    href={`https://wa.me/94742013332?text=${encodeURIComponent(`Hi Ahas Gawwa, I have submitted inquiry ${submitSuccess.ref_code} regarding catering/dining. Looking forward to discussing details.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-brands fa-whatsapp text-base"></i> Chat on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(null)}
                    className="py-3.5 px-6 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-5 text-xs sm:text-sm">
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation flex-shrink-0"></i>
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <i className="fa-solid fa-user absolute left-3.5 top-3.5 text-slate-400"></i>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ruwan Wickramasinghe"
                        className="w-full bg-slate-100 dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Phone / WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <i className="fa-solid fa-phone absolute left-3.5 top-3.5 text-slate-400"></i>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 077 123 4567"
                        className="w-full bg-slate-100 dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      E-mail Address
                    </label>
                    <div className="relative">
                      <i className="fa-solid fa-envelope absolute left-3.5 top-3.5 text-slate-400"></i>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ruwan@example.lk"
                        className="w-full bg-slate-100 dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Inquiry Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <i className="fa-solid fa-layer-group absolute left-3.5 top-3.5 text-slate-400 z-10"></i>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium cursor-pointer"
                      >
                        <option value="CATERING" className="bg-white dark:bg-[#1a1614] text-slate-900 dark:text-white">
                          Catering Service Quote (Wedding, Dana, Corporate)
                        </option>
                        <option value="RESTAURANT" className="bg-white dark:bg-[#1a1614] text-slate-900 dark:text-white">
                          Restaurant Dining Table Reservation
                        </option>
                        <option value="TAKEAWAY" className="bg-white dark:bg-[#1a1614] text-slate-900 dark:text-white">
                          Takeaway / Express Meal Order
                        </option>
                        <option value="DELIVERY" className="bg-white dark:bg-[#1a1614] text-slate-900 dark:text-white">
                          Direct Food Delivery Inquiry
                        </option>
                        <option value="GENERAL" className="bg-white dark:bg-[#1a1614] text-slate-900 dark:text-white">
                          General Inquiry / Feedback
                        </option>
                        <option value="OTHER" className="bg-white dark:bg-[#1a1614] text-slate-900 dark:text-white">
                          Other Special Event Requests
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date, Suburb & Pax */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Location / Suburb
                    </label>
                    <input
                      type="text"
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      placeholder="e.g. Rajagiriya"
                      className="w-full bg-slate-100 dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Guest Count (Pax)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="2000"
                      value={pax}
                      onChange={(e) => setPax(parseInt(e.target.value) || 10)}
                      className="w-full bg-slate-100 dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Message / Special Dietary & Event Requirements
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify any dietary restrictions (Pure Vegetarian, Halal, No Garlic/Onion for Dana), live station preferences, or special seating requests..."
                    className="w-full bg-slate-100 dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium leading-relaxed"
                  ></textarea>
                </div>

                {/* Form Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white font-extrabold uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting Inquiry...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane"></i> Submit Direct Inquiry
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={sendWhatsAppDirectInquiry}
                    className="w-full sm:w-1/3 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i> WhatsApp Us
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  * We respect your privacy. Your contact info will only be used to answer your event quote inquiry.
                </p>
              </form>
            )}
          </div>

          {/* Inquiry Status Quick Tracker */}
          <div className="max-w-xl mx-auto bg-white/70 dark:bg-[#26201d]/60 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-[#E36727]"></i>
              Already Submitted? Check Inquiry Status
            </h4>
            <form onSubmit={handleTrackInquiry} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Reference (e.g. AG-INQ-104921)"
                value={trackRef}
                onChange={(e) => setTrackRef(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium focus:outline-none focus:border-[#E36727]"
              />
              <button
                type="submit"
                disabled={trackingLoading || !trackRef.trim()}
                className="px-5 py-2.5 bg-[#E36727] hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                {trackingLoading ? "Checking..." : "Track"}
              </button>
            </form>

            {trackError && (
              <p className="text-xs text-red-500 mt-3 font-medium flex items-center gap-1.5">
                <i className="fa-solid fa-circle-exclamation"></i> {trackError}
              </p>
            )}

            {trackedInquiry && (
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                    {trackedInquiry.ref_code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    trackedInquiry.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : trackedInquiry.status === "IN_PROGRESS"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  }`}>
                    {trackedInquiry.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Customer: <strong>{trackedInquiry.customer_name}</strong> · Category: <strong>{trackedInquiry.category}</strong>
                </p>
                {trackedInquiry.target_date && (
                  <p className="text-xs text-slate-500">
                    Target Date: {trackedInquiry.target_date} {trackedInquiry.suburb ? `(${trackedInquiry.suburb})` : ""}
                  </p>
                )}
                <p className="text-[10px] text-slate-400">
                  Received on {new Date(trackedInquiry.created_at).toLocaleDateString("en-LK")}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NOTIFICATION MODAL */}
      {isNoticeOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-paper-plane"></i>
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              {noticeTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {noticeDesc}
            </p>
            <button
              onClick={() => setIsNoticeOpen(false)}
              className="w-full py-2.5 bg-[#E36727] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-amber-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
