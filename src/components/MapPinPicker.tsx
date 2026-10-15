"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    L: any;
  }
}

interface MapPinPickerProps {
  onLocationSelect: (address: string, lat: number, lng: number, mapsUrl: string) => void;
  zoneName?: string;
  initialLat?: number;
  initialLng?: number;
}

// Approximate centers for known delivery hubs & zones around Handapangoda
const ZONE_CENTERS: Record<string, [number, number]> = {
  Handapangoda: [6.82697, 80.14107],
  Bope: [6.8400, 80.1300],
  Padukka: [6.8483, 80.1042],
  Horana: [6.7153, 80.0631],
  Meepe: [6.8524, 80.0886],
  Ingiriya: [6.7454, 80.1698],
  Labugama: [6.8394, 80.1786],
  Waga: [6.8667, 80.1500],
};

const DEFAULT_CENTER: [number, number] = [6.82697, 80.14107]; // Handapangoda Hub

export default function MapPinPicker({
  onLocationSelect,
  zoneName = "Handapangoda",
  initialLat,
  initialLng,
}: MapPinPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [loadingMap, setLoadingMap] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    if (initialLat && initialLng) return { lat: initialLat, lng: initialLng };
    const matched = Object.keys(ZONE_CENTERS).find(
      (k) => zoneName.toLowerCase().includes(k.toLowerCase())
    );
    const center = matched ? ZONE_CENTERS[matched] : DEFAULT_CENTER;
    return { lat: center[0], lng: center[1] };
  });

  const [resolvedAddress, setResolvedAddress] = useState<string>("");
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Reverse geocoding helper using Nominatim
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { "User-Agent": "AhasGawwaCateringDelivery/1.0" } }
        );
        const json = await res.json();
        const displayName = json.display_name || "";

        // Create a concise clean address line
        let cleanAddress = displayName;
        if (json.address) {
          const parts = [
            json.address.road || json.address.pedestrian || json.address.suburb,
            json.address.village || json.address.town || json.address.city,
            json.address.state_district || json.address.county,
          ].filter(Boolean);
          if (parts.length > 0) {
            cleanAddress = parts.join(", ");
          }
        }

        const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        const finalFormatted = cleanAddress
          ? `${cleanAddress} (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`
          : `Pinned Delivery Location (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`;

        setResolvedAddress(finalFormatted);
        onLocationSelect(finalFormatted, lat, lng, mapsUrl);
      } catch {
        const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        const fallback = `Pinned Delivery Location (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        setResolvedAddress(fallback);
        onLocationSelect(fallback, lat, lng, mapsUrl);
      } finally {
        setGeocoding(false);
      }
    },
    [onLocationSelect]
  );

  // Load Leaflet assets dynamically
  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      // 1. Inject Leaflet CSS if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // 2. Inject Leaflet Script if not already loaded
      if (!window.L) {
        if (!document.getElementById("leaflet-js")) {
          const script = document.createElement("script");
          script.id = "leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.async = true;
          document.body.appendChild(script);

          await new Promise<void>((resolve) => {
            script.onload = () => resolve();
          });
        } else {
          // Script tag exists, wait until window.L is ready
          while (!window.L) {
            await new Promise((r) => setTimeout(r, 100));
          }
        }
      }

      if (!isMounted || !mapContainerRef.current) return;

      // 3. Initialize Leaflet Map
      if (!mapInstanceRef.current && window.L) {
        const startLat = coords.lat;
        const startLng = coords.lng;

        const map = window.L.map(mapContainerRef.current, {
          center: [startLat, startLng],
          zoom: 15,
          zoomControl: true,
        });

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Custom stylish Pin Icon
        const pinHtml = `
          <div style="position: relative; width: 38px; height: 48px; transform: translate(-50%, -100%); cursor: grab;">
            <div style="width: 38px; height: 38px; background: linear-gradient(135deg, #E36727 0%, #b84a12 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #ffffff; box-shadow: 0 6px 14px rgba(227, 103, 39, 0.5); display: flex; align-items: center; justify-content: center;">
              <span style="transform: rotate(45deg); color: #ffffff; font-size: 15px; font-weight: 800;">📍</span>
            </div>
            <div style="width: 14px; height: 5px; background: rgba(0,0,0,0.35); border-radius: 50%; margin: -2px auto 0; filter: blur(1.5px);"></div>
          </div>
        `;

        const customPinIcon = window.L.divIcon({
          className: "leaflet-custom-marker",
          html: pinHtml,
          iconSize: [38, 48],
          iconAnchor: [19, 48],
        });

        const marker = window.L.marker([startLat, startLng], {
          draggable: true,
          icon: customPinIcon,
        }).addTo(map);

        marker.bindTooltip("Drag or click map to set delivery doorstep", {
          direction: "top",
          offset: [0, -48],
          permanent: false,
        });

        // Click map to reposition marker
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setCoords({ lat, lng });
          reverseGeocode(lat, lng);
        });

        // Drag marker to reposition
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          setCoords({ lat: pos.lat, lng: pos.lng });
          reverseGeocode(pos.lat, pos.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setLoadingMap(false);

        // Initial geocoding
        reverseGeocode(startLat, startLng);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // GPS Auto-detect
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }

        reverseGeocode(lat, lng);
        setLocatingGps(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        setGpsError("Unable to retrieve GPS location. Please click on the map to pin manually.");
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Re-center on Hub
  const handleResetToHub = () => {
    const [hubLat, hubLng] = DEFAULT_CENTER;
    setCoords({ lat: hubLat, lng: hubLng });
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([hubLat, hubLng], 15);
      markerRef.current.setLatLng([hubLat, hubLng]);
    }
    reverseGeocode(hubLat, hubLng);
  };

  const googleMapsLink = `https://maps.google.com/?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <label className="block font-bold text-slate-800 dark:text-slate-200 uppercase text-xs">
            Pin Your Delivery Location on Map *
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Click anywhere on the map or drag the orange pin directly to your gate/doorstep.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locatingGps}
            className="px-3 py-1.5 bg-[#E36727]/10 hover:bg-[#E36727]/20 border border-[#E36727]/30 text-[#E36727] font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <i className={`fa-solid fa-location-crosshairs ${locatingGps ? "animate-spin" : ""}`}></i>
            <span>{locatingGps ? "Locating..." : "Auto-Detect My GPS"}</span>
          </button>
          <button
            type="button"
            onClick={handleResetToHub}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] rounded-xl transition-all cursor-pointer"
            title="Reset to Hub"
          >
            <i className="fa-solid fa-house"></i>
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{gpsError}</span>
        </div>
      )}

      {/* Map Canvas Container */}
      <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-inner bg-slate-100 dark:bg-[#1a1614]">
        {loadingMap && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/90 dark:bg-[#1a1614]/90 backdrop-blur-xs">
            <div className="w-8 h-8 border-2 border-[#E36727] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs font-bold text-slate-500">Loading Interactive Delivery Map...</p>
          </div>
        )}

        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Controls Overlay */}
        <div className="absolute top-2.5 right-2.5 z-400 bg-white/95 dark:bg-[#1a1614]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Tap Map to Move Pin</span>
        </div>
      </div>

      {/* Selected Location Pill & Google Maps Verification Link */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 text-xs space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-location-dot text-[#E36727] text-base"></i>
            <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Pinned Address
            </span>
          </div>

          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E36727] hover:underline cursor-pointer"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            <span>Preview in Google Maps</span>
          </a>
        </div>

        <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed pl-6">
          {geocoding ? (
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block"></span>
              Resolving address from pin...
            </span>
          ) : (
            resolvedAddress || `Coordinates: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
          )}
        </p>

        <div className="pl-6 pt-1 text-[11px] text-slate-400 flex items-center gap-3">
          <span>Lat: {coords.lat.toFixed(5)}</span>
          <span>•</span>
          <span>Lng: {coords.lng.toFixed(5)}</span>
        </div>
      </div>
    </div>
  );
}
