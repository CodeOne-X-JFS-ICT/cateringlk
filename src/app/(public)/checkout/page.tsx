"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrder } from "@/context/OrderContext";
import MapPinPicker from "@/components/MapPinPicker";

const TAKEAWAY_PAYMENT_OPTIONS = [
  { label: "Cash on Collection", code: "Cash on Collection", icon: "fa-solid fa-money-bill-wave" },
  { label: "Card on Collection", code: "Card on Collection", icon: "fa-solid fa-credit-card" },
];

const DELIVERY_PAYMENT_OPTIONS = [
  { label: "Cash on Delivery", code: "Cash on Delivery", icon: "fa-solid fa-money-bill-wave" },
  { label: "Online Transactions", code: "Online Transactions", icon: "fa-solid fa-globe" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    cartSubtotal,
    orderType,
    setOrderType,
    verifiedLocation,
    deliveryZoneId,
    deliveryFee: contextDeliveryFee,
    clearCart,
  } = useOrder();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [timeSlot, setTimeSlot] = useState("ASAP (30-40 mins)");
  const [address, setAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceFromHub, setDistanceFromHub] = useState<number | null>(null);
  const [isOutOfRadius, setIsOutOfRadius] = useState<boolean>(false);

  const paymentOptions =
    orderType === "takeaway" ? TAKEAWAY_PAYMENT_OPTIONS : DELIVERY_PAYMENT_OPTIONS;

  const [paymentMethod, setPaymentMethod] = useState(
    orderType === "takeaway" ? "Cash on Collection" : "Cash on Delivery"
  );

  useEffect(() => {
    if (orderType === "takeaway") {
      setPaymentMethod((prev) =>
        prev === "Cash on Collection" || prev === "Card on Collection"
          ? prev
          : "Cash on Collection"
      );
      setIsOutOfRadius(false);
      if (errorMsg === "You are in out of 6km radius, Delivery unavailable") {
        setErrorMsg(null);
      }
    } else {
      setPaymentMethod((prev) =>
        prev === "Cash on Delivery" || prev === "Online Transactions"
          ? prev
          : "Cash on Delivery"
      );
    }
  }, [orderType]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState<{
    orderId: string;
    custName: string;
    custPhone: string;
    mode: string;
    time: string;
    payment: string;
    total: number;
  } | null>(null);

  const deliveryFee = orderType === "delivery" ? (contextDeliveryFee || 250) : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (orderType === "delivery") {
      if (isOutOfRadius) {
        setErrorMsg("You are in out of 6km radius, Delivery unavailable");
        return;
      }
      if (!address.trim()) {
        setErrorMsg("Please enter your complete delivery street address.");
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        order_type: orderType.toUpperCase(),
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        delivery_address: orderType === "delivery" ? address.trim() : null,
        delivery_zone_id: orderType === "delivery" ? (deliveryZoneId || 1) : null,
        verified_location: verifiedLocation,
        latitude: orderType === "delivery" ? userCoords?.lat : null,
        longitude: orderType === "delivery" ? userCoords?.lng : null,
        distance_km: orderType === "delivery" ? distanceFromHub : null,
        time_slot: timeSlot,
        payment_method: paymentMethod,
        special_instructions: specialInstructions.trim() || null,
        items: cart.map((item) => ({
          product_id: parseInt(item.id, 10),
          quantity: item.qty,
        })),
      };

      const res = await fetch("http://localhost:5050/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to process order. Please try again.");
      }

      const orderData = json.data;
      const ref = orderData.order_ref;

      const details = {
        orderId: ref,
        custName: orderData.customer_name,
        custPhone: orderData.customer_phone,
        mode: `${orderData.order_type} (${orderData.verified_location || "Pick-up"})`,
        time: orderData.time_slot || timeSlot,
        payment: orderData.payment_method,
        total: parseFloat(orderData.grand_total),
      };

      setReceiptDetails(details);
      setIsReceiptOpen(true);
      clearCart();
    } catch (err: any) {
      console.error("Order placement error:", err);
      setErrorMsg(err.message || "An unexpected error occurred while placing your order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishOrder = () => {
    setIsReceiptOpen(false);
    router.push("/takeaway&delivery");
  };

  return (
    <div className="w-full min-h-screen py-10 transition-colors duration-300 font-sans bg-white dark:bg-[#0f0d0c] text-slate-800 dark:text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#E36727] hover:underline"
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Product Menu
        </Link>

        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[#E36727] text-xs font-extrabold uppercase tracking-widest bg-[#E36727]/10 px-3.5 py-1 rounded-full border border-[#E36727]/20 inline-block">
            Finalize Order
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Review & Place Your Order
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Confirm your item list, pick-up or delivery details, and select your preferred payment option.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="max-w-5xl mx-auto p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-base"></i>
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-red-700 cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Customer Information Form (Left) */}
          <div className="lg:col-span-7 bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-lg">
            <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-white/10">
              Customer Information
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
              {/* Order Fulfillment Mode Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Order Type / Fulfillment Mode *
                </label>
                <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 dark:bg-[#26201d] rounded-2xl border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType("takeaway");
                      setIsOutOfRadius(false);
                      if (errorMsg === "You are in out of 6km radius, Delivery unavailable") {
                        setErrorMsg(null);
                      }
                    }}
                    className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      orderType === "takeaway"
                        ? "bg-white dark:bg-[#1a1614] text-[#E36727] shadow-sm border border-[#E36727]/30 ring-1 ring-[#E36727]/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <i className="fa-solid fa-bag-shopping"></i>
                    <span>Takeaway Pick-up</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderType("delivery");
                    }}
                    className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      orderType === "delivery"
                        ? "bg-white dark:bg-[#1a1614] text-[#E36727] shadow-sm border border-[#E36727]/30 ring-1 ring-[#E36727]/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <i className="fa-solid fa-motorcycle"></i>
                    <span>Doorstep Delivery (6km)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kasun Kalhara"
                  className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="077 123 4567"
                    className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {orderType === "delivery"
                      ? "Target Delivery Time"
                      : "Desired Pick-up Time"}
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#E36727] cursor-pointer"
                  >
                    <option value="ASAP (30-40 mins)">ASAP (30-40 mins)</option>
                    <option value="12:30 PM Lunch Slot">12:30 PM Lunch Slot</option>
                    <option value="1:30 PM Lunch Slot">1:30 PM Lunch Slot</option>
                    <option value="7:30 PM Dinner Slot">7:30 PM Dinner Slot</option>
                    <option value="8:30 PM Dinner Slot">8:30 PM Dinner Slot</option>
                  </select>
                </div>
              </div>

              {/* Delivery Address & Map Pinning if delivery */}
              {orderType === "delivery" && (
                <div className="space-y-4 pt-1">
                  {/* Interactive Map Pin Picker */}
                  <MapPinPicker
                    zoneName={verifiedLocation}
                    initialLat={userCoords?.lat}
                    initialLng={userCoords?.lng}
                    onLocationSelect={(formattedAddr, lat, lng, mapsUrl, isEligible, dist) => {
                      setUserCoords({ lat, lng });
                      setDistanceFromHub(dist);
                      setIsOutOfRadius(!isEligible);
                      if (isEligible) {
                        setAddress(formattedAddr);
                        if (errorMsg === "You are in out of 6km radius, Delivery unavailable") {
                          setErrorMsg(null);
                        }
                      } else {
                        setErrorMsg("You are in out of 6km radius, Delivery unavailable");
                      }
                    }}
                  />

                  {/* Out of radius alert banner */}
                  {isOutOfRadius && (
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-base shrink-0"></i>
                        <span>
                          <strong>Notice:</strong> You are in out of 6km radius, Delivery unavailable ({distanceFromHub?.toFixed(1)} km from Catering Hub).
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderType("takeaway");
                          setIsOutOfRadius(false);
                          setErrorMsg(null);
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-all shrink-0 shadow-xs"
                      >
                        Switch to Takeaway
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Delivery Address & Doorstep Notes *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Auto-filled by pinning on map above. You may add house number, apartment or gate color..."
                      className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Special Kitchen Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Less spicy, extra sauce, call upon arrival..."
                  className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                />
              </div>

              {/* Payment Choice */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentOptions.map((opt) => (
                    <label
                      key={opt.code}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === opt.code
                          ? "border-[#E36727] bg-[#E36727]/10 ring-1 ring-[#E36727]"
                          : "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#26201d] hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={opt.code}
                        checked={paymentMethod === opt.code}
                        onChange={() => setPaymentMethod(opt.code)}
                        className="accent-[#E36727]"
                      />
                      <i className={`${opt.icon} text-amber-500 text-sm`}></i>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0 || submitting || (orderType === "delivery" && isOutOfRadius)}
                className={`w-full py-4 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${
                  cart.length === 0 || submitting || (orderType === "delivery" && isOutOfRadius)
                    ? "bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed pointer-events-none"
                    : "bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] cursor-pointer"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Placing Your Order in Database...</span>
                  </>
                ) : orderType === "delivery" && isOutOfRadius ? (
                  <span>Delivery Unavailable (Out of 6km Radius)</span>
                ) : (
                  <span>Confirm & Place Order Now</span>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Breakdown (Right) */}
          <div className="lg:col-span-5 bg-[#FFFBF8] dark:bg-[#1a1614] border border-amber-500/30 p-6 rounded-3xl space-y-5 shadow-lg portal-card-shadow">
            <div className="pb-3 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                Order Summary
              </h3>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#E36727]/10 text-[#E36727] border border-[#E36727]/20">
                {orderType === "delivery"
                  ? `🛵 Express Delivery (${verifiedLocation})`
                  : "🛍️ Takeaway Pick-up"}
              </span>
            </div>

            {/* Itemized Cart Table */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {cart.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  Your cart is empty.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/5"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                        <span>{item.name}</span>
                        {item.portion && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-[#E36727] dark:text-amber-400 border border-amber-500/20">
                            {item.portion}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        Qty: {item.qty} × LKR {item.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="font-bold text-[#E36727]">
                      LKR {(item.price * item.qty).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals Calculation */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  LKR {cartSubtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Delivery Fee:</span>
                <span
                  className={
                    orderType === "delivery"
                      ? "font-bold text-[#E36727]"
                      : "font-bold text-emerald-500"
                  }
                >
                  {orderType === "delivery"
                    ? `LKR ${deliveryFee.toLocaleString()} (${verifiedLocation})`
                    : "LKR 0 (Free Pick-up)"}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-200 dark:border-white/10">
                <span className="text-slate-900 dark:text-white">
                  Grand Total:
                </span>
                <span className="gold-gradient-text text-xl">
                  LKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#26201d] text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-[#E36727] text-base"></i>
              <span>
                All orders dispatched with hygienic seals from our Handapangoda Hub.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ORDER RECEIPT CONFIRMATION MODAL */}
      {isReceiptOpen && receiptDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h3 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">
              Order Placed Successfully!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your order is recorded in our system and kitchen staff has been notified.
            </p>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#26201d] text-xs text-left space-y-2 border border-slate-200 dark:border-white/10">
              <div className="flex justify-between items-center text-slate-500 pb-1.5 border-b border-slate-200 dark:border-white/10">
                <span className="font-bold">Order Reference:</span>
                <span className="font-mono font-extrabold text-sm text-[#E36727] bg-[#E36727]/10 px-2 py-0.5 rounded">
                  {receiptDetails.orderId}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {receiptDetails.custName} ({receiptDetails.custPhone})
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Mode:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {receiptDetails.mode}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Time Slot:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {receiptDetails.time}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {receiptDetails.payment}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1.5 border-t border-slate-200 dark:border-white/10 font-bold">
                <span>Total Amount:</span>
                <span className="text-[#E36727] text-sm">
                  LKR {receiptDetails.total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={`/orders/track?ref=${receiptDetails.orderId}`}
                className="w-full py-3 bg-[#E36727] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md cursor-pointer hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-radar"></i>
                <span>Track Order Status Live</span>
              </Link>
              <button
                onClick={handleFinishOrder}
                className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Back to Restaurant Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
