"use client";

import React, { useState } from "react";
import { apiPost } from "@/lib/apiClient";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any;
  onPaymentRecorded: () => void;
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  quote,
  onPaymentRecorded,
}: RecordPaymentModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grandTotal = Number(quote?.grand_total || 0);
  const advanceAmount = Number(quote?.advance_amount || Math.round(grandTotal * 0.3));
  const totalPaid = Number(quote?.total_paid || 0);
  const balanceRemaining = Math.max(0, grandTotal - totalPaid);

  const [amount, setAmount] = useState<number>(
    totalPaid === 0 ? advanceAmount : balanceRemaining
  );
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentType, setPaymentType] = useState<"ADVANCE_30" | "FULL_100">(
    totalPaid === 0 ? "ADVANCE_30" : "FULL_100"
  );
  const [gatewayRef, setGatewayRef] = useState("");
  const [payerName, setPayerName] = useState(quote?.customer_name || "");
  const [payerPhone, setPayerPhone] = useState(quote?.customer_phone || "");

  if (!isOpen || !quote) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiPost(`/admin/catering/quotes/${quote.id}/payments`, {
        amount: Number(amount),
        payment_method: paymentMethod,
        payment_type: paymentType,
        gateway_reference: gatewayRef || null,
        payer_name: payerName || quote.customer_name,
        payer_phone: payerPhone || quote.customer_phone,
      });

      onPaymentRecorded();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 sm:p-7 space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-receipt text-emerald-600"></i> Record Catering Payment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Log deposit or transfer for <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{quote.quote_ref}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Financial Snapshot */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-slate-400 block text-[9px] sm:text-[10px] font-bold uppercase truncate">Total Quote</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">Rs. {grandTotal.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] sm:text-[10px] font-bold uppercase truncate">Paid to Date</span>
            <span className="font-extrabold text-emerald-600 text-xs sm:text-sm">Rs. {totalPaid.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] sm:text-[10px] font-bold uppercase truncate">Remaining</span>
            <span className="font-extrabold text-[#E36727] text-xs sm:text-sm">Rs. {balanceRemaining.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
          {/* Quick presets */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5 text-[10px]">
              Select Preset Amount
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAmount(advanceAmount);
                  setPaymentType("ADVANCE_30");
                }}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer text-xs ${
                  amount === advanceAmount
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                30% Deposit: Rs. {advanceAmount.toLocaleString()}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAmount(balanceRemaining);
                  setPaymentType("FULL_100");
                }}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer text-xs ${
                  amount === balanceRemaining
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Full Balance: Rs. {balanceRemaining.toLocaleString()}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 text-[10px]">
              Payment Amount (LKR) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-emerald-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 text-[10px]">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                <option value="bank_transfer">Bank Transfer / Deposit</option>
                <option value="cash">Cash (Direct)</option>
                <option value="cheque">Cheque</option>
                <option value="card">Credit / Debit Card</option>
                <option value="ipg">Online IPG</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 text-[10px]">
                Payment Type
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                <option value="ADVANCE_30">Advance Deposit (30%)</option>
                <option value="FULL_100">Full Settlement (100%)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 text-[10px]">
              Bank Slip Ref / Cheque No / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. BOC Ref: 981244 or Cash handed over"
              value={gatewayRef}
              onChange={(e) => setGatewayRef(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 text-[10px]">Payer Name</label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 text-[10px]">Payer Phone</label>
              <input
                type="tel"
                value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="py-2 px-4 rounded-xl border border-slate-200 dark:border-white/10 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || amount <= 0}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-center"
            >
              <i className="fa-solid fa-check"></i>
              <span>{submitting ? "Recording..." : `Confirm Payment (Rs. ${amount.toLocaleString()})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
