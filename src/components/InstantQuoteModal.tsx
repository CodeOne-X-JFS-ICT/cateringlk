"use client";

import React, { useState } from "react";
import { useOrder } from "@/context/OrderContext";

export default function InstantQuoteModal() {
  const { isInstantQuoteOpen, setIsInstantQuoteOpen } = useOrder();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Wedding Reception");
  const [suburb, setSuburb] = useState("Handapangoda");
  const [pax, setPax] = useState(100);
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedQuoteId, setSubmittedQuoteId] = useState("");

  if (!isInstantQuoteOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quoteId = "AG-QT-" + Math.floor(100000 + Math.random() * 900000);
    setSubmittedQuoteId(quoteId);
    setIsSubmitted(true);
  };

  const handleWhatsAppDispatch = () => {
    const text = `Hi Catering by Ahas Gawwa, I submitted an Instant Quote (${submittedQuoteId}):\n- Customer: ${name} (${phone})\n- Service: ${category}\n- Suburb: ${suburb}\n- Pax Count: ${pax} Guests\n- Date: ${eventDate || "TBD"}\n- Notes: ${notes || "None"}`;
    window.open(
      `https://wa.me/94742013332?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setIsInstantQuoteOpen(false);
    setName("");
    setPhone("");
    setNotes("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FFFBF8] dark:bg-[#1a1614] border border-[#E36727]/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-5 my-8 text-slate-800 dark:text-slate-100">
        {/* Close Cross Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg cursor-pointer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {!isSubmitted ? (
          <>
            {/* Modal Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E36727]/10 text-[#E36727] text-xs font-bold border border-[#E36727]/20">
                <i className="fa-solid fa-bolt text-amber-500"></i> Fast Quote Engine
              </div>
              <h3 className="font-serif font-extrabold text-2xl text-slate-900 dark:text-white">
                Submit Instant Catering Quote
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enter your event specifications below for immediate estimation & sales consultant contact.
              </p>
            </div>

            {/* Quote Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ruwan Perera"
                    className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                  />
                </div>
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
                    className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Event / Service Type
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#E36727]"
                  >
                    <option value="Wedding Reception">Wedding Reception</option>
                    <option value="Sacred Sanghika Dana">Sacred Sanghika Dana</option>
                    <option value="Corporate Banquet">Corporate Banquet</option>
                    <option value="Birthday & Party">Birthday & Party</option>
                    <option value="Garden BBQ Feast">Garden BBQ Feast</option>
                    <option value="Takeaway / Express Order">Takeaway / Express Order</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Suburb / Location
                  </label>
                  <select
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#E36727]"
                  >
                    <option value="Handapangoda">Handapangoda (Hub)</option>
                    <option value="Padukka">Padukka</option>
                    <option value="Ingiriya">Ingiriya</option>
                    <option value="Horana">Horana</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Maharagama">Maharagama</option>
                    <option value="Homagama">Homagama</option>
                    <option value="Kottawa">Kottawa</option>
                    <option value="Nugegoda">Nugegoda</option>
                    <option value="Other Western Province Suburb">Other Suburb</option>
                  </select>
                </div>
              </div>

              {/* Pax Count Slider & Target Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 uppercase">
                    <span>Guest Count:</span>
                    <span className="text-[#E36727]">{pax} Guests</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={1000}
                    step={10}
                    value={pax}
                    onChange={(e) => setPax(Number(e.target.value))}
                    className="w-full accent-[#E36727] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Target Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Custom Menu Requirements / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention preferred dishes, dietary needs (e.g. Vegetarian Dana, Seafood Live Station)..."
                  className="w-full bg-white dark:bg-[#26201d] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#E36727]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-500 hover:to-[#E36727] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>Submit Instant Quote Request</span>
              </button>
            </form>
          </>
        ) : (
          /* Confirmation Receipt View */
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h3 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">
              Quote Submitted Successfully!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your instant quote request has been registered with Catering by Ahas Gawwa.
            </p>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#26201d] text-xs text-left space-y-1.5 border border-slate-200 dark:border-white/10">
              <div className="flex justify-between text-slate-500">
                <span>Quote Reference:</span>
                <span className="font-bold text-[#E36727]">
                  {submittedQuoteId}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Customer Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {name} ({phone})
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Service / Location:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {category} ({suburb})
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Guest Count:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {pax} Guests
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleWhatsAppDispatch}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
                <span>Connect Quote via WhatsApp</span>
              </button>

              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-slate-200 dark:bg-[#26201d] text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-300 transition-all"
              >
                Done / Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
