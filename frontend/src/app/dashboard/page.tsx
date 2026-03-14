'use client';

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link';
import { connectToBackendServices } from '@/services/connectToBackend';
import { VEHICLES } from '../new-move/page';
// ── Vehicle definitions (imported or co-located) ─────────────────────────────

const getVehicle = (id: string) => VEHICLES.find((v) => v.id === id) ?? null;

// ── Orders interface ──────────────────────────────────────────────────────────
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

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
  pending:   { label: "Pending",    dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-200"   },
  initiated: { label: "Initiated",  dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 ring-blue-200"      },
  loaded:    { label: "Loaded",     dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 ring-orange-200" },
  intransit: { label: "In Transit", dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 ring-violet-200" },
  delivered: { label: "Delivered",  dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  cancelled: { label: "Cancelled",  dot: "bg-rose-400",    badge: "bg-rose-50 text-rose-700 ring-rose-200"      },
};

const fallbackConfig = { label: "Unknown", dot: "bg-slate-400", badge: "bg-slate-50 text-slate-700 ring-slate-200" };

// ── Helpers ───────────────────────────────────────────────────────────────────
const shortCode = (id: string) => (id ? id.slice(-6).toUpperCase() : 'N/A');

const formatIndianDate = (dateStr: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Try parsing "YYYY-MM-DD" directly
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const month = months[parseInt(parts[1], 10) - 1];
      return `${parseInt(parts[2], 10)} - ${month} - ${parts[0]}`;
    }
    return dateStr;
  }
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} - ${months[d.getMonth()]} - ${d.getFullYear()}`;
};

const normalizeStatus = (status?: string) => (status || '').toLowerCase().replace(/\s+/g, '');

// ── Component ─────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const router = useRouter();
  const authContext = useAuth();
  const [orders, setOrders] = useState<Orders[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await connectToBackendServices.getUserOrders();
      if (response?.success) {
        setOrders(response.data);
      } else {
        console.error('Failed to fetch orders:', response?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authContext.isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [authContext.isAuthenticated, router, authContext.userId, fetchOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const initials = authContext.userName
    ? authContext.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const delivered = orders.filter(o => normalizeStatus(o.status) === 'delivered').length;
  const inTransit = orders.filter(o => normalizeStatus(o.status) === 'intransit').length;
  const pending   = orders.filter(o => ['pending', 'initiated', 'loaded'].includes(normalizeStatus(o.status))).length;

  return (
    <div className="min-h-screen bg-[#f5f5f3] font-sans">
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ── PAGE TITLE ── */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        </div>

        {/* ── STAT PILLS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: orders.length, color: "text-slate-900"    },
            { label: "Delivered",    value: delivered,     color: "text-emerald-600"  },
            { label: "In Transit",   value: inTransit,     color: "text-violet-600"   },
            { label: "Pending",      value: pending,       color: "text-amber-600"    },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── ACCOUNT CARD ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-slate-900 leading-none">{authContext.userName}</p>
              <p className="text-xs text-slate-400 mt-0.5">Account Information</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              { label: "Full Name",   value: authContext.userName },
              { label: "Phone",       value: `+91 ${authContext.userPhone?.slice(3)}` },
              { label: "Account ID",  value: authContext.userId },
            ].map(field => (
              <div key={field.label} className="px-6 py-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{field.label}</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{field.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ORDERS ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">Your Orders</h2>
            <span className="text-sm text-slate-400">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 17m8 4V10" />
                </svg>
              </div>
              <p className="font-semibold text-slate-700">No orders yet</p>
              <p className="text-sm text-slate-400">Your shipments will appear here once placed.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {orders.map((order) => {
                const key = normalizeStatus(order.status);
                const cfg = statusConfig[key] ?? { ...fallbackConfig, label: order.status || 'Unknown' };
                const vehicle = getVehicle(order.vehicleId);

                return (
                  <Link
                    key={order._id || Math.random().toString()}
                    href={`/dashboard/${order._id}`}
                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 overflow-hidden"
                  >
                    {/* ── Card header: shipment ID + status ── */}
                    <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Shipment</p>
                        <p className="text-lg font-bold text-slate-900 font-mono tracking-wide">
                          #{shortCode(order._id)}
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ${cfg.badge} mt-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* ── Vehicle row ── */}
                    <div className="px-6 pb-4">
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${vehicle ? 'bg-slate-50' : 'bg-slate-50'}`}>
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                          {vehicle?.icon ?? '🚛'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 leading-none">
                            {vehicle?.name ?? order.vehicleId}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {vehicle?.capacity ?? 'Unknown capacity'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Route ── */}
                    <div className="px-6 pb-4">
                      <div className="flex gap-3 items-stretch">
                        {/* Timeline dots */}
                        <div className="flex flex-col items-center pt-1 gap-1 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-slate-900" />
                          <div className="w-px flex-1 bg-slate-200 min-h-[1.5rem]" />
                          <div className="w-2 h-2 rounded-full border-2 border-slate-900" />
                        </div>

                        <div className="flex flex-col gap-2 min-w-0">
                          <div>
                            <p className="text-xs text-slate-400">Pickup</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">{order.pickupLocation}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Dropoff</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">{order.dropoffLocation}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Footer: dates ── */}
                    <div className="border-t border-slate-100 px-6 py-3.5 grid grid-cols-2 gap-3 bg-slate-50/60">
                      <div>
                        <p className="text-xs text-slate-400">Pickup Date</p>
                        <p className="text-sm font-semibold text-slate-900">{formatIndianDate(order.pickupDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Delivery Date</p>
                        <p className="text-sm font-semibold text-slate-900">{formatIndianDate(order.deliveryDate)}</p>
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;