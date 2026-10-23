"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    L: any;
  }
}

export interface MapPinPickerProps {
  onLocationSelect: (
    address: string,
    lat: number,
    lng: number,
    mapsUrl: string,
    isEligible: boolean,
    distanceKm: number
  ) => void;
  zoneName?: string;
  initialLat?: number;
  initialLng?: number;
}

// Catering Hub GPS Coordinates (Handapangoda Hub)
export const CATERING_HUB: [number, number] = [6.82697, 80.14107];
export const MAX_DELIVERY_RADIUS_KM = 6.0;

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

/**
 * Great-circle distance using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2 = CATERING_HUB[0],
  lon2 = CATERING_HUB[1]
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

const createPinHtml = (outOfRadius: boolean) => {
  if (outOfRadius) {
    return `
      <div style="position: relative; width: 40px; height: 50px; transform: translate(-50%, -100%); cursor: grab;">
        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #ffffff; box-shadow: 0 6px 16px rgba(239, 68, 68, 0.65); display: flex; align-items: center; justify-content: center;">
          <span style="transform: rotate(45deg); color: #ffffff; font-size: 16px; font-weight: 800;">⚠️</span>
        </div>
        <div style="width: 14px; height: 5px; background: rgba(0,0,0,0.4); border-radius: 50%; margin: -2px auto 0; filter: blur(1.5px);"></div>
      </div>
    `;
  }
  return `
    <div style="position: relative; width: 40px; height: 50px; transform: translate(-50%, -100%); cursor: grab;">
      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #E36727 0%, #b84a12 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #ffffff; box-shadow: 0 6px 14px rgba(227, 103, 39, 0.55); display: flex; align-items: center; justify-content: center;">
        <span style="transform: rotate(45deg); color: #ffffff; font-size: 16px; font-weight: 800;">📍</span>
      </div>
      <div style="width: 14px; height: 5px; background: rgba(0,0,0,0.35); border-radius: 50%; margin: -2px auto 0; filter: blur(1.5px);"></div>
    </div>
  `;
};

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
    const center = matched ? ZONE_CENTERS[matched] : CATERING_HUB;
    return { lat: center[0], lng: center[1] };
  });

  const [distanceFromHub, setDistanceFromHub] = useState<number>(() =>
    calculateDistanceKm(coords.lat, coords.lng)
  );
  const [isOutOfRadius, setIsOutOfRadius] = useState<boolean>(() =>
    calculateDistanceKm(coords.lat, coords.lng) > MAX_DELIVERY_RADIUS_KM
  );

  const [resolvedAddress, setResolvedAddress] = useState<string>("");
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Update marker visual based on radius status
  const updateMarkerIcon = useCallback((outOfRadius: boolean, dist: number) => {
    if (markerRef.current && window.L) {
      const customPinIcon = window.L.divIcon({
        className: "leaflet-custom-marker",
        html: createPinHtml(outOfRadius),
        iconSize: [40, 50],
        iconAnchor: [20, 50],
      });
      markerRef.current.setIcon(customPinIcon);
      markerRef.current.setTooltipContent(
        outOfRadius
          ? `⚠️ Out of 6km radius (${dist.toFixed(2)} km) - Delivery Unavailable`
          : `📍 Pinned Doorstep (${dist.toFixed(2)} km from Catering Hub)`
      );
    }
  }, []);

  // Reverse geocoding helper & radius evaluation
  const handleLocationUpdate = useCallback(
    async (lat: number, lng: number) => {
      const dist = calculateDistanceKm(lat, lng);
      const outOfRadius = dist > MAX_DELIVERY_RADIUS_KM;
      const isEligible = !outOfRadius;

      setDistanceFromHub(dist);
      setIsOutOfRadius(outOfRadius);
      updateMarkerIcon(outOfRadius, dist);

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
        onLocationSelect(finalFormatted, lat, lng, mapsUrl, isEligible, dist);
      } catch {
        const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        const fallback = `Pinned Delivery Location (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        setResolvedAddress(fallback);
        onLocationSelect(fallback, lat, lng, mapsUrl, isEligible, dist);
      } finally {
        setGeocoding(false);
      }
    },
    [onLocationSelect, updateMarkerIcon]
  );

  const handleLocationUpdateRef = useRef(handleLocationUpdate);
  useEffect(() => {
    handleLocationUpdateRef.current = handleLocationUpdate;
  });

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
        const startDist = calculateDistanceKm(startLat, startLng);
        const startOutOfRadius = startDist > MAX_DELIVERY_RADIUS_KM;

        const map = window.L.map(mapContainerRef.current, {
          center: [startLat, startLng],
          zoom: 14,
          zoomControl: true,
        });

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Draw 6km Delivery Boundary Circle around Handapangoda Hub
        window.L.circle(CATERING_HUB, {
          radius: 6000, // 6km in meters
          color: "#E36727",
          weight: 2,
          dashArray: "6, 6",
          fillColor: "#E36727",
          fillOpacity: 0.08,
        }).addTo(map);

        // Add Hub Location Label
        const hubIcon = window.L.divIcon({
          className: "leaflet-hub-marker",
          html: `
            <div style="background: #1a1614; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; border: 2px solid #E36727; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 5px; transform: translate(-50%, -50%);">
              <span style="color: #E36727;">🍳</span>
              <span>Handapangoda Hub</span>
            </div>
          `,
          iconSize: [140, 26],
          iconAnchor: [70, 13],
        });
        window.L.marker(CATERING_HUB, { icon: hubIcon, interactive: false }).addTo(map);

        // Marker for user's pinned location
        const customPinIcon = window.L.divIcon({
          className: "leaflet-custom-marker",
          html: createPinHtml(startOutOfRadius),
          iconSize: [40, 50],
          iconAnchor: [20, 50],
        });

        const marker = window.L.marker([startLat, startLng], {
          draggable: true,
          icon: customPinIcon,
        }).addTo(map);

        marker.bindTooltip(
          startOutOfRadius
            ? `⚠️ Out of 6km radius (${startDist.toFixed(2)} km) - Delivery Unavailable`
            : `📍 Pinned Doorstep (${startDist.toFixed(2)} km from Hub)`,
          {
            direction: "top",
            offset: [0, -50],
            permanent: false,
          }
        );

        // Click map to reposition marker
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setCoords({ lat, lng });
          handleLocationUpdateRef.current(lat, lng);
        });

        // Drag marker to reposition
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          setCoords({ lat: pos.lat, lng: pos.lng });
          handleLocationUpdateRef.current(pos.lat, pos.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setLoadingMap(false);

        // Initial check and geocode
        handleLocationUpdateRef.current(startLat, startLng);
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

  // GPS Auto-detect using browser Geolocation
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
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
        }

        handleLocationUpdate(lat, lng);
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

  // Re-center on Catering Hub
  const handleResetToHub = () => {
    const [hubLat, hubLng] = CATERING_HUB;
    setCoords({ lat: hubLat, lng: hubLng });
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([hubLat, hubLng], 14);
      markerRef.current.setLatLng([hubLat, hubLng]);
    }
    handleLocationUpdate(hubLat, hubLng);
  };

  const googleMapsLink = `https://maps.google.com/?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

  return (
    <div className="space-y-3">
      {/* Header controls & GPS buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <label className="block font-bold text-slate-800 dark:text-slate-200 uppercase text-xs">
            Pin Delivery Doorstep on Map *
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Click map or drag pin to your gate. Delivery is supported within <strong>6.0 km</strong> from Handapangoda Hub.
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
            title="Reset to Catering Hub"
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

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[290px] sm:h-[330px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-inner bg-slate-100 dark:bg-[#1a1614]">
        {loadingMap && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/90 dark:bg-[#1a1614]/90 backdrop-blur-xs">
            <div className="w-8 h-8 border-2 border-[#E36727] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs font-bold text-slate-500">Loading Interactive Delivery Map...</p>
          </div>
        )}

        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Radius Status Overlay */}
        <div className="absolute top-2.5 right-2.5 z-400 bg-white/95 dark:bg-[#1a1614]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm text-[10px] font-bold flex items-center gap-2 pointer-events-none">
          <span
            className={`w-2 h-2 rounded-full ${
              isOutOfRadius ? "bg-red-500 animate-ping" : "bg-emerald-500 animate-pulse"
            }`}
          ></span>
          <span className={isOutOfRadius ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>
            {isOutOfRadius
              ? `Out of 6km (${distanceFromHub.toFixed(1)} km)`
              : `Within 6km (${distanceFromHub.toFixed(1)} km)`}
          </span>
        </div>

        {/* Floating 6km Circle Legend */}
        <div className="absolute bottom-2.5 left-2.5 z-400 bg-white/90 dark:bg-[#1a1614]/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-[9px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pointer-events-none">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-[#E36727]"></span>
          <span>Dashed Line: 6km Express Delivery Zone</span>
        </div>
      </div>

      {/* NOTICE 1: OUT OF 6KM RADIUS NOTICE (MANDATORY REQUIREMENT) */}
      {isOutOfRadius && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 shadow-md space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <i className="fa-solid fa-circle-xmark text-red-600 text-lg mt-0.5 shrink-0"></i>
            <div className="space-y-1">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-red-700 dark:text-red-300">
                You are in out of 6km radius, Delivery unavailable
              </h4>
              <p className="text-[11px] text-red-600/90 dark:text-red-400 leading-relaxed font-medium">
                Your pinned GPS location is <strong>{distanceFromHub.toFixed(2)} km</strong> from our Handapangoda Hub. Our express delivery is strictly limited to locations within <strong>6.0 km</strong> to guarantee hot and fresh food.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-200 dark:border-red-900/60">
            <button
              type="button"
              onClick={handleResetToHub}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
            >
              <i className="fa-solid fa-house"></i>
              <span>Pin Inside 6km Hub Area</span>
            </button>
            <span className="text-[11px] text-red-500 font-semibold">
              or switch order type to <strong>Takeaway Pick-up</strong> below.
            </span>
          </div>
        </div>
      )}

      {/* NOTICE 2: WITHIN 6KM RADIUS SUCCESS BADGE (MANDATORY REQUIREMENT) */}
      {!isOutOfRadius && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-check text-emerald-500 text-base"></i>
            <span>
              GPS Location Verified: <strong>{distanceFromHub.toFixed(2)} km</strong> from Catering Hub
            </span>
          </div>
          <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Delivery Eligible
          </span>
        </div>
      )}

      {/* Pinned Address Details Box */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#26201d] border border-slate-200 dark:border-white/10 text-xs space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-location-dot text-[#E36727] text-base"></i>
            <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Pinned Doorstep Address
            </span>
          </div>

          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E36727] hover:underline cursor-pointer"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            <span>Open in Google Maps</span>
          </a>
        </div>

        <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed pl-6">
          {geocoding ? (
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block"></span>
              Fetching doorstep address from GPS...
            </span>
          ) : (
            resolvedAddress || `Coordinates: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
          )}
        </p>

        <div className="pl-6 pt-1 text-[11px] text-slate-400 flex items-center gap-3">
          <span>Lat: {coords.lat.toFixed(5)}</span>
          <span>•</span>
          <span>Lng: {coords.lng.toFixed(5)}</span>
          <span>•</span>
          <span className={isOutOfRadius ? "text-red-500 font-bold" : "text-emerald-500 font-bold"}>
            Distance: {distanceFromHub.toFixed(2)} km
          </span>
        </div>
      </div>
    </div>
  );
}
