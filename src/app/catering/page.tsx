"use client";

import React, { useState, useEffect } from "react";

// Types & Data
type EventKey =
  | "wedding"
  | "dana"
  | "corporate"
  | "birthday"
  | "private"
  | "funeral";

type TierKey = "silver" | "gold" | "platinum";

type MenuTabKey = "srilankan" | "indian" | "chinese" | "bbq" | "desserts";

interface MenuItem {
  title: string;
  desc: string;
  badge: string;
}

const tierPrices: Record<TierKey, number> = {
  silver: 1850,
  gold: 2750,
  platinum: 3950,
};

const tierNames: Record<TierKey, string> = {
  silver: "Silver Essential",
  gold: "Royal Gold",
  platinum: "Imperial Platinum",
};

const eventNames: Record<EventKey, string> = {
  wedding: "Wedding Reception",
  dana: "Sacred Dana Alms-Giving",
  corporate: "Corporate Gala",
  birthday: "Birthday Celebration",
  private: "Private Garden BBQ",
  funeral: "Funeral Commemoration",
};

const menuData: Record<MenuTabKey, MenuItem[]> = {
  srilankan: [
    {
      title: "Fragrant Steamed Basmati Yellow Rice",
      desc: "Cardamom, cloves, ghee, and roasted cashew nuts.",
      badge: "Chef Special",
    },
    {
      title: "Traditional Black Pork Curry",
      desc: "Slow-roasted spices, goraka tamarind infusion.",
      badge: "Signature",
    },
    {
      title: "Ceylon Spiced Chicken Curry",
      desc: "Creamy coconut milk gravy with roasted curry powder.",
      badge: "Popular",
    },
    {
      title: "Devilled Sepia Squid or Prawns",
      desc: "Wok-tossed with capsicum, onions, and tomato reduction.",
      badge: "Spicy",
    },
    {
      title: "Creamy Cashew & Green Pea Curry",
      desc: "Raw cashew nuts stewed in coconut cream.",
      badge: "Vegetarian",
    },
    {
      title: "Brinjal Moju (Eggplant Pickle)",
      desc: "Sweet & sour fried brinjal with mustard seeds.",
      badge: "Traditional",
    },
  ],
  indian: [
    {
      title: "Kashmiri Chicken Biryani",
      desc: "Aromatic basmati rice with whole spices, chicken, and saffron.",
      badge: "Royal",
    },
    {
      title: "Butter Chicken Masala",
      desc: "Tandoori chicken in rich creamy tomato butter gravy.",
      badge: "Mild & Rich",
    },
    {
      title: "Paneer Butter Masala",
      desc: "Fresh cottage cheese cubes in spiced gravy.",
      badge: "Vegetarian",
    },
    {
      title: "Garlic & Butter Tandoori Naan",
      desc: "Baked live on-site in tandoor oven.",
      badge: "Live Station",
    },
  ],
  chinese: [
    {
      title: "Special Seafood Fried Rice",
      desc: "Wok-tossed basmati with prawns, squid, and light soy.",
      badge: "Classic",
    },
    {
      title: "Chilli Garlic Seafood Noodles",
      desc: "Stir-fried noodles with chili garlic paste.",
      badge: "Spicy",
    },
    {
      title: "Hot Butter Sepia Cuttlefish",
      desc: "Crispy cuttlefish tossed in butter, capsicum, and chili.",
      badge: "Must Try",
    },
  ],
  bbq: [
    {
      title: "Live Hopper & Egg Hopper Station",
      desc: "Crispy hoppers prepared live with lunu miris and katta sambal.",
      badge: "Live Station",
    },
    {
      title: "Live BBQ Grilled Jumbo Prawns",
      desc: "Garlic butter and local herbs charcoal grill.",
      badge: "Seafood BBQ",
    },
    {
      title: "Live Kottu Roti Action Station",
      desc: "Chicken, Beef, or Cheese Kottu chopped fresh live.",
      badge: "Crowd Pleaser",
    },
  ],
  desserts: [
    {
      title: "Traditional Claypot Watalappan",
      desc: "Authentic kitul jaggery custard with coconut cream.",
      badge: "Iconic SL",
    },
    {
      title: "Fresh Fruit Trifle",
      desc: "Sponge cake, custard, fresh fruits, and whipped cream.",
      badge: "Classic",
    },
    {
      title: "Iced Woodapple Nectar / Passion Drink",
      desc: "Refreshing traditional fruit coolers.",
      badge: "Beverage",
    },
  ],
};

