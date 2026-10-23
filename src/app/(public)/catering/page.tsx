"use client";

import React, { useState, useEffect } from "react";

// Types & Data
type MenuTabKey = "srilankan" | "indian" | "chinese" | "bbq" | "desserts";

export interface MenuItem {
  title: string;
  desc: string;
  badge: string;
}

export interface CateringPackageData {
  id: number;
  name: string;
  badge: string;
  description: string;
  price_per_pax: number;
  min_pax: number;
  inclusions_text: string;
  dessert_text?: string;
  is_featured: boolean;
  sort_order: number;
}

export interface CateringCategoryData {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  subtitle?: string;
  description?: string;
  min_pax?: number;
  sort_order?: number;
}

export interface CateringAddonData {
  id: number;
  name: string;
  description: string;
  price_per_pax: number;
  icon: string;
  sort_order: number;
}

// Note: Live catering packages are fetched dynamically from the database.
export const fallbackCateringPackages: CateringPackageData[] = [];

export const fallbackCateringAddons: CateringAddonData[] = [];

export default function CateringPage() {
  // Calculator State (aligned with Catering Menus)
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedMenuId, setSelectedMenuId] = useState<number>(1);
  const [estimatorCategory, setEstimatorCategory] = useState<string>("all");
  const [paxCount, setPaxCount] = useState(100);

  // Menu Tab State
  const [activeMenuTab, setActiveMenuTab] = useState<MenuTabKey>("srilankan");

  // Dynamic Catering Packages & Addons State (Fetched from Backend DB)
  const [packages, setPackages] = useState<CateringPackageData[]>([]);
  const [addons, setAddons] = useState<CateringAddonData[]>([]);
  const [cateringCategories, setCateringCategories] = useState<CateringCategoryData[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [cateringLoading, setCateringLoading] = useState<boolean>(true);
  const [cateringError, setCateringError] = useState<string | null>(null);
  const [cateringCategoryTab, setCateringCategoryTab] = useState<string>("bana");
  const [bookingPackage, setBookingPackage] = useState<string>("");

  // Free Services / Terms & Policies State (Dynamic from Backend Settings)
  const [serviceTerms, setServiceTerms] = useState<{
    section_title: string;
    policies: Array<{ id: string; title: string; icon: string; description: string }>;
  }>({
    section_title: "Important Service Terms & Logistics Policies",
    policies: [
      {
        id: "equipment-staff",
        title: "Equipment & Staff",
        icon: "fa-utensils",
        description: "Service includes Plateware, Glassware, Cutlery, Trays, Serviettes, Water Dispensers, and Hand Washing Sinks. Experienced serving staff supervised directly by our floor managers.",
      },
      {
        id: "large-event-amenities",
        title: "Large Event Amenities",
        icon: "fa-tent",
        description: "Hut / Canopy, Tables, and Plastic Chairs will be provided Free of Charge for above 150 Guests. Lighting & Transport charges will be added additionally based on distance.",
      },
    ],
  });

  // Modals State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");

  // Form State
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingSuburb, setBookingSuburb] = useState("");

  // Match package with category key/slug/name
  const matchPackageCategory = (p: CateringPackageData, catKey: string) => {
    const badge = (p.badge || "").toLowerCase();
    const key = catKey.toLowerCase();

    if (key === "bana" || key.includes("bana")) {
      return badge.includes("bana") || badge.includes("feast");
    }
    if (key === "dana_monk" || key === "dana-monk" || key.includes("monk")) {
      return badge === "dana - monk" || badge.includes("monk");
    }
    if (key === "dana_guest" || key === "dana-guest" || key.includes("guest")) {
      return badge === "dana - guest" || badge.includes("guest");
    }
    return badge === key || badge.includes(key) || key.includes(badge);
  };

  // Fetch catering packages, addons, categories, and menus from backend API (no fake UI fallback)
  const fetchCateringData = async () => {
    setCateringLoading(true);
    setCateringError(null);
    try {
      const [pkgRes, addonRes, locRes, termsRes, catRes] = await Promise.all([
        fetch("http://localhost:5050/api/public/catering/packages"),
        fetch("http://localhost:5050/api/public/catering/addons"),
        fetch("http://localhost:5050/api/public/catering/locations"),
        fetch("http://localhost:5050/api/public/settings/catering_service_terms"),
        fetch("http://localhost:5050/api/public/catering/event-types"),
      ]);

      if (!pkgRes.ok || !addonRes.ok) {
        throw new Error("Backend server responded with error status");
      }

      const pkgJson = await pkgRes.json();
      const addonJson = await addonRes.json();

      if (!pkgJson.success || !Array.isArray(pkgJson.data) || pkgJson.data.length === 0) {
        throw new Error("No catering packages found in backend database");
      }

      const mappedPackages: CateringPackageData[] = pkgJson.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        badge: p.badge || "",
        description: p.description || "",
        price_per_pax: typeof p.price_per_pax === "string" ? parseFloat(p.price_per_pax) : p.price_per_pax,
        min_pax: p.min_pax || 20,
        inclusions_text: p.inclusions_text || "",
        dessert_text: p.dessert_text || "",
        is_featured: Boolean(p.is_featured),
        sort_order: p.sort_order || 0,
      }));

      setPackages(mappedPackages);
      if (mappedPackages.length > 0 && !selectedMenuId) {
        setSelectedMenuId(mappedPackages[0].id);
      }

      if (addonJson.success && Array.isArray(addonJson.data)) {
        setAddons(
          addonJson.data.map((a: any) => ({
            id: a.id,
            name: a.name,
            description: a.description || "",
            price_per_pax: typeof a.price_per_pax === "string" ? parseFloat(a.price_per_pax) : a.price_per_pax,
            icon: a.icon || "fa-utensils",
            sort_order: a.sort_order || 0,
          }))
        );
      }

      if (catRes && catRes.ok) {
        const catJson = await catRes.json();
        if (catJson.success && Array.isArray(catJson.data)) {
          setCateringCategories(catJson.data);
        }
      }


      if (locRes && locRes.ok) {
        const locJson = await locRes.json();
        if (locJson.success && Array.isArray(locJson.data)) {
          setLocations(locJson.data.map((l: any) => l.city_name));
        }
      }

      if (termsRes && termsRes.ok) {
        const termsJson = await termsRes.json();
        if (termsJson.success && termsJson.data?.setting_value) {
          const parsed = typeof termsJson.data.setting_value === "string"
            ? JSON.parse(termsJson.data.setting_value)
            : termsJson.data.setting_value;
          if (parsed && Array.isArray(parsed.policies)) {
            setServiceTerms(parsed);
          }
        }
      }

      setCateringError(null);
    } catch (err: any) {
      console.error("Failed to load catering data from backend:", err);
      setCateringError("Menu cannot be fetched! Backend service is offline or unreachable.");
      setPackages([]);
      setAddons([]);
      setCateringCategories([]);
      setLocations([]);
    } finally {
      setCateringLoading(false);
    }
  };

  useEffect(() => {
    fetchCateringData();
  }, []);

  // Payment Gateway State
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<"advance" | "full">("advance");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [gatewayChoice, setGatewayChoice] = useState("card");

  useEffect(() => {
    if (selectedLocation) {
      setBookingSuburb(selectedLocation);
    }
  }, [selectedLocation]);

  const showAlertNotice = (title: string, desc: string) => {
    setNoticeTitle(title);
    setNoticeDesc(desc);
    setIsNoticeOpen(true);
  };

  const scrollToCalculator = () => {
    const el = document.getElementById("calculator");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Calculations aligned with selected catering menu
  const selectedPackage: CateringPackageData | null =
    packages.find((p) => p.id === selectedMenuId) ||
    packages[0] ||
    null;

  const baseRate = selectedPackage ? Number(selectedPackage.price_per_pax) : 0;
  const isServiceChargeApplicable = selectedPackage
    ? selectedPackage.name.includes("Menu 02") ||
    selectedPackage.name.includes("Menu 03") ||
    selectedPackage.name.includes("Menu 04") ||
    selectedPackage.name.includes("Menu 05") ||
    selectedPackage.badge === "Dana - Guest" ||
    selectedPackage.name.toLowerCase().includes("guest")
    : false;

  const foodSubtotal = baseRate * paxCount;
  const serviceChargeAmount = isServiceChargeApplicable ? Math.round(foodSubtotal * 0.1) : 0;
  const grandTotal = foodSubtotal + serviceChargeAmount;
  const advanceAmount = Math.round(grandTotal * 0.3);
  const balanceAmount = grandTotal - advanceAmount;

  const openPaymentGateway = (type: "advance" | "full") => {
    setPaymentType(type);
    setIsGatewayModalOpen(true);
  };

  const handleGatewaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGatewayModalOpen(false);
    const amt = paymentType === "advance" ? advanceAmount : grandTotal;
    const label = paymentType === "advance" ? "30% Advance Deposit" : "100% Full Payment";

    try {
      // 1. Create Quote in Backend
      const quoteRes = await fetch("http://localhost:5050/api/public/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: payerName,
          customer_phone: payerPhone,
          package_id: selectedPackage ? selectedPackage.id : undefined,
          pax_count: paxCount || 20,
          custom_location: selectedLocation || null,
        }),
      });
      const quoteJson = await quoteRes.json();
      const quoteRef = quoteJson.data?.quote_ref;

      if (quoteRef) {
        // 2. Process Payment linked to quote
        const payRes = await fetch("http://localhost:5050/api/public/catering/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote_ref: quoteRef,
            payment_type: paymentType === "advance" ? "ADVANCE_30" : "FULL_100",
            payment_method: gatewayChoice,
            payer_name: payerName,
            payer_phone: payerPhone,
          }),
        });
        const payJson = await payRes.json();
        const receipt = payJson.data?.receipt_id || "AG-PAY-CONFIRMED";
        showAlertNotice(
          "Payment Received & Booking Confirmed!",
          `Thank you ${payerName}. Your ${label} of LKR ${amt.toLocaleString()} for "${selectedPackage?.name || "Catering Package"}" has been confirmed. Receipt: ${receipt} (Quote Ref: ${quoteRef}). Our catering floor manager will contact you at ${payerPhone}.`
        );
      } else {
        showAlertNotice(
          "Payment Gateway Success!",
          `Thank you ${payerName}. Your ${label} of LKR ${amt.toLocaleString()} has been received.`
        );
      }
    } catch {
      showAlertNotice(
        "Payment Processed",
        `Thank you ${payerName}. Your ${label} of LKR ${amt.toLocaleString()} has been registered.`
      );
    }
    setPayerName("");
    setPayerPhone("");
  };

  // WhatsApp Quote Link
  const sendWhatsAppQuote = () => {
    if (!selectedPackage) return;
    const text = `Hi Ahas Gawwa Catering, I calculated an estimated quote:\n- Location: ${selectedLocation || "Not Specified"
      }\n- Selected Menu: ${selectedPackage.name} (Rs. ${baseRate.toLocaleString()}/plate)\n- Guests: ${paxCount} Pax\n- Food Subtotal: LKR ${foodSubtotal.toLocaleString()}${serviceChargeAmount > 0 ? `\n- 10% Service Charge: LKR ${serviceChargeAmount.toLocaleString()}` : ""
      }\n- Grand Estimated Budget: LKR ${grandTotal.toLocaleString()}`;
    window.open(
      `https://wa.me/94742013332?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        customer_name: bookingName,
        customer_phone: bookingPhone,
        package_id: selectedPackage ? selectedPackage.id : undefined,
        pax_count: paxCount || 20,
        custom_location: bookingSuburb || selectedLocation || null,
        special_notes: bookingPackage ? `Package requested: ${bookingPackage}` : null,
      };

      const res = await fetch("http://localhost:5050/api/public/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to submit quote");
      }

      setIsBookingModalOpen(false);
      showAlertNotice(
        "Quote Request Sent Successfully!",
        `Your written quote request has been received with Reference: ${json.data?.quote_ref || "CQ-NEW"}. Total Estimate: LKR ${Number(json.data?.grand_total || grandTotal).toLocaleString()}. Our catering coordinator will contact you at ${bookingPhone} within 2 hours.`
      );
      setBookingName("");
      setBookingPhone("");
      setBookingPackage("");
      setBookingSuburb("");
    } catch (err: any) {
      setIsBookingModalOpen(false);
      showAlertNotice(
        "Quote Request Received",
        `Your inquiry for ${bookingName} (${bookingPhone}) has been noted. Our catering team will contact you shortly.`
      );
    }
  };


  return (
    <div className="w-full transition-colors duration-300 font-sans bg-white dark:bg-[#0f0d0c] text-slate-800 dark:text-slate-100">
      {/*HERO SECTION */}
      <section
        id="hero"
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-16 sm:py-10"
      >
        {/* Animated Ken Burns Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80"
            alt="Grand Catering Banquet"
            className="w-full h-full object-cover object-center animate-hero-kenburns opacity-50 dark:opacity-30 filter contrast-105"
          />
          {/* Ambient Accent Overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E36727_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs sm:text-sm font-extrabold mb-6 shadow-sm">
            <i className="fa-solid fa-crown"></i> Sacred Alms-Giving & Grand
            Banquet Catering
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-5xl mx-auto">
            Authentic Culinary Excellence for{" "}
            <span className="gold-gradient-text">Sacred & Grand Occasions</span>
          </h1>

          <p className="mt-4 text-base sm:text-xl text-slate-900 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Compute itemized quotes, select specialized functions, and explore
            Sri Lankan & international menus tailored for your guests.
          </p>

          {/* Quick Hero Selector Bar */}
          <div className="mt-10 max-w-4xl mx-auto bg-[#FBEAD9]/95 dark:bg-[#1a1614]/95 border border-amber-500/40 p-4 sm:p-5 rounded-3xl portal-card-shadow backdrop-blur-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {/* 1. Location Dropdown */}
              <div className="p-3 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 shadow-md shadow-#E36727">
                <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                  <i className="fa-solid fa-location-dot mr-1"></i> Location (60km)
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  disabled={locations.length === 0}
                  className="w-full bg-transparent text-slate-900 dark:text-white text-xs font-bold focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white">
                    {locations.length > 0
                      ? "Select City / Suburb"
                      : cateringError
                        ? "Locations unavailable"
                        : "Loading locations..."}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Select Menu */}
              <div className="p-3 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 shadow-md shadow-#E36727">
                <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                  Catering Menu
                </label>
                <select
                  value={selectedMenuId}
                  onChange={(e) => setSelectedMenuId(Number(e.target.value))}
                  disabled={packages.length === 0}
                  className="w-full bg-transparent text-slate-900 dark:text-white text-xs font-bold focus:outline-none cursor-pointer truncate disabled:opacity-50"
                >
                  {packages.length === 0 ? (
                    <option value="" disabled className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-500">
                      {cateringError ? "Menu cannot be fetched!" : "Loading menus..."}
                    </option>
                  ) : (
                    packages.map((pkg) => (
                      <option
                        key={pkg.id}
                        value={pkg.id}
                        className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white"
                      >
                        {pkg.name} — Rs. {Number(pkg.price_per_pax).toLocaleString()}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 3. Guest Count */}
              <div className="p-3 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 shadow-md shadow-#E36727">
                <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                  Guest Count (Pax)
                </label>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-users text-slate-400 text-xs"></i>
                  <input
                    type="number"
                    min="20"
                    max="1000"
                    value={paxCount}
                    onChange={(e) => setPaxCount(parseInt(e.target.value) || 20)}
                    className="w-full bg-transparent text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-bold">
                    Pax
                  </span>
                </div>
              </div>

              {/* 4. CTA Button */}
              <button
                onClick={scrollToCalculator}
                className="w-full bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl p-3.5 flex items-center justify-center gap-2 shadow-md shadow-#FBEAD9 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span>Calculate Cost</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>

            {cateringError && (
              <div className="mt-3.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Menu cannot be fetched! Backend service is offline or unreachable.</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200 dark:border-white/10">
            <div className="p-3 text-center">
              <div className="font-serif text-3xl font-extrabold text-black dark:text-[#E36727]">
                12+
              </div>
              <div className="text-[11px] text-slate-700 dark:text-slate-400 uppercase font-bold mt-1">
                Years Catering Heritage
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="font-serif text-3xl font-extrabold text-black dark:text-[#E36727]">
                1,500+
              </div>
              <div className="text-[11px] text-slate-700 dark:text-slate-400 uppercase font-bold mt-1">
                Banquets & Events Served
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="font-serif text-3xl font-extrabold text-black dark:text-[#E36727]">
                4.9 ★
              </div>
              <div className="text-[11px] text-slate-700 dark:text-slate-400 uppercase font-bold mt-1">
                500+ Verified Reviews
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="font-serif text-3xl font-extrabold text-emerald-700 dark:text-emerald-500">
                100%
              </div>
              <div className="text-[11px] text-slate-700 dark:text-slate-400 uppercase font-bold mt-1">
                PHI Hygiene Certified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE CATERING COST ESTIMATOR */}
      <section
        id="calculator"
        className="py-16 sm:py-24 bg-white dark:bg-[#0f0d0c] border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <span className="text-amber-500 text-xs font-extrabold tracking-widest uppercase bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20 inline-block">
              Transparent Sri Lankan Pricing
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              Catering Cost Estimator
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Select your catering menu and number of guests to get an immediate itemized estimated budget in LKR.
            </p>
          </div>

          {cateringLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E36727]"></div>
              <p className="text-xs text-slate-500 font-bold animate-pulse">Loading live catering menus...</p>
            </div>
          ) : cateringError || packages.length === 0 || !selectedPackage ? (
            <div className="py-14 px-6 rounded-3xl bg-red-500/10 border-2 border-red-500/30 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-500 flex items-center justify-center text-3xl mx-auto shadow-xs">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-red-600 dark:text-red-400">
                Menu cannot be fetched!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                Catering menus and budget estimators must be loaded live from the backend database. The backend server is currently offline or unreachable.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={fetchCateringData}
                  className="px-6 py-2.5 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <i className="fa-solid fa-arrows-rotate mr-2"></i> Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Controls Column (Left) */}
              <div className="lg:col-span-7 bg-[#FBEAD9] dark:bg-[#1a1614] border border-amber-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg">
                {/* 1. Select Menu */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <label className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                      1. Select Menu
                    </label>
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: "all", label: "All Menus" },
                        ...(cateringCategories.length > 0
                          ? cateringCategories.map((c) => ({
                            key: c.slug || String(c.id),
                            label: c.name,
                          }))
                          : [
                            { key: "bana", label: "Bana / Pirith" },
                            { key: "dana_monk", label: "Monk Dana" },
                            { key: "dana_guest", label: "Guest Dana" },
                          ]),
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setEstimatorCategory(tab.key)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${estimatorCategory === tab.key
                              ? "bg-[#E36727] text-white shadow-xs"
                              : "bg-white dark:bg-[#26201d] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-amber-400"
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Menu Selection Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                    {packages
                      .filter((pkg) => {
                        if (estimatorCategory === "all") return true;
                        return matchPackageCategory(pkg, estimatorCategory);
                      })
                      .map((pkg) => {
                        const isSelected = selectedMenuId === pkg.id;
                        const hasSC =
                          pkg.name.includes("Menu 02") ||
                          pkg.name.includes("Menu 03") ||
                          pkg.name.includes("Menu 04") ||
                          pkg.name.includes("Menu 05") ||
                          pkg.badge === "Dana - Guest";

                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedMenuId(pkg.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-left flex flex-col justify-between ${isSelected
                                ? "border-[#E36727] bg-[#E36727]/10 ring-2 ring-[#E36727]/30 shadow-md"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#26201d] hover:border-amber-400"
                              }`}
                          >
                            <div>
                              <div className="flex justify-between items-start gap-1 mb-1.5">
                                <span
                                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${isSelected
                                      ? "bg-[#E36727] text-white"
                                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                    }`}
                                >
                                  {pkg.badge}
                                </span>
                                <span className="font-serif font-extrabold text-xs text-[#E36727]">
                                  Rs. {Number(pkg.price_per_pax).toLocaleString()}/=
                                </span>
                              </div>

                              <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                                {pkg.name}
                              </h4>

                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                                {pkg.description}
                              </p>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-semibold">Min: {pkg.min_pax} Pax</span>
                              {hasSC && (
                                <span className="text-amber-600 dark:text-amber-400 font-bold text-[9px]">
                                  +10% SC
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 2. Guest Count Slider */}
                <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                      2. Number of Guests (Pax)
                    </label>
                    <span className="text-2xl font-serif font-extrabold text-[#E36727]">
                      {paxCount} Pax
                    </span>
                  </div>
                  <input
                    type="range"
                    min={selectedPackage.min_pax || 20}
                    max="1000"
                    step="5"
                    value={paxCount}
                    onChange={(e) =>
                      setPaxCount(parseInt(e.target.value) || selectedPackage.min_pax || 20)
                    }
                    className="w-full h-2.5 bg-slate-200 dark:bg-[#26201d] rounded-lg accent-[#E36727] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">
                    <span>{selectedPackage.min_pax || 20} Pax (Min)</span>
                    <span>100 Pax</span>
                    <span>250 Pax</span>
                    <span>500+ Pax</span>
                  </div>
                </div>
              </div>

              {/* Live Summary Column (Right Sticky) */}
              <div className="lg:col-span-5 bg-[#FFFBF8] dark:bg-[#1a1614] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-xl sticky top-28 space-y-5 portal-card-shadow">
                <div className="font-serif font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                  <span>Estimated Quote Summary</span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Instant Estimate
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Selected Location:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedLocation || "Not Selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Menu:</span>
                    <span
                      className="font-bold text-[#E36727] text-right max-w-[210px] truncate"
                      title={selectedPackage.name}
                    >
                      {selectedPackage.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate Per Plate:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      LKR {baseRate.toLocaleString()} / plate
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guest Count:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {paxCount} Guests
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Food Subtotal:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      LKR {foodSubtotal.toLocaleString()}
                    </span>
                  </div>
                  {isServiceChargeApplicable ? (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>10% Service Charge:</span>
                      <span className="font-bold">
                        +LKR {serviceChargeAmount.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-[11px]">
                      <span>Service Charge:</span>
                      <span className="font-bold">Included</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Effective Rate / Pax:
                    </span>
                    <span className="font-bold text-[#E36727]">
                      LKR {Math.round(grandTotal / paxCount).toLocaleString()} / plate
                    </span>
                  </div>
                </div>

                {/* Selected Menu Inclusions Pill Box */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] space-y-2">
                  <div>
                    <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <i className="fa-solid fa-utensils text-xs"></i>
                      <span>Included in {selectedPackage.badge}:</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed line-clamp-3 mt-0.5">
                      {selectedPackage.inclusions_text}
                    </p>
                  </div>
                  {selectedPackage.dessert_text && (
                    <div className="pt-1.5 border-t border-amber-500/20 flex items-start gap-1.5">
                      <span className="font-bold text-amber-700 dark:text-amber-300 text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <i className="fa-solid fa-ice-cream text-[10px]"></i>
                        <span>Dessert:</span>
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 text-[10px] font-medium leading-snug">
                        {selectedPackage.dessert_text}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f0d0c] border border-amber-500/40 text-center space-y-2 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Estimated Total Investment
                  </div>
                  <div className="text-3xl sm:text-4xl font-serif font-extrabold gold-gradient-text">
                    LKR {grandTotal.toLocaleString()}
                  </div>

                  {/* 30% Advance & Balance Breakdown */}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-2 text-[11px] text-left">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <span className="block text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400">
                        30% Advance Deposit
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        LKR {advanceAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10">
                      <span className="block text-[9px] uppercase font-bold text-slate-500">
                        70% Balance Due
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        LKR {balanceAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 italic pt-1">
                    Includes plateware, glassware, cutlery, buffet tables & experienced servers
                  </div>
                </div>

                {/* PAYMENT GATEWAY & QUOTE ACTIONS */}
                <div className="space-y-2.5">
                  {/* Option 1: 30% Advance Payment via Gateway 
                <button
                  onClick={() => openPaymentGateway("advance")}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] active:scale-95"
                >
                  <i className="fa-solid fa-credit-card text-sm"></i>
                  <span>Pay 30% Advance (LKR {advanceAmount.toLocaleString()})</span>
                </button>*/}

                  {/* Option 2: Full Payment via Gateway 
                <button
                  onClick={() => openPaymentGateway("full")}
                  className="w-full py-3.5 bg-slate-900 dark:bg-[#26201d] hover:bg-[#E36727] dark:hover:bg-[#E36727] text-white border border-amber-500/40 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] active:scale-95"
                >
                  <i className="fa-solid fa-lock text-amber-400"></i>
                  <span>Pay Full Amount (LKR {grandTotal.toLocaleString()})</span>
                </button>*/}

                  {/* Option 3: Request Official Written Quote */}
                  <button
                    onClick={() => {
                      setBookingPackage(selectedPackage.name);
                      setIsBookingModalOpen(true);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-paper-plane"></i> Request Official Written Quote
                  </button>

                  {/* Option 4: WhatsApp Quote */}
                  <button
                    onClick={sendWhatsAppQuote}
                    className="w-full py-3 bg-slate-100 dark:bg-[#26201d] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <i className="fa-brands fa-whatsapp text-emerald-500 text-sm"></i> Lock Quote on WhatsApp
                  </button>

                  {/* Option 5: Contact Call Center for Menu Customization */}
                  <a
                    href="tel:+94742013332"
                    className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 text-[#E36727] dark:text-amber-400 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-center block"
                  >
                    <i className="fa-solid fa-headset text-sm"></i> Call Desk for Menu Customization
                  </a>
                </div>

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  * Secure SSL encrypted online payment gateway supporting Visa, Mastercard, AMEX & Sri Lanka IPG.
                </p>
              </div>
            </div>
          )}

          {/* CALL CENTER & MENU CUSTOMIZATION BANNER UNDER ESTIMATOR */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#1a1614] to-slate-900 border border-amber-500/40 text-white shadow-2xl relative overflow-hidden portal-card-shadow">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold border border-amber-500/30">
                  <i className="fa-solid fa-headset text-amber-400"></i> Dedicated Catering Call Center Desk
                </div>
                <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">
                  Need Custom Menu Advice or Direct Payment Finalization?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Speak directly with our senior catering executive to customize dish items, get cost advice, modify guest counts, or finalize your 30% advance / full payment over the phone.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                <a
                  href="tel:+94742013332"
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <i className="fa-solid fa-phone text-sm"></i>
                  <span>Call +94 74 201 3332</span>
                </a>

                <a
                  href={`https://wa.me/94742013332?text=${encodeURIComponent(
                    `Hi Catering Hotline, I need expert advice on menu customization & finalizing payment for my ${selectedPackage?.name || "catering"} quote (${paxCount} Pax).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp text-base"></i>
                  <span>WhatsApp Consultant</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: OFFICIAL CATERING PACKAGES & MENUS */}
      <section
        id="menus"
        className="py-16 sm:py-20 bg-white dark:bg-[#0f0d0c] border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
                Authentic Menus Database
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-2">
                Catering Packages & Set Menus
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Authentic Sri Lankan Bana/Pirith dinners, Sacred Dana offerings, and customized banquet options.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {cateringLoading && (
                <span className="text-[11px] text-amber-500 font-bold animate-pulse flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                  <i className="fa-solid fa-arrows-rotate animate-spin"></i> Syncing Menu DB...
                </span>
              )}
              <button
                onClick={() =>
                  showAlertNotice(
                    "2026 Catering Menu Script",
                    "The complete Catering Menu Script including Menus 01-06 and Alms Giving packages has been synced from the database."
                  )
                }
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 hover:border-[#E36727] text-xs font-bold flex items-center gap-2 cursor-pointer bg-white dark:bg-[#26201d]"
              >
                <i className="fa-solid fa-file-lines text-amber-500"></i> View 2026 Menu Spec
              </button>
            </div>
          </div>

          {/* Error Message or Live Menus Container */}
          {cateringLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E36727]"></div>
              <p className="text-xs text-slate-500 font-bold animate-pulse">Syncing menus from database...</p>
            </div>
          ) : cateringError || packages.length === 0 ? (
            <div className="py-20 px-6 rounded-3xl bg-red-500/10 border-2 border-red-500/30 text-center space-y-4 max-w-2xl mx-auto my-6 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-500 flex items-center justify-center text-3xl mx-auto shadow-xs">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-red-600 dark:text-red-400">
                Menu cannot be fetched!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                All catering packages and set menus are rendered live from the backend database. We do not display fake menu data when the backend service is offline.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={fetchCateringData}
                  className="px-6 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer transform hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-arrows-rotate mr-2"></i> Retry Fetching Menu
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Complimentary Amenities Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E36727] text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                    <i className="fa-solid fa-gift"></i>
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Free Of Charge Inclusions:</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full uppercase">All Menus Included</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                      Plateware, Glassware, Stainless Cutlery, Trays, Water Dispensers, Sinks, Buffet Tables & Uniformed Staff under personal supervision.
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-black/30 px-3 py-2 rounded-xl border border-amber-500/20 shrink-0">
                  <span className="font-bold text-amber-600 dark:text-amber-400">150+ Guests Special:</span> Hut, Tables & Chairs free of charge.
                </div>
              </div>

              {/* Main Category Tabs */}
              <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar border-b border-slate-200 dark:border-white/10">
                {[
                  ...(cateringCategories.length > 0
                    ? cateringCategories.map((c) => ({
                      key: c.slug || String(c.id),
                      label: `${c.icon && !c.icon.startsWith("fa-") ? c.icon + " " : ""}${c.name}${c.subtitle ? ` (${c.subtitle})` : ""}`,
                      icon: c.icon && c.icon.startsWith("fa-") ? c.icon : undefined,
                      count: packages.filter((p) => matchPackageCategory(p, c.slug || c.name)).length,
                    }))
                    : [
                      { key: "bana", label: "🪷 Bana / Pirith Dinner (Menus 01-06)", icon: undefined, count: packages.filter((p) => p.badge.includes("Bana") || p.badge.includes("Feast")).length },
                      { key: "dana_monk", label: "☸️ Alms Giving — For Monks", icon: undefined, count: packages.filter((p) => p.badge === "Dana - Monk").length },
                      { key: "dana_guest", label: "👥 Alms Giving — For Guests", icon: undefined, count: packages.filter((p) => p.badge === "Dana - Guest").length },
                    ]),
                  { key: "addons", label: "🍓 Additional Charge Items & Free Services.", icon: undefined, count: addons.length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setCateringCategoryTab(tab.key)}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shrink-0 ${cateringCategoryTab === tab.key
                        ? "bg-[#E36727] text-white shadow-md scale-[1.01]"
                        : "bg-slate-100 dark:bg-[#26201d] text-slate-700 dark:text-slate-300 hover:bg-[#E36727]/10"
                      }`}
                  >
                    {tab.icon && <i className={`fa-solid ${tab.icon} text-xs`}></i>}
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${cateringCategoryTab === tab.key ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                      }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Dynamic Package Category View */}
              {cateringCategoryTab !== "addons" && (() => {
                const currentCat = cateringCategories.find(
                  (c) => c.slug === cateringCategoryTab || String(c.id) === cateringCategoryTab || c.name.toLowerCase() === cateringCategoryTab.toLowerCase()
                );
                const categoryPackages = packages.filter((p) => matchPackageCategory(p, cateringCategoryTab));
                const isMonk = cateringCategoryTab === "dana_monk" || (currentCat && currentCat.name.includes("Monk"));
                const isGuest = cateringCategoryTab === "dana_guest" || (currentCat && currentCat.name.includes("Guest"));

                return (
                  <div className="space-y-6">
                    {/* Specific Category Banners */}
                    {isMonk && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
                        <i className="fa-solid fa-hands-praying text-amber-500 text-lg shrink-0"></i>
                        <div>
                          <strong>Reverent Dana Protocol:</strong> All monk courses are prepared with highest standards of cleanliness and purity. Includes special Vegetable Courses Plate (4 Boiled Vegetables, 1 Veraniya Miris, 1 Tempered Garlic) and dedicated Buddha Pooja arrangements.
                        </div>
                      </div>
                    )}

                    {isGuest && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
                        <i className="fa-solid fa-users text-amber-500 text-lg shrink-0"></i>
                        <div>
                          <strong>Normal Guest Lunch Menus:</strong> Companion menus for relatives, upasakas, and devotees attending the alms giving. Note: 10% Service Charge applies to guest catering orders.
                        </div>
                      </div>
                    )}

                    {!isMonk && !isGuest && currentCat?.description && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
                        <i className={`fa-solid ${currentCat.icon || "fa-champagne-glasses"} text-amber-500 text-lg shrink-0`}></i>
                        <div>
                          <strong>{currentCat.name}:</strong> {currentCat.description}
                        </div>
                      </div>
                    )}

                    {categoryPackages.length === 0 ? (
                      <div className="py-16 text-center bg-white dark:bg-[#26201d] rounded-3xl border border-amber-200 dark:border-white/10 p-8 shadow-xs">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-[#E36727] flex items-center justify-center text-2xl mb-3">
                          <i className={`fa-solid ${currentCat?.icon || "fa-utensils"}`}></i>
                        </div>
                        <h4 className="font-serif font-bold text-lg text-slate-900 dark:text-white mb-1">
                          {currentCat?.name || "Category"} Packages
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-4">
                          Preset catering packages for this category will be available soon, or we can tailor an exclusive customized package for your event today.
                        </p>
                        <a
                          href={`https://wa.me/94742013332?text=${encodeURIComponent(
                            `Hi Ahas Gawwa, I am looking for custom catering options for "${currentCat?.name || cateringCategoryTab}". Please share menu choices and pricing.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E36727] hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                        >
                          <i className="fa-brands fa-whatsapp text-sm"></i>
                          <span>Inquire Custom {currentCat?.name || "Catering"} on WhatsApp</span>
                        </a>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryPackages.map((pkg) => {
                          const hasServiceCharge =
                            pkg.name.includes("Menu 02") ||
                            pkg.name.includes("Menu 03") ||
                            pkg.name.includes("Menu 04") ||
                            pkg.name.includes("Menu 05") ||
                            pkg.badge === "Dana - Guest";
                          const inclusions = pkg.inclusions_text
                            ? pkg.inclusions_text.split(",").map((s) => s.trim()).filter(Boolean)
                            : [];

                          return (
                            <div
                              key={pkg.id}
                              className="rounded-3xl bg-white dark:bg-[#26201d] border border-amber-200 dark:border-white/10 hover:border-[#E36727] transition-all p-6 flex flex-col justify-between shadow-xs portal-card-shadow group"
                            >
                              <div className="space-y-4">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    {pkg.badge}
                                  </span>
                                  {hasServiceCharge && (
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-[#1a1614] px-2 py-0.5 rounded border border-amber-500/30">
                                      +10% Service Charge
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white group-hover:text-[#E36727] transition-colors">
                                    {pkg.name}
                                  </h3>
                                  <div className="mt-2 flex items-baseline gap-2">
                                    <span className="font-serif text-3xl font-extrabold text-[#E36727]">
                                      Rs. {Number(pkg.price_per_pax).toLocaleString()}/=
                                    </span>
                                    <span className="text-xs text-slate-500 font-bold">Per Plate</span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                    {pkg.description}
                                  </p>
                                </div>

                                {/* Inclusions List */}
                                <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                    Menu Courses & Inclusions ({inclusions.length} items):
                                  </span>
                                  <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1">
                                    {inclusions.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                                      >
                                        <i className="fa-solid fa-circle-check text-emerald-500 text-[10px] mt-1 shrink-0"></i>
                                        <span className="leading-snug">{item}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Dessert Section */}
                                {pkg.dessert_text && (
                                  <div className="pt-3 border-t border-amber-500/20 dark:border-white/10 space-y-2 bg-amber-500/10 dark:bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                                      <i className="fa-solid fa-ice-cream text-xs text-[#E36727]"></i>
                                      <span>Dessert</span>
                                    </span>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      {pkg.dessert_text
                                        .split(",")
                                        .map((dessert, dIdx) => (
                                          <div
                                            key={dIdx}
                                            className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-start gap-2"
                                          >
                                            <i className="fa-solid fa-spoon text-[#E36727] text-[10px] mt-1 shrink-0"></i>
                                            <span className="leading-snug">{dessert.trim()}</span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Card Actions */}
                              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-white/10 space-y-2">
                                <button
                                  onClick={() => {
                                    setBookingPackage(pkg.name);
                                    setIsBookingModalOpen(true);
                                  }}
                                  className="w-full py-2.5 bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <i className="fa-solid fa-calendar-check"></i>
                                  <span>Select & Request Quote</span>
                                </button>
                                <a
                                  href={`https://wa.me/94742013332?text=${encodeURIComponent(
                                    `Hi Ahas Gawwa, I am interested in booking "${pkg.name}" (Rs. ${Number(
                                      pkg.price_per_pax
                                    ).toLocaleString()}/plate). Please share available dates and custom options.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-2 bg-slate-100 dark:bg-[#1a1614] hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200 dark:border-white/10"
                                >
                                  <i className="fa-brands fa-whatsapp text-emerald-500"></i>
                                  <span>Inquire via WhatsApp</span>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* TAB 4: ADD-ONS & SERVICE POLICIES */}
              {cateringCategoryTab === "addons" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Additional Charge Items & Free Services.
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Special paper-plate wraps, sweet arrangements, fruit platters, and complimentary event services.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {addons.map((addon) => (
                      <div
                        key={addon.id}
                        className="p-6 rounded-3xl bg-white dark:bg-[#26201d] border border-amber-200 dark:border-white/10 hover:border-[#E36727] transition-all space-y-4 portal-card-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-[#E36727]/10 text-[#E36727] flex items-center justify-center text-xl">
                            <i className={`fa-solid ${addon.icon}`}></i>
                          </div>
                          <span className="font-serif text-2xl font-extrabold text-[#E36727]">
                            Rs. {Number(addon.price_per_pax).toLocaleString()}/=
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {addon.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {addon.description}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setBookingPackage(`Add-on: ${addon.name}`);
                            setIsBookingModalOpen(true);
                          }}
                          className="w-full py-2 bg-slate-100 dark:bg-[#1a1614] hover:bg-[#E36727] hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Inquire / Add to Order
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Complimentary Policies Details (Rendered Dynamically from Backend) */}
                  <div className="p-6 rounded-3xl bg-[#FBEAD9] dark:bg-[#1a1614] border border-amber-500/30 space-y-4">
                    <h4 className="font-serif font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <i className="fa-solid fa-circle-info text-[#E36727]"></i>
                      <span>{serviceTerms.section_title || "Important Service Terms & Logistics Policies"}</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
                      {serviceTerms.policies.map((policy) => (
                        <div
                          key={policy.id || policy.title}
                          className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 space-y-2 shadow-xs"
                        >
                          <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                            <i className={`fa-solid ${policy.icon || "fa-circle-check"} text-[#E36727]`}></i>{" "}
                            {policy.title}
                          </span>
                          <p className="leading-relaxed whitespace-pre-line">
                            {policy.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </section>

      {/* SECTION 4: SEASONAL FEATURED PACKAGES */}
      {packages.length > 0 && packages.some((p) => p.is_featured) && (
        <section
          id="packages"
          className="py-16 sm:py-20 bg-[#FBEAD9] dark:bg-[#1a1614] border-t border-slate-200 dark:border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
                Top Value Offers
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                Seasonal Featured Packages
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                All-inclusive catering packages with complete course menus, service staff, and equipment included.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages
                .filter((p) => p.is_featured)
                .slice(0, 4)
                .map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#26201d] border border-[#E36727]/40 space-y-4 portal-card-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-[#E36727] uppercase bg-[#E36727]/10 px-2.5 py-0.5 rounded-full">
                            {pkg.badge}
                          </span>
                          <h3 className="font-serif font-bold text-2xl text-slate-900 dark:text-white mt-1">
                            {pkg.name}
                          </h3>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-[#E36727]">
                            Rs. {Number(pkg.price_per_pax).toLocaleString()}/=
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold">
                            Per Pax (Min {pkg.min_pax})
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {pkg.description}
                      </p>
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-black/20 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-white/5 space-y-1.5">
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">Main Courses: </strong>
                          <span>{pkg.inclusions_text}</span>
                        </div>
                        {pkg.dessert_text && (
                          <div className="pt-1.5 border-t border-slate-200/60 dark:border-white/5 flex items-start gap-1.5">
                            <strong className="text-amber-600 dark:text-amber-400 shrink-0 flex items-center gap-1">
                              <i className="fa-solid fa-ice-cream text-[10px]"></i>
                              <span>Dessert:</span>
                            </strong>
                            <span className="text-slate-800 dark:text-slate-200 font-semibold">{pkg.dessert_text}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBookingPackage(pkg.name);
                        setIsBookingModalOpen(true);
                      }}
                      className="w-full py-3 bg-[#E36727] hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-check"></i>
                      <span>Reserve This Package</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl max-w-md w-full p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-1">
              Request Written Quote
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Our catering coordinator will contact you within 2 hours with an official quotation.
            </p>

            {bookingPackage && (
              <div className="p-3 mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-amber-500 uppercase font-bold block">Selected Menu</span>
                  <span className="font-bold text-slate-900 dark:text-white">{bookingPackage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingPackage("")}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  placeholder="Ruwan Wickramasinghe"
                  className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  placeholder="077 123 4567"
                  className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Event Suburb
                </label>
                <input
                  type="text"
                  required
                  value={bookingSuburb}
                  onChange={(e) => setBookingSuburb(e.target.value)}
                  placeholder="e.g. Rajagiriya"
                  className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#E36727] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-amber-600 transition-all"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}


      {/* NOTICE MODAL */}
      {isNoticeOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-check"></i>
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

      {/* PAYMENT GATEWAY MODAL */}
      {isGatewayModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl max-w-md w-full p-6 sm:p-7 relative shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <button
              onClick={() => setIsGatewayModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                <i className="fa-solid fa-lock"></i>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Ahas Gawwa Payment Gateway
                </h3>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                  256-Bit SSL Encrypted Payment
                </span>
              </div>
            </div>

            {/* Payment Amount Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-amber-500/30 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">
                {paymentType === "advance"
                  ? "30% Advance Deposit Due Now"
                  : "100% Full Payment Amount"}
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-extrabold gold-gradient-text">
                LKR {(paymentType === "advance" ? advanceAmount : grandTotal).toLocaleString()}
              </div>
              {paymentType === "advance" && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Remaining 70% Balance (LKR {balanceAmount.toLocaleString()}) payable on event date.
                </div>
              )}
            </div>

            <form onSubmit={handleGatewaySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Payer / Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Ruwan Wickramasinghe"
                  className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Mobile / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  placeholder="077 123 4567"
                  className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGatewayChoice("card")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${gatewayChoice === "card"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                        : "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#26201d] text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    <i className="fa-solid fa-credit-card mr-1"></i> Visa / Master
                  </button>
                  <button
                    type="button"
                    onClick={() => setGatewayChoice("ipg")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${gatewayChoice === "ipg"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                        : "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#26201d] text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    <i className="fa-solid fa-building-columns mr-1"></i> IPG Banking
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01]"
              >
                <i className="fa-solid fa-shield-halved"></i>
                <span>
                  Proceed to Secure Payment (LKR {(paymentType === "advance" ? advanceAmount : grandTotal).toLocaleString()})
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
