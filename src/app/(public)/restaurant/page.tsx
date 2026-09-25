"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrder } from "@/context/OrderContext";

export default function RestaurantPage() {
  const router = useRouter();
  const {
    setOrderType,
    verifiedLocation,
    setVerifiedLocation,
    isLocationVerified,
    setIsLocationVerified,
  } = useOrder();

  // Active Tab State: 'dining' | 'takeaway' | 'delivery'
  const [activeTab, setActiveTab] = useState<"dining" | "takeaway" | "delivery">(
    "takeaway"
  );

  // Delivery Location Input State
  const [selectedCity, setSelectedCity] = useState("");
  const [inputCity, setInputCity] = useState("");
  const [deliveryResultMsg, setDeliveryResultMsg] = useState<React.ReactNode>(
    <span className="text-slate-500">
      <i className="fa-solid fa-circle-info text-amber-500 mr-1"></i> Select a city
      above or use GPS to verify if your location is within the 6km express radius.
    </span>
  );

  // Notice Modal State
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");

  const showAlertNotice = (title: string, desc: string) => {
    setNoticeTitle(title);
    setNoticeDesc(desc);
    setIsNoticeOpen(true);
  };

  /* TAKEAWAY ORDER FLOW */
  const startTakeawayOrder = () => {
    setOrderType("takeaway");
    setVerifiedLocation("Handapangoda Hub Pick-up Counter");
    router.push("/products");
  };

  /* DELIVERY LOCATION CHECKER LOGIC */
  const checkDeliveryLocation = () => {
    const query = (selectedCity || inputCity).toLowerCase().trim();

    if (!query) {
      setDeliveryResultMsg(
        <span className="text-amber-500">
          <i className="fa-solid fa-circle-exclamation mr-1"></i> Please select or
          type your suburb name above.
        </span>
      );
      setIsLocationVerified(false);
      return;
    }

    const validSuburbs = [
      "handapangoda",
      "padukka",
      "ingiriya",
      "horana",
      "bope",
      "meepe",
    ];
    const match = validSuburbs.some((s) => query.includes(s));

    if (match) {
      const locName = selectedCity || inputCity;
      setVerifiedLocation(locName);
      setIsLocationVerified(true);
      setDeliveryResultMsg(
        <span className="text-emerald-500 dark:text-emerald-400 font-bold">
          <i className="fa-solid fa-circle-check mr-1"></i> Great News!{" "}
          <strong>&quot;{locName.toUpperCase()}&quot;</strong> is within our 6km express
          delivery radius. Estimated delivery: 35 mins.
        </span>
      );
    } else {
      setIsLocationVerified(false);
      setDeliveryResultMsg(
        <span className="text-[#E36727] font-bold">
          <i className="fa-solid fa-triangle-exclamation mr-1"></i>{" "}
          <strong>&quot;{(selectedCity || inputCity).toUpperCase()}&quot;</strong> is
          beyond our 6km express delivery limit. Please select Takeaway or call
          manager.
        </span>
      );
    }
  };

  const useCurrentLocationSim = () => {
    setSelectedCity("Padukka");
    setInputCity("");
    setVerifiedLocation("Padukka");
    setIsLocationVerified(true);
    setDeliveryResultMsg(
      <span className="text-emerald-500 dark:text-emerald-400 font-bold">
        <i className="fa-solid fa-circle-check mr-1"></i> GPS Dropped:{" "}
        <strong>&quot;PADUKKA (3.5KM FROM HUB)&quot;</strong> is inside 6km express
        delivery radius.
      </span>
    );
  };

  const startDeliveryOrder = () => {
    if (!isLocationVerified) return;
    setOrderType("delivery");
    router.push("/products");
  };

  return (
    <div className="w-full transition-colors duration-300 font-sans">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 sm:py-10 bg-white dark:bg-[#0f0d0c]">
        {/* Animated Ken Burns Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=80"
            alt="Dining & Restaurant Experience"
            className="w-full h-full object-cover object-center animate-hero-kenburns opacity-50 dark:opacity-30 filter contrast-105"
          />
          {/* Ambient Particle Grid Overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E36727_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs sm:text-sm font-extrabold mb-6 shadow-sm">
            <i className="fa-solid fa-utensils"></i> Handapangoda Dining & Express
            Delivery Hub
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Savor Authentic Sri Lankan & International{" "}
            <span className="gold-gradient-text">
              Flavors Fresh From Our Kitchen
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-xl text-slate-900 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Choose your order preference below: Book a private dining table, arrange quick takeaway pick-up, or verify your 6km radius for express hot delivery.
          </p>

          {/* Order Mode Switcher Tabs (Dining, Takeaway, Delivery 6km) */}
          <div className="mt-8 max-w-2xl mx-auto bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-amber-500/40 p-3 sm:p-4 rounded-3xl portal-card-shadow backdrop-blur-md">
            <div className="grid grid-cols-2 gap-2 text-center">
              
              <button
                type="button"
                onClick={() => setActiveTab("takeaway")}
                className={`py-3 px-3 sm:px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "takeaway"
                    ? "bg-[#E36727] text-white shadow-md"
                    : "bg-#FBEAD9 dark:bg-[#26201d] text-slate-700 dark:text-slate-300 hover:text-[#E36727]"
                }`}
              >
                <i
                  className={`fa-solid fa-bag-shopping ${
                    activeTab === "takeaway" ? "text-white" : "text-amber-500"
                  }`}
                ></i>
                <span>Takeaway</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("delivery")}
                className={`py-3 px-3 sm:px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "delivery"
                    ? "bg-[#E36727] text-white shadow-md"
                    : "bg-#FBEAD9 dark:bg-[#26201d] text-slate-700 dark:text-slate-300 hover:text-[#E36727]"
                }`}
              >
                <i
                  className={`fa-solid fa-motorcycle ${
                    activeTab === "delivery" ? "text-white" : "text-amber-500"
                  }`}
                ></i>
                <span>Delivery (6km)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TAB CONTENT CONTAINER */}
      <section className="py-12 sm:py-16 bg-white dark:bg-[#0f0d0c] border-t border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* TAB 2: TAKEAWAY */}
          {activeTab === "takeaway" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
                  Express Pick-up Counter
                </span>
                <h2 className="font-serif text-3xl font-extrabold text-slate-900 dark:text-white">
                  Takeaway Meals & Quick Pick-up
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Order hot, fresh meal ranges online and collect them ready at our Handapangoda restaurant takeaway counter.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-[#FFFBF8] dark:bg-[#1a1614] border border-amber-500/40 dark:border-amber-500/40 hover:border-[#E36727]/70 space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Ready in 20-25 Minutes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your order is freshly prepared immediately upon submission. No waiting in line at the counter.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-[#FFFBF8] dark:bg-[#1a1614] border border-amber-500/40 dark:border-amber-500/40 hover:border-[#E36727]/70 space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#E36727]/10 text-[#E36727] flex items-center justify-center text-xl">
                    <i className="fa-solid fa-box font-bold"></i>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Insulated Eco Packaging
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Packed in leak-proof, heat-retaining containers keeping your Fried Rice, Kottu, and BBQ piping hot.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-[#FFFBF8] dark:bg-[#1a1614] border border-amber-500/40 dark:border-amber-500/40 hover:border-[#E36727]/70 space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                    <i className="fa-solid fa-wallet"></i>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Zero Delivery Charge
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Pay only for the food items. Pay online via card or cash upon collection at the counter.
                  </p>
                </div>
              </div>

              {/* Takeaway Call-to-Action Box */}
              <div className="p-8 rounded-3xl bg-gradient-to-r from-[#E36727] to-amber-600 text-white text-center space-y-4 portal-card-shadow">
                <h3 className="font-serif font-extrabold text-2xl sm:text-3xl">
                  Ready to Pick Up Your Favorite Meal?
                </h3>
                <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto">
                  Explore our 5 signature meal ranges (Fried Rice, Kottu, Noodles, Pizza & Specials) and add items to your basket.
                </p>
                <button
                  type="button"
                  onClick={startTakeawayOrder}
                  className="px-8 py-3.5 bg-white text-slate-900 hover:bg-amber-100 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <i className="fa-solid fa-bag-shopping text-[#E36727] mr-1"></i>{" "}
                  Order Now for Takeaway
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DELIVERY (6KM RADIUS) */}
          {activeTab === "delivery" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
                  Hot Express Delivery
                </span>
                <h2 className="font-serif text-3xl font-extrabold text-slate-900 dark:text-white">
                  6km Radius Service Checker
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  We deliver hot meals within a strict 6km radius from our Handapangoda Hub to guarantee food quality.
                </p>
              </div>

              {/* Interactive Location Eligibility Checker & Map Simulation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Search & Checker Inputs (Left) */}
                <div className="lg:col-span-6 bg-[#FBEAD9] dark:bg-[#1a1614] border border-amber-200 dark:border-amber-200/40 p-6 sm:p-8 rounded-3xl space-y-5 shadow-lg">
                  <label className="block text-xs font-extrabold text-amber-500 uppercase tracking-wider">
                    Check Delivery Eligibility in Your Suburb
                  </label>

                  <div className="space-y-3">
                    {/* City Dropdown */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Select Suburb / City
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          setInputCity("");
                        }}
                        className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#E36727] cursor-pointer"
                      >
                        <option value="">-- Choose Suburb near Handapangoda --</option>
                        <option value="Handapangoda (Hub)">
                          Handapangoda (Central Hub - 0km)
                        </option>
                        <option value="Padukka">Padukka (3.5km)</option>
                        <option value="Ingiriya">Ingiriya (4.8km)</option>
                        <option value="Horana">Horana (5.2km)</option>
                        <option value="Bope">Bope (2.1km)</option>
                        <option value="Meepe">Meepe (5.9km)</option>
                        <option value="Colombo">Colombo (&gt; 6km - Out of Range)</option>
                        <option value="Maharagama">
                          Maharagama (&gt; 6km - Out of Range)
                        </option>
                        <option value="Gampaha">Gampaha (&gt; 6km - Out of Range)</option>
                      </select>
                    </div>

                    {/* Manual City Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputCity}
                        onChange={(e) => {
                          setInputCity(e.target.value);
                          setSelectedCity("");
                        }}
                        placeholder="Or type suburb name e.g. Padukka, Horana..."
                        className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium"
                      />
                      <button
                        type="button"
                        onClick={checkDeliveryLocation}
                        className="px-5 py-2.5 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                      >
                        Verify
                      </button>
                    </div>

                    {/* Use My Current Location Button */}
                    <button
                      type="button"
                      onClick={useCurrentLocationSim}
                      className="w-full py-2.5 bg-slate-200 dark:bg-[#26201d] border border-slate-300 dark:border-white/10 hover:border-[#E36727] text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <i className="fa-solid fa-location-crosshairs text-[#E36727]"></i>
                      <span>Use My Current GPS Location</span>
                    </button>
                  </div>

                  {/* Result Feedback Box */}
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 text-xs font-semibold min-h-[50px] flex items-center">
                    {deliveryResultMsg}
                  </div>

                  {/* Action Button: Activated when verified */}
                  <button
                    type="button"
                    disabled={!isLocationVerified}
                    onClick={startDeliveryOrder}
                    className={`w-full py-3.5 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md ${
                      isLocationVerified
                        ? "bg-[#E36727] hover:bg-amber-600 text-white cursor-pointer shadow-lg transform hover:scale-[1.01]"
                        : "bg-slate-400 text-white cursor-not-allowed"
                    }`}
                  >
                    {isLocationVerified
                      ? `Proceed to Order for Delivery (${verifiedLocation})`
                      : "Verify Location to Unlock Order Now"}
                  </button>
                </div>

                {/* Map Graphic Simulation (Right) */}
                <div className="lg:col-span-6 bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-3xl p-4 shadow-xl">
                  <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900">
                    <iframe
                      title="Catering by Ahas Gawwa Official Location Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63384.46628298207!2d80.14106971664121!3d6.826972822009899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3b3003f850aef%3A0x1a81112e03fc4530!2sCATERING%20by%20AHAS%20GAWWA!5e0!3m2!1sen!2slk!4v1786599526916!5m2!1sen!2slk"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="w-full h-full filter contrast-105 opacity-80"
                    ></iframe>

                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-[11px] font-bold text-amber-400">
                      <i className="fa-solid fa-bullseye text-[#E36727]"></i> 6km Express
                      Delivery Zone
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* NOTICE MODAL */}
      {isNoticeOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-circle-info"></i>
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              {noticeTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {noticeDesc}
            </p>
            <button
              type="button"
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
