"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiGet, apiPut } from "@/lib/apiClient";

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
  description: string;
}

const SECTIONS: { title: string; icon: string; keys: string[] }[] = [
  {
    title: "Business Details",
    icon: "fa-building",
    keys: ["business_name", "business_phone", "business_landline", "business_email", "business_address"],
  },
  {
    title: "Social Media",
    icon: "fa-share-nodes",
    keys: ["whatsapp_number", "facebook_url", "instagram_url", "google_maps_embed_url"],
  },
  {
    title: "Operating Hours",
    icon: "fa-clock",
    keys: ["operating_hours", "breakfast_hours", "lunch_hours", "dinner_hours"],
  },
  {
    title: "Delivery & Payments",
    icon: "fa-truck",
    keys: ["delivery_radius_km", "default_delivery_fee", "advance_payment_percentage"],
  },
];

const PRETTY_LABELS: Record<string, string> = {
  business_name: "Business Name",
  business_phone: "Mobile Number",
  business_landline: "Landline Number",
  business_email: "Email Address",
  business_address: "Business Address",
  whatsapp_number: "WhatsApp Number",
  facebook_url: "Facebook URL",
  instagram_url: "Instagram URL",
  google_maps_embed_url: "Google Maps Embed URL",
  operating_hours: "General Operating Hours",
  breakfast_hours: "Breakfast Hours",
  lunch_hours: "Lunch Hours",
  dinner_hours: "Dinner Hours",
  delivery_radius_km: "Delivery Radius (km)",
  default_delivery_fee: "Default Delivery Fee (Rs.)",
  advance_payment_percentage: "Advance Payment Percentage (%)",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiGet("/admin/settings");
      const map: Record<string, Setting> = {};
      const valMap: Record<string, string> = {};
      (json.data || []).forEach((s: Setting) => {
        map[s.setting_key] = s;
        valMap[s.setting_key] = s.setting_value || "";
      });
      setSettings(map);
      setValues(valMap);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // Save all settings that have an ID (exist in the DB)
      const promises = Object.entries(values).map(([key, val]) => {
        if (settings[key]) {
          return apiPut(`/admin/settings/${settings[key].id}`, { setting_value: val });
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      alert("Error saving settings: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-[#E36727]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center px-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-triangle-exclamation text-xl sm:text-2xl"></i>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500 max-w-3xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-slate-900 dark:text-white">
            Site Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your restaurant's global settings and business information.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] ${saved ? "bg-emerald-600 text-white" : "bg-[#E36727] hover:bg-amber-600 text-white"} disabled:opacity-70`}
        >
          {saving ? (
            <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</>
          ) : saved ? (
            <><i className="fa-solid fa-check"></i> Saved!</>
          ) : (
            <><i className="fa-solid fa-floppy-disk"></i> Save All Changes</>
          )}
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-5 sm:space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title} className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="w-8 h-8 rounded-lg bg-[#E36727]/10 text-[#E36727] flex items-center justify-center shrink-0">
                <i className={`fa-solid ${section.icon} text-sm`}></i>
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{section.title}</h2>
            </div>

            {/* Fields */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {section.keys.map((key) => {
                const label = PRETTY_LABELS[key] || key;
                const isLong = key.includes("address") || key.includes("url") || key.includes("embed");
                const desc = settings[key]?.description;
                return (
                  <div key={key}>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                      {label}
                    </label>
                    {desc && <p className="text-[11px] text-slate-400 mb-1.5">{desc}</p>}
                    {isLong ? (
                      <textarea
                        rows={2}
                        value={values[key] || ""}
                        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727] transition-colors resize-none text-slate-900 dark:text-white"
                        placeholder={`Enter ${label.toLowerCase()}...`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[key] || ""}
                        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#E36727] transition-colors text-slate-900 dark:text-white"
                        placeholder={`Enter ${label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button at bottom */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] ${saved ? "bg-emerald-600 text-white" : "bg-[#E36727] hover:bg-amber-600 text-white"} disabled:opacity-70`}
        >
          {saving ? (
            <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</>
          ) : saved ? (
            <><i className="fa-solid fa-check"></i> Saved!</>
          ) : (
            <><i className="fa-solid fa-floppy-disk"></i> Save All Changes</>
          )}
        </button>
      </div>
    </div>
  );
}
