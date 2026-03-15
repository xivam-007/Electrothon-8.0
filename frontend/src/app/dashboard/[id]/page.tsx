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
  status: "PENDING" | "INITIATED" | "CONFIRMED" | "PAYMENT" | "INTRANSIT" | "DELIVERED" | "CANCELLED";
  vehicleId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
}

const statusConfig: Record<string, { label: string; dot: string; badge: string; bar: string }> = {
  PENDING:   { label: "Pending",    dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-200",       bar: "bg-amber-400"   },
  INITIATED: { label: "Initiated",  dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 ring-blue-200",          bar: "bg-blue-400"    },
  CONFIRMED: { label: "Confirmed",  dot: "bg-sky-400",     badge: "bg-sky-50 text-sky-700 ring-sky-200",             bar: "bg-sky-400"     },
  PAYMENT:   { label: "Payment",    dot: "bg-yellow-400",  badge: "bg-yellow-50 text-yellow-700 ring-yellow-200",    bar: "bg-yellow-400"  },
  INTRANSIT: { label: "In Transit", dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 ring-violet-200",    bar: "bg-violet-500"  },
  DELIVERED: { label: "Delivered",  dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled",  dot: "bg-rose-400",    badge: "bg-rose-50 text-rose-700 ring-rose-200",          bar: "bg-rose-400"    },
};

const steps = ["PENDING", "INITIATED", "CONFIRMED", "PAYMENT", "INTRANSIT", "DELIVERED"] as const;
type Step = typeof steps[number];

const stepIndex = (status: Orders["status"]) => {
  if (status === "CANCELLED") return -1;
  return steps.indexOf(status as Step);
};

const shortCode  = (id: string) => id.slice(-6).toUpperCase();
const barWidths  = ["0%", "20%", "40%", "60%", "80%", "100%"];

// ── STATUS RANK HELPERS ──────────────────────────────────────────────────────
const STATUS_RANK: Record<string, number> = {
  PENDING: 0, INITIATED: 1, CONFIRMED: 2,
  PAYMENT: 3, INTRANSIT: 4, DELIVERED: 5, CANCELLED: 6,
};

/** PENDING | INITIATED | CONFIRMED → strictly before PAYMENT */
const isBeforePayment  = (s: string) => (STATUS_RANK[s] ?? 99) < STATUS_RANK["PAYMENT"];

/** CONFIRMED only → show Pay Now */
const isConfirmedOnly  = (s: string) => s === "CONFIRMED";

/** CONFIRMED → DELIVERED → show PDF / Receipt */
const isPdfVisible = (s: string) => {
  const r = STATUS_RANK[s] ?? 99;
  return r >= STATUS_RANK["CONFIRMED"] && r <= STATUS_RANK["DELIVERED"];
};

// ── UTILITIES ────────────────────────────────────────────────────────────────
const formatIndianDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      .format(date).replace(/ /g, "-");
  } catch { return dateString; }
};

const formatIndianTime = (timeString?: string) => {
  if (!timeString) return "—";
  try {
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      const [h, m] = timeString.split(":");
      const d = new Date();
      d.setHours(parseInt(h, 10), parseInt(m, 10));
      return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    const date = new Date(timeString);
    if (!isNaN(date.getTime()))
      return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    return timeString;
  } catch { return timeString; }
};

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { isAuthenticated } = useAuth();
  const router  = useRouter();
  const params  = useParams();
  const id      = params.id as string;

  const [order,   setOrder]   = useState<Orders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await connectToBackendServices.getUserOrderById(id);
      if (response?.success) setOrder(response.data);
      else setError(response?.message || "Failed to load order.");
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Something went wrong while loading this order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    fetchOrder();
  }, [id, isAuthenticated, router, fetchOrder]);

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center">
      <style>{BTN_CSS}</style>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading order…</p>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center px-6">
      <style>{BTN_CSS}</style>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-900 mb-1">Couldn't load order</p>
        <p className="text-xs text-slate-400 mb-5">{error || "Order not found."}</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );

  const cfg         = statusConfig[order.status] ?? statusConfig["PENDING"];
  const currentStep = stepIndex(order.status);

  const vehicleInfo     = VEHICLES.find((v) => v.id === order.vehicleId);
  const vehicleName     = vehicleInfo?.name     || order.vehicleId || "Unknown Vehicle";
  const vehicleIcon     = vehicleInfo?.icon     || "🚚";
  const vehicleCapacity = vehicleInfo?.capacity ? `${vehicleInfo.capacity} Kg` : "—";

  const showCancel  = isBeforePayment(order.status);   // PENDING | INITIATED | CONFIRMED
  const showPayment = isConfirmedOnly(order.status);   // CONFIRMED only
  const showPdf     = isPdfVisible(order.status);      // CONFIRMED → DELIVERED

  return (
    <div className="min-h-screen bg-[#f5f5f3] font-sans">
      <style>{BTN_CSS}</style>
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-5">

        {/* ── BACK + TITLE ROW ── */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>

          {/* Title left · buttons right — identical vertical rhythm */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Order Details</p>
              <h1 className="text-3xl font-bold text-slate-900 font-mono">#{shortCode(order._id)}</h1>
            </div>

            {/* ── ACTION CLUSTER ── only renders when at least one button is visible */}
            {(showCancel || showPayment || showPdf) && (
              <div className="od-cluster">

                {/* PAY NOW — CONFIRMED only */}
                {showPayment && (
                  <Link href={`/payment/${order._id}`} className="od-btn od-pay">
                    <span className="od-btn-shimmer" aria-hidden="true" />
                    {/* credit-card icon */}
                    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Pay Now
                  </Link>
                )}

                {/* RECEIPT PDF — CONFIRMED → DELIVERED */}
                {showPdf && (
                  <button
                    className="od-btn od-pdf"
                    onClick={() => router.push(`/pdf/${order._id}`)}
                  >
                    {/* download icon */}
                    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Receipt
                  </button>
                )}

                {/* CANCEL — PENDING | INITIATED | CONFIRMED */}
                {showCancel && (
                  <button
                    className="od-btn od-cancel"
                    onClick={() => console.log("Cancel order", order._id)}
                  >
                    {/* x icon */}
                    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6"  y1="6" x2="18" y2="18"/>
                    </svg>
                    Cancel
                  </button>
                )}

              </div>
            )}
          </div>
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
                  const isDone   = i < currentStep;
                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isDone   ? "bg-violet-600 border-violet-600" :
                        isActive ? "bg-white border-violet-600 ring-4 ring-violet-100" :
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
              <div className="flex flex-col items-center pt-1 gap-1 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-100" />
                <div className="w-px flex-1 bg-slate-200 min-h-[4rem]" />
                <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              </div>
              <div className="flex flex-col gap-6 flex-1 min-w-0">
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

// ── INJECTED BUTTON STYLES ─────────────────────────────────────────────────────
const BTN_CSS = `

  /* ── cluster wrapper ── */
  .od-cluster {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* ── base pill shared by all three ── */
  .od-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 15px;
    border-radius: 11px;
    border: none;
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 650;
    letter-spacing: 0.015em;
    text-decoration: none !important;
    white-space: nowrap;
    overflow: hidden;
    /* spring-y lift on hover */
    transition:
      transform   0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow  0.2s ease,
      background  0.15s ease,
      color       0.15s ease;
  }
  .od-btn:hover  { transform: translateY(-2px); }
  .od-btn:active { transform: translateY(0) scale(0.96); transition-duration: 0.08s; }

  /* shared icon sizing */
  .od-icon {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .od-btn:hover .od-icon { transform: scale(1.18); }

  /* ────────────────────────────────────────
     PAY NOW — indigo-blue gradient, glowing
  ──────────────────────────────────────── */
  .od-pay {
    background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
    color: #fff !important;
    box-shadow:
      0 1px 3px rgba(67, 56, 202, 0.25),
      0 3px 10px rgba(67, 56, 202, 0.20);
  }
  .od-pay:hover {
    box-shadow:
      0 4px 16px rgba(67, 56, 202, 0.42),
      0 1px 4px rgba(0,0,0,0.12);
  }

  /* travelling shimmer sweep on Pay Now hover */
  .od-btn-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      110deg,
      transparent 25%,
      rgba(255,255,255,0.38) 50%,
      transparent 75%
    );
    background-size: 200% 100%;
    opacity: 0;
    border-radius: inherit;
    pointer-events: none;
    animation: odShimmer 1.5s ease-in-out infinite paused;
  }
  .od-pay:hover .od-btn-shimmer {
    opacity: 1;
    animation-play-state: running;
  }
  @keyframes odShimmer {
    0%   { background-position:  200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ────────────────────────────────────────
     RECEIPT — clean slate ghost
  ──────────────────────────────────────── */
  .od-pdf {
    background: #fff;
    color: #475569;
    box-shadow:
      0 0 0 1.5px #e2e8f0,
      0 1px 3px rgba(15,23,42,0.05);
  }
  .od-pdf:hover {
    background: #f8fafc;
    color: #1e293b;
    box-shadow:
      0 0 0 1.5px #cbd5e1,
      0 4px 12px rgba(15,23,42,0.09);
  }
  .od-pdf:hover .od-icon { transform: translateY(2px) scale(1.1); }

  /* ────────────────────────────────────────
     CANCEL — rose-tinted danger
  ──────────────────────────────────────── */
  .od-cancel {
    background: #fff1f2;
    color: #be123c;
    box-shadow:
      0 0 0 1.5px #fecdd3,
      0 1px 3px rgba(190,18,60,0.06);
  }
  .od-cancel:hover {
    background: #ffe4e6;
    color: #9f1239;
    box-shadow:
      0 0 0 1.5px #fda4af,
      0 4px 14px rgba(190,18,60,0.15);
  }
  .od-cancel:hover .od-icon {
    transform: rotate(90deg) scale(1.15);
  }
`;