const locationsList = [
  "Padukka",
  "Handapangoda",
  "Ingiriya",
  "Horana",
  "Bope",
  "Meepe",
  "Labugama",
  "Colombo",
  "Dehiwala-Mount Lavinia",
  "Kottawa",
  "Maharagama",
  "Nugegoda",
  "Pannipitiya",
  "Homagama",
  "Malabe",
  "Kaduwela",
  "Battaramulla",
  "Gampaha",
  "Ja-Ela",
  "Ragama",
  "Kadawatha",
  "Kelaniya",
  "Wattala",
  "Kalutara",
  "Panadura",
  "Beruwala",
  "Bandaragama",
  "Matugama",
  "Avissawella",
  "Ratnapura",
  "Deraniyagala",
  "Yatiyanthota",
];

export default function CateringPage() {
  // Calculator State
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventKey>("wedding");
  const [selectedTier, setSelectedTier] = useState<TierKey>("silver");
  const [paxCount, setPaxCount] = useState(100);

  // Add-on State
  const [addonHoppers, setAddonHoppers] = useState(false);
  const [addonBbq, setAddonBbq] = useState(false);
  const [addonDessert, setAddonDessert] = useState(false);
  const [addonCutlery, setAddonCutlery] = useState(false);

  // Menu Tab State
  const [activeMenuTab, setActiveMenuTab] = useState<MenuTabKey>("srilankan");

  // Modals State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalKey, setInfoModalKey] = useState<EventKey | "bbq">("wedding");
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");

  // Form State
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingSuburb, setBookingSuburb] = useState("");

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

  // Calculations
  const getAddonsPerPax = () => {
    let sum = 0;
    if (addonHoppers) sum += 450;
    if (addonBbq) sum += 650;
    if (addonDessert) sum += 300;
    if (addonCutlery) sum += 250;
    return sum;
  };

  const baseRate = tierPrices[selectedTier];
  const addonsPerPax = getAddonsPerPax();
  const totalPerPax = baseRate + addonsPerPax;
  const grandTotal = totalPerPax * paxCount;

  // WhatsApp Quote Link
  const sendWhatsAppQuote = () => {
    const text = `Hi Ahas Gawwa Catering, I calculated an estimated quote:\n- Location: ${
      selectedLocation || "Not Specified"
    }\n- Event: ${eventNames[selectedEvent]}\n- Guests: ${paxCount} Pax\n- Tier: ${
      tierNames[selectedTier]
    }\n- Grand Estimated Budget: LKR ${grandTotal.toLocaleString()}`;
    window.open(
      `https://wa.me/94742013332?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookingModalOpen(false);
    showAlertNotice(
      "Quote Request Sent",
      `Your written quote request for ${bookingName} (${bookingSuburb}) has been submitted. Our catering coordinator will contact you shortly.`
    );
    setBookingName("");
    setBookingPhone("");
  };

  const openServiceModal = (key: EventKey | "bbq") => {
    setInfoModalKey(key);
    setIsInfoModalOpen(true);
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
                  className="w-full bg-transparent text-slate-900 dark:text-white text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white">
                    Select City / Suburb
                  </option>
                  {locationsList.map((loc) => (
                    <option key={loc} value={loc} className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Event Type */}
              <div className="p-3 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 shadow-md shadow-#E36727">
                <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                  Event Type
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value as EventKey)}
                  className="w-full bg-transparent text-slate-900 dark:text-white text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="wedding" className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white">
                    Wedding Reception
                  </option>
                  <option value="dana" className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white">
                    Sacred Dana / Alms Giving
                  </option>
                  <option value="corporate" className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white">
                    Corporate Gala / Lunch
                  </option>
                  <option value="birthday" className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white">
                    Birthday Celebration
                  </option>
                  <option value="private" className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white">
                    Private Garden BBQ
                  </option>
                  <option value="funeral" className="bg-[#FFFBF8] dark:bg-[#1a1614] text-slate-900 dark:text-white">
                    Funeral Commemoration
                  </option>
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
              Adjust guest numbers, select your menu tier, and add live stations
              to get an immediate itemized estimated budget in LKR.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controls Column (Left) */}
            <div className="lg:col-span-7 bg-[#FBEAD9] dark:bg-[#1a1614] border border-amber-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg">
              {/* 1. Event Type Selection */}
              <div>
                <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2.5">
                  1. Select Event Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      { key: "wedding", icon: "fa-heart", label: "Wedding", sub: "Reception & Poruwa" },
                      { key: "dana", icon: "fa-hands-praying", label: "Sacred Dana", sub: "Alms Giving Protocols" },
                      { key: "corporate", icon: "fa-briefcase", label: "Corporate", sub: "Galas & Lunches" },
                      { key: "birthday", icon: "fa-cake-candles", label: "Birthday", sub: "Kids & Parties" },
                      { key: "private", icon: "fa-fire", label: "Private BBQ", sub: "Garden & Beach" },
                      { key: "funeral", icon: "fa-dove", label: "Funeral", sub: "Solemn Refreshments" },
                    ] as const
                  ).map((ev) => (
                    <button
                      key={ev.key}
                      type="button"
                      onClick={() => setSelectedEvent(ev.key)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedEvent === ev.key
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#26201d]"
                      }`}
                    >
                      <i className={`fa-solid ${ev.icon} text-amber-500 text-base mb-1 block`}></i>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {ev.label}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {ev.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Guest Count Slider */}
              <div>
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
                  min="20"
                  max="1000"
                  step="10"
                  value={paxCount}
                  onChange={(e) => setPaxCount(parseInt(e.target.value) || 20)}
                  className="w-full h-2.5 bg-slate-200 dark:bg-[#26201d] rounded-lg accent-[#E36727] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">
                  <span>20 Pax (Min)</span>
                  <span>250 Pax</span>
                  <span>500 Pax</span>
                  <span>1000+ Pax</span>
                </div>
              </div>

              {/* 3. Package Tier Selector */}
              <div>
                <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2.5">
                  3. Select Package Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        key: "silver",
                        name: "Silver Essential",
                        price: "LKR 1,850/pax",
                        desc: "2 Mains, 3 Curries, Salad, Dessert, Welcome Drink.",
                      },
                      {
                        key: "gold",
                        name: "Royal Gold",
                        price: "LKR 2,750/pax",
                        desc: "3 Mains, 5 Curries, Seafood, Dual Desserts & Cutlery.",
                      },
                      {
                        key: "platinum",
                        name: "Imperial Platinum",
                        price: "LKR 3,950/pax",
                        desc: "Full International Buffet, Live Hoppers/BBQ, Premium Chafers.",
                      },
                    ] as const
                  ).map((tier) => (
                    <div
                      key={tier.key}
                      onClick={() => setSelectedTier(tier.key)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedTier === tier.key
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#26201d]"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {tier.name}
                        </span>
                        <span className="text-[11px] text-amber-500 font-bold">
                          {tier.price}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {tier.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Add-ons & Upgrades */}
              <div>
                <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2.5">
                  4. Add Live Stations & Upgrades
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 cursor-pointer shadow-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addonHoppers}
                        onChange={(e) => setAddonHoppers(e.target.checked)}
                        className="rounded text-[#E36727] accent-[#E36727]"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Live Hopper Station
                      </span>
                    </div>
                    <span className="font-bold text-amber-500">+LKR 450/pax</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 cursor-pointer shadow-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addonBbq}
                        onChange={(e) => setAddonBbq(e.target.checked)}
                        className="rounded text-[#E36727] accent-[#E36727]"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Live BBQ Grill Station
                      </span>
                    </div>
                    <span className="font-bold text-amber-500">+LKR 650/pax</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 cursor-pointer shadow-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addonDessert}
                        onChange={(e) => setAddonDessert(e.target.checked)}
                        className="rounded text-[#E36727] accent-[#E36727]"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Claypot Watalappan & Ice Cream
                      </span>
                    </div>
                    <span className="font-bold text-amber-500">+LKR 300/pax</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 cursor-pointer shadow-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addonCutlery}
                        onChange={(e) => setAddonCutlery(e.target.checked)}
                        className="rounded text-[#E36727] accent-[#E36727]"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Porcelain & Waitstaff Service
                      </span>
                    </div>
                    <span className="font-bold text-amber-500">+LKR 250/pax</span>
                  </label>
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
                  <span>Selected Event:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {eventNames[selectedEvent]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Guest Count:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {paxCount} Guests
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Tier:</span>
                  <span className="font-bold text-amber-500">
                    {tierNames[selectedTier]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Base Rate Per Pax:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    LKR {baseRate.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Add-ons Per Pax:</span>
                  <span className="font-bold text-amber-500">
                    +LKR {addonsPerPax.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Total Per Pax Cost:
                  </span>
                  <span className="font-bold text-[#E36727]">
                    LKR {totalPerPax.toLocaleString()} / pax
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#0f0d0c] border border-amber-500/40 text-center space-y-1 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Estimated Total Investment
                </div>
                <div className="text-3xl sm:text-4xl font-serif font-extrabold gold-gradient-text">
                  LKR {grandTotal.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 italic">
                  Includes buffet setup, chafing warmers & food transport within Colombo
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane"></i> Request Official Written Quote
                </button>
                <button
                  onClick={sendWhatsAppQuote}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp text-sm"></i> Lock Quote on WhatsApp
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                * Final prices may vary based on exact venue location and specific custom dish replacements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FUNCTIONS / EVENTS LIST */}
      <section
        id="functions"
        className="py-16 sm:py-20 bg-[#FBEAD9] dark:bg-[#1a1614] border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
              Functions List
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              Specialized Event Catering Solutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Tailored culinary protocols, presentation styles, and dedicated team assignments for every occasion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Function 1: Wedding */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#26201d] border border-amber-500/40 dark:border-white/40 portal-card-shadow space-y-3 hover:border-[#E36727] transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                <i className="fa-solid fa-heart"></i>
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                Wedding Reception & Poruwa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Welcome fruit punch, multi-course buffets, live hoppers/BBQ, cake structure assistance, porcelain dinnerware, and dedicated floor captain management.
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs">
                <span className="font-bold text-[#E36727]">
                  From LKR 2,750 / Pax
                </span>
                <button
                  onClick={() => openServiceModal("wedding")}
                  className="text-[#E36727] font-bold hover:underline cursor-pointer"
                >
                  Details <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>

            {/* Function 2: Sacred Dana */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#26201d] border border-amber-500/40 hover:border-[#E36727] space-y-3 portal-card-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl">
                <i className="fa-solid fa-hands-praying"></i>
              </div>
              <h3 className="font-serif font-bold text-xl text-amber-500">
                Sacred Dana / Alms Giving
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Strict vegetarian/mild traditional options, precise timing for Sangha Buddha Pooja, clean silver & claypot presentation, zero garlic/onion options.
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs">
                <span className="font-bold text-amber-500">
                  From LKR 1,850 / Pax
                </span>
                <button
                  onClick={() => openServiceModal("dana")}
                  className="text-amber-500 font-bold hover:underline cursor-pointer"
                >
                  Protocols <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>

            {/* Function 3: Corporate */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#26201d] border border-amber-500/40 dark:border-white/40 portal-card-shadow space-y-3 hover:border-[#E36727] transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">
                <i className="fa-solid fa-briefcase"></i>
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                Corporate Galas & AGM High-Teas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Executive lunch boxes, board meeting platter spreads, AGM high-teas, and insulated hot delivery to Colombo business centers.
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs">
                <span className="font-bold text-[#E36727]">
                  From LKR 1,450 / Pax
                </span>
                <button
                  onClick={() => openServiceModal("corporate")}
                  className="text-[#E36727] font-bold hover:underline cursor-pointer"
                >
                  Details <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>

            {/* Function 4: Birthdays */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#26201d] border border-amber-500/40 hover:border-[#E36727] space-y-3 portal-card-shadow  transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl">
                <i className="fa-solid fa-cake-candles"></i>
              </div>
              <h3 className="font-serif font-bold text-xl text-amber-500">
                Birthdays & Family Parties
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Finger food spreads, live mini burger counters, juice bars, chocolate fountains, and kid-friendly menu selections.
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs">
                <span className="font-bold text-amber-500">
                  From LKR 1,750 / Pax
                </span>
                <button
                  onClick={() => openServiceModal("birthday")}
                  className="text-amber-500 font-bold hover:underline cursor-pointer"
                >
                  Details <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>

            {/* Function 5: Private BBQ */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#26201d] border border-amber-500/40 dark:border-white/40 portal-card-shadow space-y-3 hover:border-[#E36727] transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-xl">
                <i className="fa-solid fa-fire"></i>
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                Private Garden & Beach BBQ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                On-site chefs, marinated chicken drumsticks, grilled jumbo prawns, tenderloin steaks, garlic breads, and fresh salads.
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs">
                <span className="font-bold text-[#E36727]">
                  From LKR 3,200 / Pax
                </span>
                <button
                  onClick={() => openServiceModal("bbq")}
                  className="text-[#E36727] font-bold hover:underline cursor-pointer"
                >
                  Details <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>

            {/* Function 6: Funeral */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#26201d] border border-amber-500/40 hover:border-[#E36727] space-y-3 portal-card-shadow transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-500/10 text-slate-400 flex items-center justify-center text-xl">
                <i className="fa-solid fa-dove"></i>
              </div>
              <h3 className="font-serif font-bold text-xl text-amber-500">
                Funeral & Commemoration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Short-notice 24-hour setup, continuous tea/coffee service, sandwiches, and respectful, quiet buffet arrangements.
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs">
                <span className="font-bold text-amber-500">
                  From LKR 1,200 / Pax
                </span>
                <button
                  onClick={() => openServiceModal("funeral")}
                  className="text-amber-500 font-bold hover:underline cursor-pointer"
                >
                  Details <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CATERING MENUS LIST */}
      <section
        id="menus"
        className="py-16 sm:py-20 bg-white dark:bg-[#0f0d0c] border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
                Menus List
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-2">
                Curated Banquet Selections
              </h2>
            </div>
            <button
              onClick={() =>
                showAlertNotice(
                  "Menu PDF Requested",
                  "The complete 2026 catering menu PDF has been simulated and prepared for download."
                )
              }
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 hover:border-[#E36727] text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-file-pdf text-red-500"></i> Download 2026 PDF Menu
            </button>
          </div>

          {/* Menu Category Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {(
              [
                { key: "srilankan", label: "🇱🇰 Sri Lankan Feast" },
                { key: "indian", label: "🇮🇳 Royal Indian" },
                { key: "chinese", label: "🥢 Chinese Fusion" },
                { key: "bbq", label: "🔥 BBQ & Hoppers" },
                { key: "desserts", label: "🍨 Desserts & Drinks" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveMenuTab(tab.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  activeMenuTab === tab.key
                    ? "bg-[#E36727] text-white shadow-md"
                    : "bg-slate-100 dark:bg-[#26201d] text-slate-700 dark:text-slate-300 hover:bg-[#E36727]/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Menu Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuData[activeMenuTab].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-[#26201d] border border-amber-200 dark:border-white/10  hover:border-[#E36727] space-y-1.5 shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#E36727]/20 text-[#E36727]">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: LIMITED PACKAGES */}
      <section
        id="packages"
        className="py-16 sm:py-20 bg-[#FBEAD9] dark:bg-[#1a1614] border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
              Limited Packages
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              Seasonal Featured Packages
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              All-inclusive event packages with set menu items and equipment included.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Limited Package 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#26201d] border border-[#E36727]/40 space-y-4 portal-card-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[#E36727] uppercase bg-[#E36727]/10 px-2.5 py-0.5 rounded-full">
                    Popular Wedding Offer
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-slate-900 dark:text-white mt-1">
                    Royal Poruwa Wedding Banquet
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-serif text-2xl font-extrabold text-[#E36727]">
                    LKR 2,750
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    Per Pax (Min 100)
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Includes Welcome Fruit Punch, Yellow Rice, Spiced Chicken, Black Pork or Fish Curry, Cashew Curry, Brinjal Moju, Live Hopper Station, Claypot Watalappan, Porcelain Crockery & Uniformed Waiters.
              </p>
              <button
                onClick={() =>
                  showAlertNotice(
                    "Package Selected",
                    "Royal Poruwa Wedding Banquet reserved. A catering manager will contact you."
                  )
                }
                className="w-full py-3 bg-[#E36727] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-amber-600 transition-all cursor-pointer"
              >
                Reserve This Package
              </button>
            </div>

            {/* Limited Package 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#26201d] border border-amber-500/40 space-y-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                    Reverent Sacred Offer
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-slate-900 dark:text-white mt-1">
                    Sacred Sanghika Dana Package
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-serif text-2xl font-extrabold text-amber-500">
                    LKR 1,850
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    Per Pax (Min 20)
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Includes 100% Pure Vegetarian menu options, Sangha Pooja Tray, traditional Claypot setup, guaranteed morning Sudu Dana delivery, Curd & Kitul Treacle, and reverent service staff.
              </p>
              <button
                onClick={() =>
                  showAlertNotice(
                    "Package Selected",
                    "Sacred Sanghika Dana Package reserved. Contacting coordinator..."
                  )
                }
                className="w-full py-3 bg-amber-500 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-amber-400 transition-all cursor-pointer"
              >
                Reserve This Package
              </button>
            </div>
          </div>
        </div>
      </section>

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

      {/* SERVICE DETAILS INFO MODAL */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {infoModalKey === "dana" ? (
              <div className="space-y-3">
                <span className="text-amber-500 text-xs font-bold uppercase tracking-wider">
                  Sacred Dana Alms-Giving
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  Sacred Dana Protocols & Menu
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  We follow strict purity standards for Sangha Alms Giving:
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>
                    Separate cookware and utensils used exclusively for vegetarian Dana preparation.
                  </li>
                  <li>
                    Precise morning (Sudu Dana) or midday (Dawal Dana) delivery timing guaranteed.
                  </li>
                  <li>Traditional clay pots and silver chafers setup included.</li>
                  <li>Buddha Pooja tray arranged separately with reverence.</li>
                </ul>
                <button
                  onClick={() => {
                    setIsInfoModalOpen(false);
                    setSelectedEvent("dana");
                    scrollToCalculator();
                  }}
                  className="w-full py-2.5 bg-[#E36727] text-white font-bold text-xs rounded-xl mt-2 cursor-pointer hover:bg-amber-600 transition-all"
                >
                  Calculate Cost for Dana
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-[#E36727] text-xs font-bold uppercase tracking-wider">
                  Specialized Service
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  {eventNames[infoModalKey as EventKey] || "Custom Event"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tailored multi-course menus, chafing dish warmers, uniformed servers, and hot transport to your venue location across Colombo.
                </p>
                <button
                  onClick={() => {
                    setIsInfoModalOpen(false);
                    if (infoModalKey !== "bbq") {
                      setSelectedEvent(infoModalKey as EventKey);
                    }
                    scrollToCalculator();
                  }}
                  className="w-full py-2.5 bg-[#E36727] text-white font-bold text-xs rounded-xl mt-2 cursor-pointer hover:bg-amber-600 transition-all"
                >
                  Get Instant Estimate
                </button>
              </div>
            )}
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
    </div>
  );
}
