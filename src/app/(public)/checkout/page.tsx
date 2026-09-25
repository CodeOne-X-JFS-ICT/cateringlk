"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrder } from "@/context/OrderContext";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    cartSubtotal,
    orderType,
    verifiedLocation,
    clearCart,
  } = useOrder();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [timeSlot, setTimeSlot] = useState("ASAP (30-40 mins)");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery / Collection");

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

  const deliveryFee = orderType === "delivery" ? 250 : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderId = "AG-" + Math.floor(100000 + Math.random() * 900000);
    const details = {
      orderId,
      custName: name,
      custPhone: phone,
      mode: `${orderType.toUpperCase()} (${verifiedLocation})`,
      time: timeSlot,
      payment: paymentMethod,
      total: grandTotal,
    };

    setReceiptDetails(details);
    setIsReceiptOpen(true);

    // WhatsApp Dispatch simulation
    if (paymentMethod.includes("WhatsApp")) {
      const text = `Hi Catering by Ahas Gawwa, I placed an Order (${orderId}):\n- Customer: ${name} (${phone})\n- Mode: ${orderType.toUpperCase()} (${verifiedLocation})\n- Time: ${timeSlot}\n- Total: LKR ${grandTotal.toLocaleString()}`;
      window.open(
        `https://wa.me/94742013332?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    }
  };

  const handleFinishOrder = () => {
    clearCart();
    setIsReceiptOpen(false);
    router.push("/restaurant");
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Customer Information Form (Left) */}
          <div className="lg:col-span-7 bg-[#FFFBF8] dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-lg">
            <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-white/10">
              Customer Information
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
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
                    className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#E36727]"
                  >
                    <option value="ASAP (30-40 mins)">ASAP (30-40 mins)</option>
                    <option value="12:30 PM Lunch Slot">12:30 PM Lunch Slot</option>
                    <option value="1:30 PM Lunch Slot">1:30 PM Lunch Slot</option>
                    <option value="7:30 PM Dinner Slot">7:30 PM Dinner Slot</option>
                    <option value="8:30 PM Dinner Slot">8:30 PM Dinner Slot</option>
                  </select>
                </div>
              </div>

              {/* Conditional Delivery Address / Instructions */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {orderType === "delivery"
                    ? "Delivery Address & Special Instructions *"
                    : "Pick-up Notes (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    orderType === "delivery"
                      ? "Enter house number, street name or landmark for express delivery..."
                      : "Any special food preparation instructions..."
                  }
                  className="w-full bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                ></textarea>
              </div>

              {/* Payment Choice */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    "Cash on Delivery / Collection",
                    "Card on Collection / POS",
                    "WhatsApp Direct Order",
                  ].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === method
                          ? "border-[#E36727] bg-[#E36727]/10"
                          : "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#26201d]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="accent-[#E36727]"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {method.split(" ")[0]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className={`w-full py-4 bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer ${
                  cart.length === 0 ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                Confirm & Place Order Now
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
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        Qty: {item.qty}
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
                    ? `LKR ${deliveryFee} (6km Radius)`
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
              Order Confirmed!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your order has been submitted to Catering by Ahas Gawwa restaurant kitchen.
            </p>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#26201d] text-xs text-left space-y-1.5 border border-slate-200 dark:border-white/10">
              <div className="flex justify-between text-slate-500">
                <span>Order ID:</span>
                <span className="font-bold text-[#E36727]">
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

            <button
              onClick={handleFinishOrder}
              className="w-full py-3 bg-[#E36727] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md cursor-pointer hover:bg-amber-600 transition-all"
            >
              Back to Restaurant Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
