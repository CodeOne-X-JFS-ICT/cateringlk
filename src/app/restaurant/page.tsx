"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface CartItem {
  name: string;
  price: number;
}

export default function RestaurantPage() {
  // Tab State: 'dining' | 'takeaway' | 'delivery'
  const [activeTab, setActiveTab] = useState<"dining" | "takeaway" | "delivery">("dining");

  // Reservation Modal State
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [resSlotTitle, setResSlotTitle] = useState("Dining Table");
  const [resName, setResName] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resDate, setResDate] = useState("");
  const [resGuests, setResGuests] = useState(2);

  // Takeaway Cart State
  const [takeawayCart, setTakeawayCart] = useState<CartItem[]>([]);
  const [takeawayDate, setTakeawayDate] = useState("");
  const [takeawaySlot, setTakeawaySlot] = useState("12:15 PM");

  // Delivery Map State
  const [searchCity, setSearchCity] = useState("");
  const [mapPin, setMapPin] = useState<{ x: number; y: number } | null>(null);
  const [mapStatus, setMapStatus] = useState({
    title: "Central Location Selected: Handapangoda Hub",
    desc: "Inside standard 6km coverage area. Estimated delivery time: 30 - 40 Mins.",
    isCoverage: true,
  });

  // Notice Modal State
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");

  // Set today's date on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTakeawayDate(today);
    setResDate(today);
  }, []);

  // Notice Helper
  const showAlertNotice = (title: string, desc: string) => {
    setNoticeTitle(title);
    setNoticeDesc(desc);
    setIsNoticeOpen(true);
  };

  // Scroll Helper
  const scrollToPortalContent = () => {
    const el = document.getElementById("portal-content-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Reservation Handlers
  const openReservation = (slotTitle: string) => {
    setResSlotTitle(slotTitle);
    setIsResModalOpen(true);
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsResModalOpen(false);
    showAlertNotice(
      "Reservation Request Sent!",
      `Your table reservation request for ${resSlotTitle} on ${resDate} (${resGuests} guests) has been received. Our floor manager will contact you shortly.`
    );
    setResName("");
    setResPhone("");
  };

  // Takeaway Cart Handlers
  const addTakeawayItem = (name: string, price: number) => {
    setTakeawayCart((prev) => [...prev, { name, price }]);
  };

  const getTakeawayTotal = () => {
    return takeawayCart.reduce((sum, item) => sum + item.price, 0);
  };

  const confirmTakeawayOrder = () => {
    if (takeawayCart.length === 0) {
      showAlertNotice(
        "Cart Empty",
        "Please add at least one meal box before confirming takeaway."
      );
      return;
    }
    showAlertNotice(
      "Takeaway Order Scheduled!",
      `Your order of ${takeawayCart.length} item(s) has been placed for pick-up on ${takeawayDate} at ${takeawaySlot}. Total: LKR ${getTakeawayTotal().toLocaleString()}.`
    );
    setTakeawayCart([]);
  };

  // Delivery Search & Pin Logic
  const handleCitySearch = () => {
    const query = searchCity.trim().toLowerCase();
    if (!query) {
      showAlertNotice(
        "Search Input Needed",
        "Please enter a suburb or city name to check delivery coverage."
      );
      return;
    }

    const inCoverage = [
      "handapangoda",
      "arakawila",
      "bope",
      "millewa",
      "meepe",
      "galagedara",
      "padukka",
      "watareka",
      "moragahahena",
    ];

    const isMatch = inCoverage.some(
      (s) => query.includes(s) || s.includes(query)
    );

    if (isMatch) {
      setMapStatus({
        title: `✓ ${query.toUpperCase()} Verified - Inside 6KM Zone`,
        desc: "Hot insulated delivery available within 30-40 minutes.",
        isCoverage: true,
      });
      setMapPin({ x: 50, y: 50 });
    } else {
      setMapStatus({
        title: `⚠️ ${query.toUpperCase()} Outside Standard 6KM Zone`,
        desc: "Special catering van dispatch available. Contact catering coordinator for surcharge details.",
        isCoverage: false,
      });
    }
  };

  const useCurrentGeo = () => {
    setMapPin({ x: 48, y: 42 });
    setMapStatus({
      title: "✓ Current Location Dropped: Handapangoda / Padukka Border (3.2KM from Hub)",
      desc: "Well within express 6KM coverage. Live chef dispatch active.",
      isCoverage: true,
    });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    setMapPin({ x: xPercent, y: yPercent });
    setMapStatus({
      title: "✓ Custom Location Pin Dropped",
      desc: "Coordinates verified inside 6KM express delivery zone. Dispatch time ~35 Mins.",
      isCoverage: true,
    });
  };

  const sendWhatsAppDelivery = () => {
    const text = `Hi Ahas Gawwa Restaurant, I would like to order meal delivery within 6km radius to my location.`;
    window.open(
      `https://wa.me/94771234567?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="w-full transition-colors duration-300 font-sans bg-white dark:bg-[#0f0d0c] text-slate-800 dark:text-slate-100">
      {/* HERO SECTION */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden py-16 sm:py-10">
        {/* Background Image with Ken Burns Effect */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
            alt="Ahas Gawwa Restaurant Ambiance"
            className="w-full h-full object-cover object-center animate-hero-kenburns opacity-50 dark:opacity-30 filter contrast-105"
          />

          {/* Ambient Grid Overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E36727_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E36727]/30 bg-[#E36727]/10 dark:bg-[#E36727]/20 text-[#E36727] text-xs sm:text-sm font-extrabold mb-6 shadow-sm">
            <i className="fa-solid fa-utensils text-amber-500"></i> Authentic
            Sri Lankan Fine Dining & Express Delivery
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-4xl mx-auto">
            Welcome to <span className="gold-gradient-text">Ahas Gawwa</span>{" "}
            Restaurant
          </h1>

          <p className="mt-4 text-base sm:text-xl text-slate-900 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Choose from private dining slot reservations, instant takeaway
            orders, or 6km express meal delivery right to your doorstep.
          </p>

          {/* Tab Selector Bar */}
          <div className="mt-10 max-w-3xl mx-auto bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-[#E36727]/30 p-3 sm:p-4 rounded-3xl portal-card-shadow backdrop-blur-md">
            <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm font-bold">
              <button
                onClick={() => {
                  setActiveTab("dining");
                  scrollToPortalContent();
                }}
                className={`py-3 sm:py-3.5 px-3 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "dining"
                    ? "bg-gradient-to-r from-[#E36727] to-amber-600 text-white shadow-md font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <i className="fa-solid fa-chair text-sm sm:text-base"></i>
                <span>Dining / Private</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("takeaway");
                  scrollToPortalContent();
                }}
                className={`py-3 sm:py-3.5 px-3 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "takeaway"
                    ? "bg-gradient-to-r from-[#E36727] to-amber-600 text-white shadow-md font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <i className="fa-solid fa-bag-shopping text-sm sm:text-base"></i>
                <span>Takeaway</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("delivery");
                  scrollToPortalContent();
                }}
                className={`py-3 sm:py-3.5 px-3 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "delivery"
                    ? "bg-gradient-to-r from-[#E36727] to-amber-600 text-white shadow-md font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <i className="fa-solid fa-truck-fast text-sm sm:text-base"></i>
                <span>6km Delivery</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PORTAL CONTENT SECTION */}
      <section
        id="portal-content-section"
        className="py-12 sm:py-20 bg-white dark:bg-[#0f0d0c] border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ========================================================= */}
          {/* 1. DINING PANEL CONTENT                                   */}
          {/* ========================================================= */}
          {activeTab === "dining" && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-[#E36727] text-xs uppercase font-extrabold tracking-widest bg-[#E36727]/10 px-3.5 py-1.5 rounded-full border border-[#E36727]/20 inline-block">
                  Fine Dining & Open Slots
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                  Reserve Your Private Table & Open Time Slots
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                  Select an available dining period below to reserve your table
                  for intimate family meals or executive private dining rooms.
                </p>
              </div>

              {/* Open Time Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Breakfast Slot */}
                <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-300 dark:border-white/10 rounded-3xl p-6 space-y-4 hover:border-[#E36727] transition-all shadow-sm group">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <i className="fa-solid fa-sun-plant-wilt"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      Breakfast Slots
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      07:30 AM – 10:30 AM Daily
                    </p>
                  </div>
                  <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/10 pt-3">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i>{" "}
                      String Hoppers & Milk Rice
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i>{" "}
                      Ceylon Tea & Coffee Bar
                    </div>
                  </div>
                  <button
                    onClick={() => openReservation("Breakfast Slot")}
                    className="w-full py-2.5 bg-[#E36727]/10 hover:bg-[#E36727] text-[#E36727] hover:text-white font-bold text-xs rounded-xl transition-all border border-[#E36727]/30 cursor-pointer"
                  >
                    Reserve Breakfast Slot
                  </button>
                </div>

                {/* Lunch Slot */}
                <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl p-6 space-y-4 hover:border-[#E36727] transition-all portal-card-shadow group">
                  <div className="w-12 h-12 rounded-2xl bg-[#E36727]/15 text-[#E36727] flex items-center justify-center text-xl group-hover:bg-[#E36727] group-hover:text-white transition-all">
                    <i className="fa-solid fa-sun"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      Lunch Buffets
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      12:00 PM – 03:30 PM Daily
                    </p>
                  </div>
                  <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/10 pt-3">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i>{" "}
                      Authentic Rice & Curry Buffet
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i>{" "}
                      Black Pork & Seafood Specialties
                    </div>
                  </div>
                  <button
                    onClick={() => openReservation("Lunch Buffet Slot")}
                    className="w-full py-2.5 bg-[#E36727] text-white font-bold text-xs rounded-xl shadow-md hover:bg-amber-600 transition-all cursor-pointer"
                  >
                    Reserve Lunch Table
                  </button>
                </div>

                {/* Sub Meals / High-Tea Slot */}
                <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-300 dark:border-white/10 rounded-3xl p-6 space-y-4 hover:border-[#E36727] transition-all shadow-sm group">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <i className="fa-solid fa-mug-hot"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      Sub Meals & High Tea
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      04:00 PM – 06:30 PM Daily
                    </p>
                  </div>
                  <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/10 pt-3">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i>{" "}
                      Short Eats & Cutlets
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i>{" "}
                      Fresh Juices & Desserts
                    </div>
                  </div>
                  <button
                    onClick={() => openReservation("Sub Meals & High Tea Slot")}
                    className="w-full py-2.5 bg-[#E36727]/10 hover:bg-[#E36727] text-[#E36727] hover:text-white font-bold text-xs rounded-xl transition-all border border-[#E36727]/30 cursor-pointer"
                  >
                    Reserve High Tea Slot
                  </button>
                </div>

                {/* Dinner Slot */}
                <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-300 dark:border-white/10 rounded-3xl p-6 space-y-4 hover:border-[#E36727] transition-all shadow-sm group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center text-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <i className="fa-solid fa-moon"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      Dinner & Night Grill
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      06:30 PM – 11:00 PM Daily
                    </p>
                  </div>
                  <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/10 pt-3">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i>{" "}
                      Live Hoppers & Kottu
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i>{" "}
                      Charcoal Seafood BBQ Grill
                    </div>
                  </div>
                  <button
                    onClick={() => openReservation("Dinner & Night Grill Slot")}
                    className="w-full py-2.5 bg-[#E36727]/10 hover:bg-[#E36727] text-[#E36727] hover:text-white font-bold text-xs rounded-xl transition-all border border-[#E36727]/30 cursor-pointer"
                  >
                    Reserve Dinner Slot
                  </button>
                </div>
              </div>

              {/* Dining Menu Preview */}
              <div className="bg-[#FBEAD9] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                      Restaurant Menu & Packages
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Curated by Master Chef Sunil Perera
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-[#E36727]/10 text-[#E36727] text-xs font-bold rounded-lg border border-[#E36727]/20">
                      <i className="fa-solid fa-fire"></i> Freshly Prepared On
                      Order
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Menu Dish 1 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-300 dark:border-white/10 hover:border-[#E36727] space-y-2 shadow-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Black Pork Curry Feast
                      </h4>
                      <span className="text-xs font-bold text-[#E36727]">
                        LKR 1,850
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Served with fragrant yellow basmati rice, tempered dhal,
                      brinjal moju, and papadam.
                    </p>
                  </div>

                  {/* Menu Dish 2 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-300 dark:border-white/10 hover:border-[#E36727] space-y-2 shadow-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Hot Butter Sepia Cuttlefish
                      </h4>
                      <span className="text-xs font-bold text-[#E36727]">
                        LKR 2,200
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Crispy wok-tossed cuttlefish in spicy chili butter, capsicum,
                      and scallions.
                    </p>
                  </div>

                  {/* Menu Dish 3 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-300 dark:border-white/10 hover:border-[#E36727] space-y-2 shadow-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Live Hopper Platter
                      </h4>
                      <span className="text-xs font-bold text-[#E36727]">
                        LKR 1,250
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      4 Plain hoppers + 1 Egg hopper served with spicy katta
                      sambal and chicken curry gravy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. TAKEAWAY PANEL CONTENT                                 */}
          {/* ========================================================= */}
          {activeTab === "takeaway" && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-amber-500 text-xs uppercase font-extrabold tracking-widest bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20 inline-block">
                  Express Pick-up Orders
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                  Available Takeaway Meals & Pick-Up Slots
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                  Pre-order online and collect hot meal boxes directly from our
                  Rajagiriya counter with zero waiting time.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Takeaway Meal Box Selection */}
                <div className="lg:col-span-8 bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/10">
                    <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                      1. Select Takeaway Meal Boxes
                    </h3>
                    <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      Hot Pick-Up Ready in 20 Mins
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Box Item 1 */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 hover:border-[#E36727] space-y-3 shadow-xs">
                      <div className="flex justify-between">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          Executive Ceylon Rice Box
                        </div>
                        <div className="text-xs font-bold text-[#E36727]">
                          LKR 950
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Steamed Basmati, Chicken or Fish, 3 curries, papadam,
                        fried chili, and salad.
                      </p>
                      <button
                        onClick={() =>
                          addTakeawayItem("Executive Ceylon Rice Box", 950)
                        }
                        className="w-full py-2 bg-[#E36727] text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        + Add to Takeaway Order
                      </button>
                    </div>

                    {/* Box Item 2 */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 hover:border-[#E36727] space-y-3 shadow-xs">
                      <div className="flex justify-between">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          Authentic Lamprais Box
                        </div>
                        <div className="text-xs font-bold text-[#E36727]">
                          LKR 1,400
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Stock rice, mixed meat curry, ash plantain, blachan,
                        frikkadels, wrapped in banana leaf.
                      </p>
                      <button
                        onClick={() =>
                          addTakeawayItem("Authentic Lamprais Box", 1400)
                        }
                        className="w-full py-2 bg-[#E36727] text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        + Add to Takeaway Order
                      </button>
                    </div>

                    {/* Box Item 3 */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 hover:border-[#E36727] space-y-3 shadow-xs">
                      <div className="flex justify-between">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          Cheese Chicken Kottu Box
                        </div>
                        <div className="text-xs font-bold text-[#E36727]">
                          LKR 1,200
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Chopped roti with roast chicken, egg, vegetables, melt
                        cheese, and side gravy.
                      </p>
                      <button
                        onClick={() =>
                          addTakeawayItem("Cheese Chicken Kottu Box", 1200)
                        }
                        className="w-full py-2 bg-[#E36727] text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        + Add to Takeaway Order
                      </button>
                    </div>

                    {/* Box Item 4 */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 hover:border-[#E36727] space-y-3 shadow-xs">
                      <div className="flex justify-between">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          Seafood Fried Rice Meal Box
                        </div>
                        <div className="text-xs font-bold text-[#E36727]">
                          LKR 1,350
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Wok-fried rice with prawns, squid, devilled chicken, fried
                        egg, and chili paste.
                      </p>
                      <button
                        onClick={() =>
                          addTakeawayItem("Seafood Fried Rice Box", 1350)
                        }
                        className="w-full py-2 bg-[#E36727] text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        + Add to Takeaway Order
                      </button>
                    </div>
                  </div>
                </div>

                {/* Takeaway Time Slot & Order Summary Sticky Sidebar */}
                <div className="lg:col-span-4 bg-[#FBEAD9] dark:bg-[#1a1614] border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl sticky top-28">
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-white/10">
                    2. Pick-Up Slot & Summary
                  </h3>

                  <div className="space-y-3 text-xs">
                    <label className="block font-bold text-[#E36727] uppercase">
                      Select Pick-Up Date & Slot
                    </label>
                    <input
                      type="date"
                      value={takeawayDate}
                      onChange={(e) => setTakeawayDate(e.target.value)}
                      className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-slate-900 dark:text-white font-semibold"
                    />

                    <select
                      value={takeawaySlot}
                      onChange={(e) => setTakeawaySlot(e.target.value)}
                      className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="12:15 PM">
                        12:15 PM - 12:45 PM (Express Lunch)
                      </option>
                      <option value="01:15 PM">
                        01:15 PM - 01:45 PM (Express Lunch)
                      </option>
                      <option value="06:45 PM">
                        06:45 PM - 07:15 PM (Express Evening)
                      </option>
                      <option value="08:15 PM">
                        08:15 PM - 08:45 PM (Express Dinner)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2 border-t border-slate-200 dark:border-white/10 pt-4 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Order Cart ({takeawayCart.length} items):
                    </div>

                    {takeawayCart.length === 0 ? (
                      <div className="text-slate-500 dark:text-slate-400 italic">
                        No items added yet. Click &quot;+ Add to Takeaway Order&quot;.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {takeawayCart.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-300"
                          >
                            <span>
                              {index + 1}. {item.name}
                            </span>
                            <span className="font-bold text-[#E36727]">
                              LKR {item.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-sm text-[#E36727] pt-2 border-t border-slate-200 dark:border-white/10">
                      <span>Total Amount:</span>
                      <span>LKR {getTakeawayTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={confirmTakeawayOrder}
                    className="w-full py-3 bg-[#E36727] text-white font-bold text-xs rounded-xl shadow-md hover:bg-amber-600 transition-all cursor-pointer"
                  >
                    Confirm & Schedule Pick-Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. DELIVERY PANEL CONTENT (6km Radius Simulator)          */}
          {/* ========================================================= */}
          {activeTab === "delivery" && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-emerald-500 text-xs uppercase font-extrabold tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 inline-block">
                  Express 6KM Delivery Zone
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                  Delivery Location Map
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                  We deliver hot meals within a 6km radius of our central kitchen
                  in Hadapangoda / Arakawila / Padukka. Search your suburb or drop a map pin
                  below.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Map Visualizer Column */}
                <div className="lg:col-span-7 bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  {/* Search & Location Inputs */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-[#E36727] uppercase tracking-wider">
                      Search City or Suburb Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        placeholder="Enter city e.g. Handapangoda, Arakawila, Meepe, Millewa, Padukka, Moragahahena..."
                        className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#E36727]"
                      />
                      <button
                        onClick={handleCitySearch}
                        className="px-5 py-3 bg-[#E36727] text-white text-xs font-bold rounded-xl shrink-0 hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        Check Radius
                      </button>
                    </div>
                    <button
                      onClick={useCurrentGeo}
                      className="w-full py-2.5 bg-slate-100 dark:bg-[#26201d] hover:bg-[#E36727]/10 text-[#E36727] border border-[#E36727]/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <i className="fa-solid fa-location-crosshairs"></i> Use My
                      Current Location
                    </button>
                  </div>

                  {/* Google Map Embedded Location for CATERING by AHAS GAWWA */}
                  <div className="relative w-full h-85 rounded-2xl overflow-hidden border-2 border-[#E36727]/40 shadow-lg">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63384.46628298207!2d80.14106971664121!3d6.826972822009899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3b3003f850aef%3A0x1a81112e03fc4530!2sCATERING%20by%20AHAS%20GAWWA!5e0!3m2!1sen!2slk!4v1786599526916!5m2!1sen!2slk"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      title="CATERING by AHAS GAWWA Location Map"
                      className="w-full h-full"
                    ></iframe>
                  </div>

                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
                      mapStatus.isCoverage
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        mapStatus.isCoverage
                          ? "fa-circle-check"
                          : "fa-triangle-exclamation"
                      } text-lg`}
                    ></i>
                    <div>
                      <div className="font-bold">{mapStatus.title}</div>
                      <div className="text-[11px] opacity-80">
                        {mapStatus.desc}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deliverable Meals Menu */}
                <div className="lg:col-span-5 bg-[#FBEAD9] dark:bg-[#1a1614] border border-amber-500/40 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="pb-3 border-b border-slate-200 dark:border-white/10">
                    <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                      Meals Available for Delivery
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Packed in heat-insulated thermal containers
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          Hot Black Pork Curry Rice Box
                        </div>
                        <div className="text-[11px] text-[#E36727] font-bold">
                          LKR 1,250
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          showAlertNotice(
                            "Delivery Item Selected",
                            "Added 'Hot Black Pork Curry Rice Box' to delivery dispatch list."
                          )
                        }
                        className="px-3 py-1.5 bg-[#E36727] text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        Order Now
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          Butter Chicken & Naan Combo
                        </div>
                        <div className="text-[11px] text-[#E36727] font-bold">
                          LKR 1,550
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          showAlertNotice(
                            "Delivery Item Selected",
                            "Added 'Butter Chicken & Naan Combo' to delivery dispatch list."
                          )
                        }
                        className="px-3 py-1.5 bg-[#E36727] text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        Order Now
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          Devilled Seafood Kottu Special
                        </div>
                        <div className="text-[11px] text-[#E36727] font-bold">
                          LKR 1,400
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          showAlertNotice(
                            "Delivery Item Selected",
                            "Added 'Devilled Seafood Kottu Special' to delivery dispatch list."
                          )
                        }
                        className="px-3 py-1.5 bg-[#E36727] text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        Order Now
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          Claypot Watalappan Dessert Cup
                        </div>
                        <div className="text-[11px] text-[#E36727] font-bold">
                          LKR 450
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          showAlertNotice(
                            "Delivery Item Selected",
                            "Added 'Claypot Watalappan Dessert Cup' to delivery dispatch list."
                          )
                        }
                        className="px-3 py-1.5 bg-[#E36727] text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={sendWhatsAppDelivery}
                    className="w-full py-3 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Order via
                    WhatsApp Express
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RESERVATION MODAL */}
      {isResModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl portal-card-shadow animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsResModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Table Reservation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Reserve {resSlotTitle} at Ahas Gawwa Restaurant.
            </p>

            <form onSubmit={handleReservationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  placeholder="e.g. Asanka Perera"
                  className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Contact Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={resPhone}
                  onChange={(e) => setResPhone(e.target.value)}
                  placeholder="077 123 4567"
                  className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Guests Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={resGuests}
                    onChange={(e) => setResGuests(parseInt(e.target.value) || 1)}
                    className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#E36727] text-white font-bold text-xs rounded-xl shadow-md hover:bg-amber-600 transition-all cursor-pointer"
              >
                Confirm Table Reservation
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
              className="w-full py-2.5 bg-[#E36727] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
