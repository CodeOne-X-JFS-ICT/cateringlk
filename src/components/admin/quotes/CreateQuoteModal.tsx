"use client";

import React, { useState, useEffect } from "react";
import { apiPost } from "@/lib/apiClient";

interface CreateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialData?: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    paxCount?: number;
    eventDate?: string;
    customLocation?: string;
    specialNotes?: string;
    adminNotes?: string;
  };
}

export default function CreateQuoteModal({ isOpen, onClose, onCreated, initialData }: CreateQuoteModalProps) {
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lookups
  const [packages, setPackages] = useState<any[]>([]);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [eventTypeId, setEventTypeId] = useState<number | "">("");
  const [packageId, setPackageId] = useState<number | "">("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [customLocation, setCustomLocation] = useState("");
  const [paxCount, setPaxCount] = useState<number>(50);
  const [eventDate, setEventDate] = useState("");
  const [eventTimeSlot, setEventTimeSlot] = useState("Lunch (11:30 AM)");
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
  const [transportFee, setTransportFee] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [specialNotes, setSpecialNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("PENDING");

  // Pre-fill initialData if provided (e.g. from inquiry conversion)
  useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.customerName) setCustomerName(initialData.customerName);
      if (initialData.customerPhone) setCustomerPhone(initialData.customerPhone);
      if (initialData.customerEmail) setCustomerEmail(initialData.customerEmail);
      if (initialData.paxCount) setPaxCount(initialData.paxCount);
      if (initialData.eventDate) setEventDate(initialData.eventDate);
      if (initialData.customLocation) setCustomLocation(initialData.customLocation);
      if (initialData.specialNotes) setSpecialNotes(initialData.specialNotes);
      if (initialData.adminNotes) setAdminNotes(initialData.adminNotes);
    }
  }, [isOpen, initialData]);

  // Fetch Lookup Data
  useEffect(() => {
    if (!isOpen) return;
    const fetchLookups = async () => {
      setLoadingLookups(true);
      setError(null);
      try {
        const [pkgRes, evRes, locRes, addRes] = await Promise.all([
          fetch("http://localhost:5050/api/public/catering/packages"),
          fetch("http://localhost:5050/api/public/catering/event-types"),
          fetch("http://localhost:5050/api/public/catering/locations"),
          fetch("http://localhost:5050/api/public/catering/addons"),
        ]);
        const pkgJson = await pkgRes.json();
        const evJson = await evRes.json();
        const locJson = await locRes.json();
        const addJson = await addRes.json();

        if (pkgJson.success) {
          setPackages(pkgJson.data || []);
          if (pkgJson.data?.length > 0 && !packageId) setPackageId(pkgJson.data[0].id);
        }
        if (evJson.success) {
          setEventTypes(evJson.data || []);
          if (evJson.data?.length > 0 && !eventTypeId) setEventTypeId(evJson.data[0].id);
        }
        if (locJson.success) setLocations(locJson.data || []);
        if (addJson.success) setAddons(addJson.data || []);
      } catch (err: any) {
        setError("Failed to load options: " + err.message);
      } finally {
        setLoadingLookups(false);
      }
    };
    fetchLookups();
  }, [isOpen]);

  // Live Calculations
  const selectedPkg = packages.find((p) => p.id === Number(packageId));
  const baseRate = selectedPkg ? Number(selectedPkg.price_per_pax) : 0;
  const addonsTotalPerPax = addons
    .filter((a) => selectedAddonIds.includes(a.id))
    .reduce((sum, a) => sum + Number(a.price_per_pax), 0);

  const totalPerPax = baseRate + addonsTotalPerPax;
  const foodSubtotal = totalPerPax * (paxCount || 0);

  const isServiceChargeApplicable = selectedPkg
    ? selectedPkg.name.toLowerCase().includes("menu 02") ||
      selectedPkg.name.toLowerCase().includes("menu 03") ||
      selectedPkg.name.toLowerCase().includes("menu 04") ||
      selectedPkg.name.toLowerCase().includes("guest")
    : false;

  const serviceCharge = isServiceChargeApplicable ? Math.round(foodSubtotal * 0.1) : 0;
  const grandTotal = Math.max(0, foodSubtotal + serviceCharge + Number(transportFee || 0) - Number(discountAmount || 0));
  const advanceAmount = Math.round(grandTotal * 0.3);

  const toggleAddon = (id: number) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiPost("/admin/catering/quotes", {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        event_type_id: eventTypeId ? Number(eventTypeId) : null,
        package_id: packageId ? Number(packageId) : null,
        location_id: locationId ? Number(locationId) : null,
        custom_location: customLocation || null,
        pax_count: Number(paxCount),
        event_date: eventDate || null,
        event_time_slot: eventTimeSlot || null,
        addon_ids: selectedAddonIds,
        transport_fee: Number(transportFee) || 0,
        discount_amount: Number(discountAmount) || 0,
        special_notes: specialNotes || null,
        admin_notes: adminNotes || null,
        status,
      });

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create quote");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1614] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/10">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-file-circle-plus text-[#E36727]"></i> Create Formal Catering Quote
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generate a new catering estimate for phone inquiries or direct bookings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Customer Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E36727] mb-2.5">1. Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Anura Bandara"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="077 123 4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="client@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E36727] mb-2.5">2. Event & Logistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Event Type</label>
                <select
                  value={eventTypeId}
                  onChange={(e) => setEventTypeId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
                >
                  <option value="">Select Event Type</option>
                  {eventTypes.map((et) => (
                    <option key={et.id} value={et.id}>{et.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot / Serving Time</label>
                <select
                  value={eventTimeSlot}
                  onChange={(e) => setEventTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
                >
                  <option value="Morning / Breakfast (8:00 AM)">Morning / Breakfast (8:00 AM)</option>
                  <option value="Dana Alms (10:30 AM)">Dana Alms (10:30 AM)</option>
                  <option value="Lunch (11:30 AM)">Lunch (11:30 AM)</option>
                  <option value="Evening High Tea (4:00 PM)">Evening High Tea (4:00 PM)</option>
                  <option value="Dinner (7:00 PM)">Dinner (7:00 PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Service City / Location</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
                >
                  <option value="">Select Predefined City</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.city_name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Custom Venue / Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Waters Edge Grand Ballroom or No. 45, Temple Road, Maharagama"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
                />
              </div>
            </div>
          </div>

          {/* Package & Addons */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E36727] mb-2.5">3. Menu Selection & Guest Count</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catering Package / Menu *</label>
                <select
                  required
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — Rs. {Number(pkg.price_per_pax).toLocaleString()}/pax (Min {pkg.min_pax} pax)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Guest Count (Pax) *</label>
                <input
                  type="number"
                  min="10"
                  max="2000"
                  required
                  value={paxCount}
                  onChange={(e) => setPaxCount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-[#E36727] focus:outline-none focus:border-[#E36727]"
                />
              </div>
            </div>

            {/* Add-on selection */}
            {addons.length > 0 && (
              <div className="mt-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Optional Add-on Stations & Plates
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {addons.map((addon) => {
                    const isChecked = selectedAddonIds.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? "border-[#E36727] bg-[#E36727]/10"
                            : "border-slate-200 dark:border-white/10 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 text-[#E36727] rounded focus:ring-0 cursor-pointer shrink-0"
                          />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {addon.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#E36727] shrink-0 ml-2">
                          +Rs. {Number(addon.price_per_pax).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Adjustments & Summary */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              4. Pricing Calculation & Overrides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Transport / Delivery Fee (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={transportFee}
                  onChange={(e) => setTransportFee(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Negotiated Discount (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Live Ledger Table */}
            <div className="pt-2 text-xs border-t border-slate-200 dark:border-white/10 space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Base Rate ({paxCount} Pax × Rs. {baseRate.toLocaleString()}):</span>
                <span>Rs. {(baseRate * paxCount).toLocaleString()}</span>
              </div>
              {addonsTotalPerPax > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Addons Total ({paxCount} Pax × Rs. {addonsTotalPerPax.toLocaleString()}):</span>
                  <span>Rs. {(addonsTotalPerPax * paxCount).toLocaleString()}</span>
                </div>
              )}
              {serviceCharge > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>10% Service Charge:</span>
                  <span>Rs. {serviceCharge.toLocaleString()}</span>
                </div>
              )}
              {transportFee > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Transport Charges:</span>
                  <span>+ Rs. {Number(transportFee).toLocaleString()}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount Applied:</span>
                  <span>- Rs. {Number(discountAmount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-white/10">
                <span>Estimated Grand Total:</span>
                <span className="text-[#E36727]">Rs. {grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                <span>Required 30% Advance Deposit:</span>
                <span>Rs. {advanceAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Customer Special Requests
              </label>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Dietary requirements, monk seating notes..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Internal Admin Notes
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Follow-up instructions, customer timeline..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold"
            >
              <option value="PENDING">PENDING (New Lead)</option>
              <option value="CONTACTED">CONTACTED (Follow-up done)</option>
              <option value="QUOTED">QUOTED (Formal proposal sent)</option>
              <option value="CONFIRMED">CONFIRMED (Booking locked)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="py-2.5 px-5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingLookups}
              className="py-2.5 px-6 bg-gradient-to-r from-[#E36727] to-amber-600 hover:from-amber-600 hover:to-[#E36727] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50 text-center"
            >
              {submitting ? "Generating..." : "Generate & Save Quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
