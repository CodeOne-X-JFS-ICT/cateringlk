"use client";

import React from "react";

interface QuotePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any;
}

export default function QuotePrintModal({ isOpen, onClose, quote }: QuotePrintModalProps) {
  if (!isOpen || !quote) return null;

  const handlePrint = () => {
    window.print();
  };

  const grandTotal = Number(quote.grand_total || 0);
  const totalPaid = Number(quote.total_paid || 0);
  const balanceRemaining = Math.max(0, grandTotal - totalPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-xs print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl p-4 sm:p-8 lg:p-10 space-y-5 sm:space-y-6 print:shadow-none print:max-h-none print:p-0 print:rounded-none">
        {/* Top Controls (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Printable Quotation Sheet
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial justify-center px-4 py-2 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-print"></i>
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div id="print-area" className="space-y-5 sm:space-y-6 text-slate-900 font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b-2 border-[#E36727] pb-4 sm:pb-6">
            <div>
              <h1 className="font-serif text-xl sm:text-3xl font-extrabold text-[#E36727] tracking-tight">
                CATERING BY AHAS GAWWA
              </h1>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Authentic Sri Lankan Culinary Heritage & Banquet Services
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
                44/2, Koswatta Road, Battaramulla, Sri Lanka • +94 74 201 3332 • info@cateringlk.com
              </p>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="inline-block bg-[#E36727]/10 text-[#E36727] font-mono font-extrabold text-xs px-3 py-1 rounded-full border border-[#E36727]/20">
                {quote.quote_ref}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 sm:mt-1.5">
                Date: {new Date(quote.created_at || Date.now()).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                Validity: 14 Days
              </p>
            </div>
          </div>

          {/* Client & Event Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <h3 className="font-bold text-[10px] uppercase text-[#E36727] tracking-wider mb-1.5 sm:mb-2">
                Customer Details
              </h3>
              <p className="font-extrabold text-slate-900 text-sm">{quote.customer_name}</p>
              <p className="text-slate-600 mt-0.5"><i className="fa-solid fa-phone mr-1.5 text-slate-400"></i> {quote.customer_phone}</p>
              {quote.customer_email && (
                <p className="text-slate-600 mt-0.5"><i className="fa-solid fa-envelope mr-1.5 text-slate-400"></i> {quote.customer_email}</p>
              )}
            </div>

            <div>
              <h3 className="font-bold text-[10px] uppercase text-[#E36727] tracking-wider mb-1.5 sm:mb-2">
                Event Logistics
              </h3>
              <p className="font-semibold text-slate-800">
                <span className="text-slate-500">Occasion:</span> {quote.eventType?.name || "Private Banquet"}
              </p>
              <p className="text-slate-800 mt-0.5">
                <span className="text-slate-500">Date & Slot:</span>{" "}
                <span className="font-bold">
                  {quote.event_date ? new Date(quote.event_date).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" }) : "TBD"}{" "}
                  ({quote.event_time_slot || "Lunch / Dinner"})
                </span>
              </p>
              <p className="text-slate-800 mt-0.5">
                <span className="text-slate-500">Guest Count:</span>{" "}
                <span className="font-bold text-[#E36727]">{quote.pax_count} Pax</span>
              </p>
              <p className="text-slate-800 mt-0.5">
                <span className="text-slate-500">Venue / Location:</span>{" "}
                {quote.custom_location || quote.location?.city_name || "Client Venue"}
              </p>
            </div>
          </div>

          {/* Selected Package & Addons */}
          <div className="space-y-2.5 sm:space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Selected Menu & Live Action Stations
            </h3>
            <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="text-slate-900 text-sm">
                  {quote.package?.name || quote.tier?.name || "Selected Catering Package"}
                </span>
                <span className="text-[#E36727]">
                  Rs. {Number(quote.base_rate_per_pax || 0).toLocaleString()} / plate
                </span>
              </div>
              {quote.package?.description && (
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {quote.package.description}
                </p>
              )}
              {quote.package?.inclusions_text && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-700">Menu Inclusions:</span> {quote.package.inclusions_text}
                </div>
              )}

              {/* Addons */}
              {quote.quoteAddons && quote.quoteAddons.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Special Add-On Stations / Extra Plates:
                  </span>
                  <div className="space-y-1">
                    {quote.quoteAddons.map((qa: any) => (
                      <div key={qa.id} className="flex justify-between text-slate-700 text-[11px]">
                        <span>• {qa.addon?.name}</span>
                        <span className="font-semibold">+ Rs. {Number(qa.price_per_pax).toLocaleString()} / pax</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Cost Breakdown & Payment Schedule
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs">
              <table className="w-full min-w-[480px]">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px]">
                  <tr>
                    <th className="text-left px-3.5 sm:px-4 py-2 font-bold uppercase">Item Description</th>
                    <th className="text-center px-3.5 sm:px-4 py-2 font-bold uppercase">Rate / Unit</th>
                    <th className="text-center px-3.5 sm:px-4 py-2 font-bold uppercase">Quantity</th>
                    <th className="text-right px-3.5 sm:px-4 py-2 font-bold uppercase">Total (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-3.5 sm:px-4 py-2.5 font-medium">Food & Beverage Package ({quote.package?.name || "Banquet"})</td>
                    <td className="px-3.5 sm:px-4 py-2.5 text-center">Rs. {Number(quote.base_rate_per_pax || 0).toLocaleString()}</td>
                    <td className="px-3.5 sm:px-4 py-2.5 text-center">{quote.pax_count} Pax</td>
                    <td className="px-3.5 sm:px-4 py-2.5 text-right font-semibold">
                      Rs. {(Number(quote.base_rate_per_pax || 0) * quote.pax_count).toLocaleString()}
                    </td>
                  </tr>
                  {quote.addons_per_pax > 0 && (
                    <tr>
                      <td className="px-3.5 sm:px-4 py-2 font-medium">Add-on Action Stations Total</td>
                      <td className="px-3.5 sm:px-4 py-2 text-center">Rs. {Number(quote.addons_per_pax).toLocaleString()}</td>
                      <td className="px-3.5 sm:px-4 py-2 text-center">{quote.pax_count} Pax</td>
                      <td className="px-3.5 sm:px-4 py-2 text-right font-semibold">
                        Rs. {(Number(quote.addons_per_pax) * quote.pax_count).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {Number(quote.service_charge || 0) > 0 && (
                    <tr>
                      <td colSpan={3} className="px-3.5 sm:px-4 py-2 text-right text-slate-500">10% Operational Service Charge</td>
                      <td className="px-3.5 sm:px-4 py-2 text-right font-semibold">Rs. {Number(quote.service_charge).toLocaleString()}</td>
                    </tr>
                  )}
                  {Number(quote.transport_fee || 0) > 0 && (
                    <tr>
                      <td colSpan={3} className="px-3.5 sm:px-4 py-2 text-right text-slate-500">Transport & Logistics Fee</td>
                      <td className="px-3.5 sm:px-4 py-2 text-right font-semibold">Rs. {Number(quote.transport_fee).toLocaleString()}</td>
                    </tr>
                  )}
                  {Number(quote.discount_amount || 0) > 0 && (
                    <tr>
                      <td colSpan={3} className="px-3.5 sm:px-4 py-2 text-right text-emerald-600 font-bold">Special Package Discount</td>
                      <td className="px-3.5 sm:px-4 py-2 text-right text-emerald-600 font-bold">- Rs. {Number(quote.discount_amount).toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-extrabold text-sm border-t-2 border-slate-200">
                    <td colSpan={3} className="px-3.5 sm:px-4 py-3 text-right uppercase">Grand Total Estimate</td>
                    <td className="px-3.5 sm:px-4 py-3 text-right text-[#E36727]">Rs. {grandTotal.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-amber-500/10 text-amber-900 font-bold">
                    <td colSpan={3} className="px-3.5 sm:px-4 py-2.5 text-right">30% Advance Deposit Required to Confirm:</td>
                    <td className="px-3.5 sm:px-4 py-2.5 text-right font-extrabold">Rs. {Number(quote.advance_amount || Math.round(grandTotal * 0.3)).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Status Summary */}
          {quote.payments && quote.payments.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="flex justify-between font-bold text-emerald-900">
                <span>Total Payments Received to Date:</span>
                <span>Rs. {totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800">
                <span>Remaining Balance Due on Event Day:</span>
                <span>Rs. {balanceRemaining.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Terms & Bank Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-[10px] text-slate-500 border-t border-slate-200">
            <div>
              <h4 className="font-bold text-slate-700 uppercase mb-1">Terms & Policies:</h4>
              <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
                <li>30% advance deposit secures reservation of chefs and dates.</li>
                <li>Glassware, plateware, and serving staff included free for 50+ guests.</li>
                <li>Hut / canopy, chairs, and tables provided free for 150+ guests.</li>
                <li>Remaining 70% balance payable on event date before food service.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 uppercase mb-1">Direct Bank Deposit Details:</h4>
              <p className="font-bold text-slate-800">Account Name: Ahas Gawwa Catering (Pvt) Ltd</p>
              <p>Bank: Bank of Ceylon (BOC) • Branch: Battaramulla</p>
              <p>Account Number: <span className="font-mono font-bold text-slate-800">8821-0092-1104</span></p>
              <p className="mt-1 text-[9px] text-slate-400">Please send bank deposit receipt via WhatsApp to 074 201 3332 with reference {quote.quote_ref}.</p>
            </div>
          </div>

          {/* Signature Line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-8 mt-4 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Prepared By: Catering Coordinator</p>
              <p className="text-[10px] text-slate-400">Ahas Gawwa Catering LK</p>
            </div>
            <div>
              <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Customer Acceptance Signature</p>
              <p className="text-[10px] text-slate-400">{quote.customer_name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
