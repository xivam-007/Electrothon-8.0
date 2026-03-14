"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { connectToBackendServices } from "@/services/connectToBackend";
import { useAuth } from "@/context/AuthContext";
import OrderRouteMap from "@/components/OrderRouteMap";
import { VEHICLES } from "@/app/new-move/page";

export interface Orders {
  _id: string;
  status: "PENDING" | "INITIATED" | "LOADED" | "INTRANSIT" | "DELIVERED" | "CANCELLED";
  vehicleId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
}

const statusConfig: Record<string, { label: string; dot: string; badge: string; bar: string }> = {
  PENDING:   { label: "Pending",    dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-200",     bar: "bg-amber-400" },
  INITIATED: { label: "Initiated",  dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 ring-blue-200",        bar: "bg-blue-400" },
  LOADED:    { label: "Loaded",     dot: "bg-sky-400",     badge: "bg-sky-50 text-sky-700 ring-sky-200",           bar: "bg-sky-400" },
  INTRANSIT: { label: "In Transit", dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 ring-violet-200",  bar: "bg-violet-500" },
  DELIVERED: { label: "Delivered",  dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled",  dot: "bg-rose-400",    badge: "bg-rose-50 text-rose-700 ring-rose-200",        bar: "bg-rose-400" },
};

const steps = ["PENDING", "INITIATED", "LOADED", "INTRANSIT", "DELIVERED"] as const;
type Step = typeof steps[number];

const stepIndex = (status: Orders["status"]) => {
  if (status === "CANCELLED") return -1;
  return steps.indexOf(status as Step);
};

const shortCode = (id: string) => id.slice(-6).toUpperCase();

// Progress bar width per step index (0–4)
const barWidths = ["0%", "25%", "50%", "75%", "100%"];

// ── UTILITIES ──
const formatIndianDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as-is if invalid

    const formatter = new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    // Format returns "19 Dec 2025", replace spaces with hyphens
    return formatter.format(date).replace(/ /g, '-');
  } catch (error) {
    return dateString;
  }
};

const formatIndianTime = (timeString?: string) => {
  if (!timeString) return "—";
  try {
    // If time is passed as raw "HH:mm" (e.g., "14:30")
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      const [h, m] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(h, 10), parseInt(m, 10));
      return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    // If it's a full ISO string
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return timeString;
  } catch (error) {
    return timeString;
  }
};


export default function OrderDetailPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Orders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await connectToBackendServices.getUserOrderById(id);
      if (response?.success) {
        setOrder(response.data);
      } else {
        setError(response?.message || "Failed to load order.");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Something went wrong while loading this order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchOrder();
  }, [id, isAuthenticated, router, fetchOrder]);

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading order…</p>
        </div>
      </div>
    );
  }

  // ── ERROR ──
  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-900 mb-1">Couldn't load order</p>
          <p className="text-xs text-slate-400 mb-5">{error || "Order not found."}</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const cfg = statusConfig[order.status] ?? statusConfig["PENDING"];
  const currentStep = stepIndex(order.status);

  // ── MAP VEHICLE DATA ──
  const vehicleInfo = VEHICLES.find(v => v.id === order.vehicleId);
  const vehicleName = vehicleInfo?.name || order.vehicleId || "Unknown Vehicle";
  const vehicleIcon = vehicleInfo?.icon || "🚚";
  const vehicleCapacity = vehicleInfo?.capacity ? `${vehicleInfo.capacity} Kg` : "—";

  return (
    <div className="min-h-screen bg-[#f5f5f3] font-sans">
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-5">

        {/* ── BACK + TITLE ── */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Order Details</p>
          <h1 className="text-3xl font-bold text-slate-900 font-mono">#{shortCode(order._id)}</h1>
        </div>

        {/* ── HERO STATUS CARD ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Shipment ID</p>
              <p className="text-sm font-bold text-slate-700 font-mono tracking-wide">#{shortCode(order._id)}</p>
            </div>
          </div>

          {/* Progress steps */}
          {order.status !== "CANCELLED" ? (
            <div>
              <div className="relative flex items-center justify-between mb-3">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-slate-100 z-0" />
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-px z-0 transition-all duration-700 ${cfg.bar}`}
                  style={{ width: currentStep >= 0 ? barWidths[currentStep] : "0%" }}
                />
                {steps.map((step, i) => {
                  const isActive = i === currentStep;
                  const isDone = i < currentStep;
                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isDone    ? "bg-violet-600 border-violet-600" :
                        isActive  ? "bg-white border-violet-600 ring-4 ring-violet-100" :
                                    "bg-white border-slate-200"
                      }`}>
                        {isDone && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1.5 5.5l2.5 2.5 4.5-5" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between">
                {steps.map((step, i) => (
                  <p key={step} className={`text-[10px] font-semibold uppercase tracking-wider ${
                    i <= currentStep ? "text-slate-700" : "text-slate-300"
                  }`}>
                    {statusConfig[step].label}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
              <p className="text-sm font-medium text-rose-700">This order has been cancelled.</p>
            </div>
          )}
        </div>

        {/* ── VEHICLE ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-900">Vehicle Assignment</p>
          </div>
          <div className="px-6 py-5 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-2xl flex-shrink-0">
                {vehicleIcon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{vehicleName}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Capacity: {vehicleCapacity}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Vehicle ID</p>
              <p className="text-xs font-mono text-slate-600 bg-slate-200/50 px-2 py-1 rounded-md">{order.vehicleId}</p>
            </div>
          </div>
        </div>

        {/* ── ROUTE ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-900">Route</p>
          </div>
          <div className="px-6 py-5">
            <div className="flex gap-5 items-stretch">

              {/* Timeline */}
              <div className="flex flex-col items-center pt-1 gap-1 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-100" />
                <div className="w-px flex-1 bg-slate-200 min-h-[4rem]" />
                <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              </div>

              <div className="flex flex-col gap-6 flex-1 min-w-0">
                {/* Pickup */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Pickup</p>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{order.pickupLocation}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatIndianDate(order.pickupDate)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatIndianTime(order.pickupTime)}
                    </span>
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Delivery</p>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{order.dropoffLocation}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatIndianDate(order.deliveryDate)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatIndianTime(order.deliveryTime)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── MAP ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-900">Map View</p>
          </div>
          <div className="h-64 w-full bg-slate-50 relative">
            <OrderRouteMap
              pickupLocation={order.pickupLocation}
              dropoffLocation={order.dropoffLocation}
            />
          </div>
        </div>

      </main>
    </div>
  );
}