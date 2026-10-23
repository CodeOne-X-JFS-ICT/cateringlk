"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrder } from "@/context/OrderContext";
import MapPinPicker, { calculateDistanceKm, MAX_DELIVERY_RADIUS_KM } from "@/components/MapPinPicker";

interface DeliveryZoneData {
  id: number;
  city_name: string;
  distance_km: number;
  estimated_delivery_mins: number;
  delivery_fee: number;
}

interface ProductItemData {
  id: number;
  name: string;
  description: string;
  price: number;
  portion_label: string;
  image_url: string;
  is_available: boolean;
}

interface ProductCategoryData {
  id: number;
  name: string;
  slug: string;
  emoji?: string;
  products: ProductItemData[];
}

export default function RestaurantPage() {
  const router = useRouter();
  const {
    setOrderType,
    verifiedLocation,
    setVerifiedLocation,
    isLocationVerified,
    setIsLocationVerified,
    deliveryCoords,
    setDeliveryCoords,
    distanceKm,
    setDistanceKm,
    setDeliveryZoneId,
    setDeliveryFee,
  } = useOrder();

  // Active Tab State: 'takeaway' | 'delivery'
  const [activeTab, setActiveTab] = useState<"takeaway" | "delivery">("takeaway");

  // Backend Data State
  const [categories, setCategories] = useState<ProductCategoryData[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delivery Location Input State
  const [selectedCity, setSelectedCity] = useState("");
  const [inputCity, setInputCity] = useState("");
  const [isCheckingZone, setIsCheckingZone] = useState(false);
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

  // Fetch takeaway products and delivery zones live from backend
  const fetchTakeawayData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, zoneRes] = await Promise.all([
        fetch("http://localhost:5050/api/public/products"),
        fetch("http://localhost:5050/api/public/delivery-zones"),
      ]);

      if (!prodRes.ok) {
        throw new Error("Failed to fetch takeaway menu from backend");
      }

      const prodJson = await prodRes.json();
      if (!prodJson.success || !Array.isArray(prodJson.data) || prodJson.data.length === 0) {
        throw new Error("No takeaway products returned from backend database");
      }

      setCategories(prodJson.data);

      if (zoneRes.ok) {
        const zoneJson = await zoneRes.json();
        if (zoneJson.success && Array.isArray(zoneJson.data)) {
          setDeliveryZones(zoneJson.data);
        }
      }

      setError(null);
    } catch (err: any) {
      console.error("Takeaway/Delivery data fetch error:", err);
      setError("Menu cannot be fetched! Backend service is offline or unreachable.");
      setCategories([]);
      setDeliveryZones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTakeawayData();
  }, []);

  /* TAKEAWAY ORDER FLOW */
  const startTakeawayOrder = () => {
    setOrderType("takeaway");
    setVerifiedLocation("Handapangoda Hub Pick-up Counter");
    setDeliveryZoneId(null);
    setDeliveryFee(0);
    setIsLocationVerified(true);
    router.push("/products");
  };

  /* DELIVERY LOCATION CHECKER LOGIC */
  const checkDeliveryLocation = async () => {
    const query = (selectedCity || inputCity).trim();

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

    setIsCheckingZone(true);
    try {
      const res = await fetch("http://localhost:5050/api/public/delivery-zones/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suburb: query }),
      });

      if (!res.ok) throw new Error("Delivery zone check failed");
      const json = await res.json();

      if (json.success && json.data?.eligible) {
        const data = json.data;
        setVerifiedLocation(data.city_name);
        setIsLocationVerified(true);
        setDeliveryZoneId(data.id);
        setDeliveryFee(parseFloat(data.delivery_fee));
        setDistanceKm(parseFloat(data.distance_km));
        setDeliveryResultMsg(
          <div className="flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <i className="fa-solid fa-circle-check text-base mt-0.5 shrink-0"></i>
            <div>
              <div>
                Great News! <strong>&quot;{data.city_name.toUpperCase()}&quot;</strong> is within our 6km express delivery radius ({data.distance_km}km from Hub).
              </div>
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Estimated delivery: {data.estimated_delivery_mins} mins • Delivery Fee: Rs. {Number(data.delivery_fee).toLocaleString()}
              </div>
            </div>
          </div>
        );
      } else {
        setIsLocationVerified(false);
        setDeliveryZoneId(null);
        setDeliveryFee(0);
        setDeliveryResultMsg(
          <div className="flex items-start gap-2.5 text-red-600 dark:text-red-400 font-bold">
            <i className="fa-solid fa-circle-xmark text-base mt-0.5 shrink-0"></i>
            <div>
              <div className="uppercase tracking-wide">You are in out of 6km radius, Delivery unavailable</div>
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                <strong>&quot;{query.toUpperCase()}&quot;</strong> is outside our 6km express delivery radius. Please select Takeaway Pick-up or choose a location within 6km.
              </div>
            </div>
          </div>
        );
      }
    } catch {
      setIsLocationVerified(false);
      setDeliveryResultMsg(
        <span className="text-red-500 font-bold">
          <i className="fa-solid fa-circle-exclamation mr-1"></i> Delivery check unavailable (Backend service offline).
        </span>
      );
    } finally {
      setIsCheckingZone(false);
    }
  };

  /* MAP PIN LOCATION SELECTOR HANDLER */
  const handleMapLocationSelect = async (
    formattedAddr: string,
    lat: number,
    lng: number,
    mapsUrl: string,
    isEligible: boolean,
    dist: number
  ) => {
    setDeliveryCoords({ lat, lng });
    setDistanceKm(dist);

    if (!isEligible) {
      setIsLocationVerified(false);
      setDeliveryZoneId(null);
      setDeliveryFee(0);
      setDeliveryResultMsg(
        <div className="flex items-start gap-2.5 text-red-600 dark:text-red-400 font-bold">
          <i className="fa-solid fa-circle-xmark text-base mt-0.5 shrink-0"></i>
          <div>
            <div className="uppercase tracking-wide">You are in out of 6km radius, Delivery unavailable</div>
            <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
              Pinned location is <strong>{dist.toFixed(2)} km</strong> from Handapangoda Hub (Limit: 6.0 km). Express delivery is unavailable. Please select Takeaway or pin within the dashed circle.
            </div>
          </div>
        </div>
      );
      return;
    }

    // Within 6km - check backend for nearest delivery zone and fee
    setIsCheckingZone(true);
    try {
      const res = await fetch("http://localhost:5050/api/public/delivery-zones/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
      const json = await res.json();
      if (json.success && json.data?.eligible) {
        const data = json.data;
        const locName = data.city_name || "Handapangoda Hub Zone";
        setVerifiedLocation(locName);
        setIsLocationVerified(true);
        setDeliveryZoneId(data.id || 1);
        setDeliveryFee(parseFloat(data.delivery_fee || 250));
        setDeliveryResultMsg(
          <div className="flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <i className="fa-solid fa-circle-check text-base mt-0.5 shrink-0"></i>
            <div>
              <div>
                GPS Location Verified: <strong>&quot;{locName.toUpperCase()}&quot;</strong> is inside 6km delivery radius ({dist.toFixed(2)} km from Hub).
              </div>
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Estimated delivery: {data.estimated_delivery_mins || 25} mins • Delivery Fee: Rs. {Number(data.delivery_fee).toLocaleString()} • Doorstep: {formattedAddr.split("(")[0]}
              </div>
            </div>
          </div>
        );
      } else {
        setIsLocationVerified(false);
        setDeliveryZoneId(null);
        setDeliveryFee(0);
        setDeliveryResultMsg(
          <div className="flex items-start gap-2.5 text-red-600 dark:text-red-400 font-bold">
            <i className="fa-solid fa-circle-xmark text-base mt-0.5 shrink-0"></i>
            <div>
              <div className="uppercase tracking-wide">You are in out of 6km radius, Delivery unavailable</div>
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Location ({dist.toFixed(2)} km) is outside our 6km express delivery limit. Please select Takeaway instead.
              </div>
            </div>
          </div>
        );
      }
    } catch {
      setVerifiedLocation("Handapangoda Hub Zone");
      setIsLocationVerified(true);
      setDeliveryFee(250);
      setDeliveryResultMsg(
        <div className="flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <i className="fa-solid fa-circle-check text-base mt-0.5 shrink-0"></i>
          <span>
            GPS Location Verified ({dist.toFixed(2)} km from Hub): Inside 6km express delivery radius.
          </span>
        </div>
      );
    } finally {
      setIsCheckingZone(false);
    }
  };

  /* REAL BROWSER GPS AUTO-DETECTION */
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlertNotice(
        "Geolocation Not Supported",
        "Geolocation is not supported by your browser. Please select your suburb from the list or pin on the map."
      );
      return;
    }

    setIsCheckingZone(true);
    setDeliveryResultMsg(
      <span className="text-amber-500 flex items-center gap-1.5 font-bold">
        <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block"></span>
        Acquiring current GPS coordinates from your device...
      </span>
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const dist = calculateDistanceKm(lat, lng);
        setDeliveryCoords({ lat, lng });
        setDistanceKm(dist);

        if (dist > MAX_DELIVERY_RADIUS_KM) {
          setIsLocationVerified(false);
          setDeliveryZoneId(null);
          setDeliveryFee(0);
          setDeliveryResultMsg(
            <div className="flex items-start gap-2.5 text-red-600 dark:text-red-400 font-bold">
              <i className="fa-solid fa-circle-xmark text-base mt-0.5 shrink-0"></i>
              <div>
                <div className="uppercase tracking-wide">You are in out of 6km radius, Delivery unavailable</div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                  Your device GPS location is <strong>{dist.toFixed(2)} km</strong> from Handapangoda Hub (Limit: 6.0 km). Express delivery is unavailable. Please select Takeaway Pick-up.
                </div>
              </div>
            </div>
          );
          setIsCheckingZone(false);
          return;
        }

        // Within 6km - reverse geocode & check backend
        let cleanAddr = `GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { "User-Agent": "AhasGawwaCateringDelivery/1.0" } }
          );
          const revJson = await revRes.json();
          if (revJson.display_name) cleanAddr = revJson.display_name;
        } catch {}

        await handleMapLocationSelect(cleanAddr, lat, lng, "", true, dist);
      },
      (err) => {
        console.warn("GPS error:", err);
        setIsCheckingZone(false);
        setDeliveryResultMsg(
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            <i className="fa-solid fa-triangle-exclamation mr-1"></i> Unable to access GPS. Please allow location permissions or pin directly on the map.
          </span>
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const startDeliveryOrder = () => {
    if (!isLocationVerified) return;
    setOrderType("delivery");
    router.push("/products");
  };

  // Extract a few featured dishes across categories to show preview
  const featuredDishes = categories.flatMap((cat) => cat.products || []).slice(0, 3);

  return (
    <div className="w-full transition-colors duration-300 font-sans">
      {/* HERO SECTION */}
      <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden py-16 sm:py-10 bg-white dark:bg-[#0f0d0c]">
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
            <i className="fa-solid fa-utensils"></i> Handapangoda Dining & Express Delivery Hub
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Savor Authentic Sri Lankan & International{" "}
            <span className="gold-gradient-text">
              Flavors Fresh From Our Kitchen
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-xl text-slate-900 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Choose your order preference below: Arrange quick takeaway pick-up or verify your 6km radius for express hot delivery.
          </p>

          {/* Order Mode Switcher Tabs (Takeaway, Delivery 6km) */}
          <div className="mt-8 max-w-2xl mx-auto bg-[#FFFBF8]/95 dark:bg-[#1a1614]/95 border border-amber-500/40 p-3 sm:p-4 rounded-3xl portal-card-shadow backdrop-blur-md">
            <div className="grid grid-cols-2 gap-2 text-center">
              <button
                type="button"
                onClick={() => setActiveTab("takeaway")}
                className={`py-3 px-3 sm:px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "takeaway"
                    ? "bg-[#E36727] text-white shadow-md"
                    : "bg-[#FBEAD9] dark:bg-[#26201d] text-slate-700 dark:text-slate-300 hover:text-[#E36727]"
                }`}
              >
                <i
                  className={`fa-solid fa-bag-shopping ${
                    activeTab === "takeaway" ? "text-white" : "text-amber-500"
                  }`}
                ></i>
                <span>Takeaway Pick-up</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("delivery")}
                className={`py-3 px-3 sm:px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "delivery"
                    ? "bg-[#E36727] text-white shadow-md"
                    : "bg-[#FBEAD9] dark:bg-[#26201d] text-slate-700 dark:text-slate-300 hover:text-[#E36727]"
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
          {/* Global Loading Spinner */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-24 space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E36727]"></div>
              <p className="text-xs text-slate-500 font-bold animate-pulse">
                Loading live menu and service zones from backend...
              </p>
            </div>
          ) : error || categories.length === 0 ? (
            /* Backend Offline Error Banner (Strictly NO fake UI) */
            <div className="py-16 px-6 rounded-3xl bg-red-500/10 border-2 border-red-500/30 text-center space-y-4 max-w-2xl mx-auto my-6 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-500 flex items-center justify-center text-3xl mx-auto shadow-xs">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-red-600 dark:text-red-400">
                Menu cannot be fetched!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                All takeaway meal ranges and express delivery services must be loaded live from the backend database. The backend server is currently offline or unreachable. Please verify that the backend is running and try again.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={fetchTakeawayData}
                  className="px-6 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer transform hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-arrows-rotate mr-2"></i> Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: TAKEAWAY */}
              {activeTab === "takeaway" && (
                <div className="space-y-12 animate-in fade-in duration-300">
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

                  {/* 3 Pillars */}
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

                  {/* Live Backend Meal Ranges Grid */}
                  <div className="space-y-6">
                    <div className="text-center max-w-xl mx-auto">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
                        Live Kitchen Catalog
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                        Signature Meal Ranges
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Select any meal category below to explore portions and place your takeaway order.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {categories.map((cat) => {
                        const count = cat.products ? cat.products.length : 0;
                        return (
                          <div
                            key={cat.id}
                            onClick={startTakeawayOrder}
                            className="p-5 rounded-3xl bg-[#FFFBF8] dark:bg-[#1a1614] border border-amber-500/30 hover:border-[#E36727] text-center space-y-2 cursor-pointer transition-all transform hover:-translate-y-1 shadow-xs group"
                          >
                            <div className="text-3xl mb-1">{cat.emoji || "🍽️"}</div>
                            <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#E36727] transition-colors">
                              {cat.name}
                            </h4>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              {count} Items Live
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Featured Live Dishes Preview */}
                  {featuredDishes.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
                            Chef Specials
                          </span>
                          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                            Popular Takeaway Favorites
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={startTakeawayOrder}
                          className="text-xs font-bold text-[#E36727] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Full Catalog</span>
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredDishes.map((dish) => (
                          <div
                            key={dish.id}
                            className="rounded-3xl bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:border-[#E36727] transition-all flex flex-col justify-between"
                          >
                            <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-black/20">
                              <img
                                src={dish.image_url}
                                alt={dish.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                              <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-amber-400">
                                {dish.portion_label || "Regular"}
                              </span>
                            </div>

                            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                                  {dish.name}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                  {dish.description}
                                </p>
                              </div>

                              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                                <span className="font-serif text-lg font-extrabold text-[#E36727]">
                                  Rs. {Number(dish.price).toLocaleString()}
                                </span>
                                <button
                                  type="button"
                                  onClick={startTakeawayOrder}
                                  className="px-3.5 py-1.5 bg-[#E36727] hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                                >
                                  Order
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Takeaway Call-to-Action Box */}
                  <div className="p-8 rounded-3xl bg-gradient-to-r from-[#E36727] to-amber-600 text-white text-center space-y-4 portal-card-shadow">
                    <h3 className="font-serif font-extrabold text-2xl sm:text-3xl">
                      Ready to Pick Up Your Favorite Meal?
                    </h3>
                    <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto">
                      Explore all signature meal ranges (Fried Rice, Kottu, Noodles, Bites & Specials) with dynamic portion choices and instant basket ordering.
                    </p>
                    <button
                      type="button"
                      onClick={startTakeawayOrder}
                      className="px-8 py-3.5 bg-white text-slate-900 hover:bg-amber-100 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <i className="fa-solid fa-bag-shopping text-[#E36727] mr-1"></i>{" "}
                      Browse & Order Now for Takeaway
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: DELIVERY (6KM RADIUS) */}
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
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Search & Checker Inputs (Left) */}
                    <div className="lg:col-span-5 bg-[#FBEAD9] dark:bg-[#1a1614] border border-amber-200 dark:border-amber-200/40 p-6 sm:p-8 rounded-3xl space-y-5 shadow-lg">
                      <label className="block text-xs font-extrabold text-amber-500 uppercase tracking-wider">
                        Check Delivery Eligibility in Your Suburb
                      </label>

                      <div className="space-y-3">
                        {/* City Dropdown from Backend Delivery Zones */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                            Select Suburb / City (Live Zones)
                          </label>
                          <select
                            value={selectedCity}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedCity(val);
                              setInputCity("");
                              const matchedZone = deliveryZones.find((z) => z.city_name === val);
                              if (matchedZone) {
                                setVerifiedLocation(matchedZone.city_name);
                                setIsLocationVerified(true);
                                setDeliveryZoneId(matchedZone.id);
                                setDeliveryFee(parseFloat(matchedZone.delivery_fee as any));
                                setDeliveryResultMsg(
                                  <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                                    <i className="fa-solid fa-circle-check mr-1"></i> Selected:{" "}
                                    <strong>&quot;{matchedZone.city_name.toUpperCase()}&quot;</strong> ({matchedZone.distance_km}km from Hub). Estimated delivery: {matchedZone.estimated_delivery_mins} mins. Delivery Fee: Rs. {Number(matchedZone.delivery_fee).toLocaleString()}.
                                  </span>
                                );
                              } else {
                                setIsLocationVerified(false);
                                setDeliveryZoneId(null);
                                setDeliveryFee(0);
                                setDeliveryResultMsg(
                                  <span className="text-slate-500">
                                    <i className="fa-solid fa-circle-info text-amber-500 mr-1"></i> Select a city
                                    above or use GPS to verify if your location is within the 6km express radius.
                                  </span>
                                );
                              }
                            }}
                            className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#E36727] cursor-pointer"
                          >
                            <option value="">-- Choose Suburb near Handapangoda --</option>
                            {deliveryZones.map((zone) => (
                              <option key={zone.id} value={zone.city_name}>
                                {zone.city_name} ({zone.distance_km}km — Est. {zone.estimated_delivery_mins} mins)
                              </option>
                            ))}
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
                            placeholder="Or type suburb name e.g. Padukka, Horana, Meepe..."
                            className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727] font-medium"
                          />
                          <button
                            type="button"
                            onClick={checkDeliveryLocation}
                            disabled={isCheckingZone}
                            className="px-5 py-2.5 bg-[#E36727] hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                          >
                            {isCheckingZone ? "Checking..." : "Verify"}
                          </button>
                        </div>

                        {/* Use My Current Location Button */}
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={isCheckingZone}
                          className="w-full py-2.5 bg-slate-200 dark:bg-[#26201d] border border-slate-300 dark:border-white/10 hover:border-[#E36727] text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <i className={`fa-solid fa-location-crosshairs text-[#E36727] ${isCheckingZone ? "animate-spin" : ""}`}></i>
                          <span>{isCheckingZone ? "Detecting GPS Location..." : "Use My Current GPS Location"}</span>
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
                            : "bg-slate-400 text-white opacity-60 cursor-not-allowed"
                        }`}
                      >
                        {isLocationVerified
                          ? `Proceed to Order for Delivery (${verifiedLocation})`
                          : "Delivery Unavailable (Verify Location to Unlock)"}
                      </button>
                    </div>

                    {/* Interactive Map Canvas with 6km Radius (Right) */}
                    <div className="lg:col-span-7 bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl">
                      <MapPinPicker
                        zoneName={verifiedLocation}
                        initialLat={deliveryCoords?.lat}
                        initialLng={deliveryCoords?.lng}
                        onLocationSelect={handleMapLocationSelect}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
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
