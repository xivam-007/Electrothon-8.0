"use client";

import { useEffect, useRef, useState } from "react";

interface OrderRouteMapProps {
  pickupLocation: string;
  dropoffLocation: string;
}

interface Coords {
  lat: number;
  lon: number;
}

interface RouteInfo {
  coords: [number, number][];
  distanceKm: string;
}

// Geocode with Nominatim — tries full query first, then progressively simpler ones
async function geocode(place: string): Promise<Coords | null> {
  const queries = [
    place,
    place + ", India",
    place.split(",").slice(-2).join(",").trim(),
    place.split(",").slice(-1)[0].trim(),
  ].filter(Boolean);

  for (const q of queries) {
    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(q)}` +
        `&format=json&limit=1&countrycodes=in&accept-language=en`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "DeliveryTracker/1.0 (order-tracking-app)",
          "Accept-Language": "en",
        },
      });

      if (!res.ok) continue;
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.warn(`Geocode attempt failed for "${q}":`, e);
    }
  }

  console.error(`Could not geocode: "${place}"`);
  return null;
}

// Get driving route + distance + duration from OSRM (free, no API key)
async function getRoute(origin: Coords, destination: Coords): Promise<RouteInfo | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origin.lon},${origin.lat};${destination.lon},${destination.lat}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.length) return null;

    const route = data.routes[0];

    const coords: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    );

    const distanceKm = (route.distance / 1000).toFixed(1);

    return { coords, distanceKm };
  } catch (e) {
    console.warn("OSRM route fetch failed:", e);
    return null;
  }
}

export default function OrderRouteMap({ pickupLocation, dropoffLocation }: OrderRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("Couldn't resolve locations.");
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: string} | null>(null);

  useEffect(() => {
    if (!pickupLocation || !dropoffLocation) return;

    let cancelled = false;

    const init = async () => {
      setStatus("loading");
      setRouteInfo(null);

      // ── 1. Inject Leaflet CSS once ──
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // ── 2. Dynamic Leaflet import (SSR-safe) ──
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;

      // ── 3. Teardown any existing map ──
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // ── 4. Geocode both locations in parallel ──
      const [origin, destination] = await Promise.all([
        geocode(pickupLocation),
        geocode(dropoffLocation),
      ]);

      if (cancelled) return;

      if (!origin) {
        setErrorMsg(`Could not find: "${pickupLocation}"`);
        setStatus("error");
        return;
      }
      if (!destination) {
        setErrorMsg(`Could not find: "${dropoffLocation}"`);
        setStatus("error");
        return;
      }

      // ── 5. Init map ──
      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // ── 6. Custom SVG markers ──
      const svgMarker = (color: string, label: string) =>
        L.divIcon({
          className: "",
          html: `
            <div style="position:relative;width:28px;height:36px;">
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="${color}"/>
                <circle cx="14" cy="14" r="6" fill="white"/>
              </svg>
              <div style="
                position:absolute;top:-22px;left:50%;transform:translateX(-50%);
                background:${color};color:white;font-size:9px;font-weight:700;
                padding:2px 6px;border-radius:4px;white-space:nowrap;font-family:sans-serif;
                box-shadow:0 1px 4px rgba(0,0,0,0.25);
              ">${label}</div>
            </div>`,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36],
        });

      L.marker([origin.lat, origin.lon], { icon: svgMarker("#3b82f6", "Pickup") }).addTo(map);
      L.marker([destination.lat, destination.lon], { icon: svgMarker("#10b981", "Delivery") }).addTo(map);

      // ── 7. Fetch route + distance ──
      const result = await getRoute(origin, destination);
      if (cancelled) return;

      if (result && result.coords.length > 0) {
        const poly = L.polyline(result.coords, {
          color: "#7c3aed",
          weight: 4,
          opacity: 0.85,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map);
        map.fitBounds(poly.getBounds(), { padding: [40, 40] });
        setRouteInfo({ distanceKm: result.distanceKm});
      } else {
        // Straight-line fallback (no distance shown)
        const straight = L.polyline(
          [[origin.lat, origin.lon], [destination.lat, destination.lon]],
          { color: "#7c3aed", weight: 3, dashArray: "8 6", opacity: 0.7 }
        ).addTo(map);
        map.fitBounds(straight.getBounds(), { padding: [48, 48] });
      }

      setStatus("ready");
    };

    init();
    return () => { cancelled = true; };
  }, [pickupLocation, dropoffLocation]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Map canvas */}
      <div ref={mapRef} className="h-full w-full" />

      {/* ── Distance / Duration info pill (bottom-left, above attribution) ── */}
      {status === "ready" && routeInfo && (
        <div className="absolute bottom-6 left-3 z-[400] flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-100 shadow-md rounded-xl px-3 py-2 pointer-events-none">
          {/* Distance */}
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-bold text-slate-800">{routeInfo.distanceKm} km</span>
          </div>

          <div className="w-px h-3 bg-slate-200" />        </div>
      )}

      {/* Loading overlay */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-2 z-10 pointer-events-none">
          <div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Resolving route…</p>
        </div>
      )}

      {/* Error overlay */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-1.5 z-10 px-6 text-center">
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center mb-1">
            <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-600">{errorMsg}</p>
          <p className="text-[11px] text-slate-400">Try a more general address (e.g. city, state)</p>
        </div>
      )}
    </div>
  );
}