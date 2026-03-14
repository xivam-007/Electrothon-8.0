// 'use client';

// import { useCallback, useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/context/AuthContext'
// import Link from 'next/link';
// import { connectToBackendServices } from '@/services/connectToBackend';
// import { VEHICLES } from '../new-move/page';
// // ── Vehicle definitions (imported or co-located) ─────────────────────────────

// const getVehicle = (id: string) => VEHICLES.find((v) => v.id === id) ?? null;

// // ── Orders interface ──────────────────────────────────────────────────────────
// export interface Orders {
//   _id: string;
//   status: "PENDING" | "INITIATED" | "LOADED" | "INTRANSIT" | "DELIVERED" | "CANCELLED";
//   vehicleId: string;
//   pickupLocation: string;
//   dropoffLocation: string;
//   pickupDate: string;
//   pickupTime: string;
//   deliveryDate: string;
//   deliveryTime: string;
// }

// // ── Status config ─────────────────────────────────────────────────────────────
// const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
//   pending:   { label: "Pending",    dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-200"   },
//   initiated: { label: "Initiated",  dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 ring-blue-200"      },
//   loaded:    { label: "Loaded",     dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 ring-orange-200" },
//   intransit: { label: "In Transit", dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 ring-violet-200" },
//   delivered: { label: "Delivered",  dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
//   cancelled: { label: "Cancelled",  dot: "bg-rose-400",    badge: "bg-rose-50 text-rose-700 ring-rose-200"      },
// };

// const fallbackConfig = { label: "Unknown", dot: "bg-slate-400", badge: "bg-slate-50 text-slate-700 ring-slate-200" };

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const shortCode = (id: string) => (id ? id.slice(-6).toUpperCase() : 'N/A');

// const formatIndianDate = (dateStr: string) => {
//   if (!dateStr) return '—';
//   const d = new Date(dateStr);
//   if (isNaN(d.getTime())) {
//     // Try parsing "YYYY-MM-DD" directly
//     const parts = dateStr.split('-');
//     if (parts.length === 3) {
//       const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
//       const month = months[parseInt(parts[1], 10) - 1];
//       return `${parseInt(parts[2], 10)} - ${month} - ${parts[0]}`;
//     }
//     return dateStr;
//   }
//   const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
//   return `${d.getDate()} - ${months[d.getMonth()]} - ${d.getFullYear()}`;
// };

// const normalizeStatus = (status?: string) => (status || '').toLowerCase().replace(/\s+/g, '');

// // ── Component ─────────────────────────────────────────────────────────────────
// const DashboardPage = () => {
//   const router = useRouter();
//   const authContext = useAuth();
//   const [orders, setOrders] = useState<Orders[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchOrders = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await connectToBackendServices.getUserOrders();
//       if (response?.success) {
//         setOrders(response.data);
//       } else {
//         console.error('Failed to fetch orders:', response?.message || 'Unknown error');
//       }
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!authContext.isAuthenticated) {
//       router.push('/login');
//       return;
//     }
//     fetchOrders();
//   }, [authContext.isAuthenticated, router, authContext.userId, fetchOrders]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
//           <p className="text-sm text-slate-500 font-medium">Loading your dashboard…</p>
//         </div>
//       </div>
//     );
//   }

//   const initials = authContext.userName
//     ? authContext.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
//     : '??';

//   const delivered = orders.filter(o => normalizeStatus(o.status) === 'delivered').length;
//   const inTransit = orders.filter(o => normalizeStatus(o.status) === 'intransit').length;
//   const pending   = orders.filter(o => ['pending', 'initiated', 'loaded'].includes(normalizeStatus(o.status))).length;

//   return (
//     <div className="min-h-screen bg-[#f5f5f3] font-sans">
//       <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

//         {/* ── PAGE TITLE ── */}
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
//         </div>

//         {/* ── STAT PILLS ── */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//           {[
//             { label: "Total Orders", value: orders.length, color: "text-slate-900"    },
//             { label: "Delivered",    value: delivered,     color: "text-emerald-600"  },
//             { label: "In Transit",   value: inTransit,     color: "text-violet-600"   },
//             { label: "Pending",      value: pending,       color: "text-amber-600"    },
//           ].map(stat => (
//             <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
//               <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
//               <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
//             </div>
//           ))}
//         </div>

//         {/* ── ACCOUNT CARD ── */}
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//           <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
//               {initials}
//             </div>
//             <div>
//               <p className="font-semibold text-slate-900 leading-none">{authContext.userName}</p>
//               <p className="text-xs text-slate-400 mt-0.5">Account Information</p>
//             </div>
//           </div>

//           <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
//             {[
//               { label: "Full Name",   value: authContext.userName },
//               { label: "Phone",       value: `+91 ${authContext.userPhone?.slice(3)}` },
//               { label: "Account ID",  value: authContext.userId },
//             ].map(field => (
//               <div key={field.label} className="px-6 py-4">
//                 <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{field.label}</p>
//                 <p className="text-sm font-semibold text-slate-900 truncate">{field.value}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ── ORDERS ── */}
//         <div>
//           <div className="flex items-center justify-between mb-5">
//             <h2 className="text-xl font-bold text-slate-900">Your Orders</h2>
//             <span className="text-sm text-slate-400">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
//           </div>

//           {orders.length === 0 ? (
//             <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center gap-3 text-center">
//               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
//                 <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 17m8 4V10" />
//                 </svg>
//               </div>
//               <p className="font-semibold text-slate-700">No orders yet</p>
//               <p className="text-sm text-slate-400">Your shipments will appear here once placed.</p>
//             </div>
//           ) : (
//             <div className="grid md:grid-cols-2 gap-5">
//               {orders.map((order) => {
//                 const key = normalizeStatus(order.status);
//                 const cfg = statusConfig[key] ?? { ...fallbackConfig, label: order.status || 'Unknown' };
//                 const vehicle = getVehicle(order.vehicleId);

//                 return (
//                   <Link
//                     key={order._id || Math.random().toString()}
//                     href={`/dashboard/${order._id}`}
//                     className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 overflow-hidden"
//                   >
//                     {/* ── Card header: shipment ID + status ── */}
//                     <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
//                       <div>
//                         <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Shipment</p>
//                         <p className="text-lg font-bold text-slate-900 font-mono tracking-wide">
//                           #{shortCode(order._id)}
//                         </p>
//                       </div>

//                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ${cfg.badge} mt-1`}>
//                         <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
//                         {cfg.label}
//                       </span>
//                     </div>

//                     {/* ── Vehicle row ── */}
//                     <div className="px-6 pb-4">
//                       <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${vehicle ? 'bg-slate-50' : 'bg-slate-50'}`}>
//                         <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
//                           {vehicle?.icon ?? '🚛'}
//                         </div>
//                         <div className="min-w-0">
//                           <p className="text-sm font-bold text-slate-900 leading-none">
//                             {vehicle?.name ?? order.vehicleId}
//                           </p>
//                           <p className="text-xs text-slate-400 mt-0.5">
//                             {vehicle?.capacity ?? 'Unknown capacity'}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* ── Route ── */}
//                     <div className="px-6 pb-4">
//                       <div className="flex gap-3 items-stretch">
//                         {/* Timeline dots */}
//                         <div className="flex flex-col items-center pt-1 gap-1 flex-shrink-0">
//                           <div className="w-2 h-2 rounded-full bg-slate-900" />
//                           <div className="w-px flex-1 bg-slate-200 min-h-[1.5rem]" />
//                           <div className="w-2 h-2 rounded-full border-2 border-slate-900" />
//                         </div>

//                         <div className="flex flex-col gap-2 min-w-0">
//                           <div>
//                             <p className="text-xs text-slate-400">Pickup</p>
//                             <p className="text-sm font-semibold text-slate-900 truncate">{order.pickupLocation}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs text-slate-400">Dropoff</p>
//                             <p className="text-sm font-semibold text-slate-900 truncate">{order.dropoffLocation}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* ── Footer: dates ── */}
//                     <div className="border-t border-slate-100 px-6 py-3.5 grid grid-cols-2 gap-3 bg-slate-50/60">
//                       <div>
//                         <p className="text-xs text-slate-400">Pickup Date</p>
//                         <p className="text-sm font-semibold text-slate-900">{formatIndianDate(order.pickupDate)}</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-400">Delivery Date</p>
//                         <p className="text-sm font-semibold text-slate-900">{formatIndianDate(order.deliveryDate)}</p>
//                       </div>
//                     </div>

//                   </Link>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//       </main>
//     </div>
//   );
// };

// export default DashboardPage;

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
        <style>{ANIM_CSS}</style>
        <div className="flex flex-col items-center gap-4">
          <div className="db-loader">
            <div className="db-loader-ring" />
            <div className="db-loader-ring" style={{ animationDelay: '-.4s' }} />
            <div className="db-loader-ring" style={{ animationDelay: '-.8s' }} />
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-wide">Loading your dashboard…</p>
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

  // dot color map (for inline styles since we can't use dynamic Tailwind)
  const dotColorMap: Record<string, string> = {
    'bg-amber-400': '#fbbf24', 'bg-blue-400': '#60a5fa',
    'bg-orange-400': '#fb923c', 'bg-violet-400': '#a78bfa',
    'bg-emerald-400': '#34d399', 'bg-rose-400': '#fb7185',
    'bg-slate-400': '#94a3b8',
  };
  const badgeStyleMap: Record<string, { bg: string; color: string; ring: string }> = {
    'bg-amber-50 text-amber-700 ring-amber-200':     { bg: '#fffbeb', color: '#b45309', ring: '#fde68a' },
    'bg-blue-50 text-blue-700 ring-blue-200':        { bg: '#eff6ff', color: '#1d4ed8', ring: '#bfdbfe' },
    'bg-orange-50 text-orange-700 ring-orange-200':  { bg: '#fff7ed', color: '#c2410c', ring: '#fed7aa' },
    'bg-violet-50 text-violet-700 ring-violet-200':  { bg: '#f5f3ff', color: '#6d28d9', ring: '#ddd6fe' },
    'bg-emerald-50 text-emerald-700 ring-emerald-200': { bg: '#ecfdf5', color: '#065f46', ring: '#a7f3d0' },
    'bg-rose-50 text-rose-700 ring-rose-200':        { bg: '#fff1f2', color: '#be123c', ring: '#fecdd3' },
    'bg-slate-50 text-slate-700 ring-slate-200':     { bg: '#f8fafc', color: '#334155', ring: '#e2e8f0' },
  };
  const accentBarMap: Record<string, string> = {
    'bg-amber-400': '#f59e0b', 'bg-blue-400': '#3b82f6',
    'bg-orange-400': '#f97316', 'bg-violet-400': '#8b5cf6',
    'bg-emerald-400': '#10b981', 'bg-rose-400': '#ef4444',
    'bg-slate-400': '#94a3b8',
  };

  return (
    <div className="db-root">
      <style>{ANIM_CSS}</style>

      {/* ── ambient background ── */}
      <div className="db-bg-orb db-bg-orb1" />
      <div className="db-bg-orb db-bg-orb2" />
      <div className="db-bg-grid" />

      <main className="db-main">

        {/* ── Page header ── */}
        <div className="db-page-hdr db-in db-in-0">
          <div>
            <p className="db-eyebrow">Welcome back 👋</p>
            <h1 className="db-page-title">Dashboard</h1>
          </div>
          <Link href="/new-move" className="db-new-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16m8-8H4"/></svg>
            New Pickup
          </Link>
        </div>

        {/* ── Stat cards ── */}
        <div className="db-stat-grid db-in db-in-1">
          {[
            { label: "Total Orders", value: orders.length, icon: "📦", dark: true,  accent: "#fff",    bg: "linear-gradient(135deg,#0f172a,#1e293b)" },
            { label: "Delivered",    value: delivered,     icon: "✅", dark: false, accent: "#059669", bg: "linear-gradient(135deg,#ecfdf5,#d1fae5)"  },
            { label: "In Transit",   value: inTransit,     icon: "🚛", dark: false, accent: "#7c3aed", bg: "linear-gradient(135deg,#f5f3ff,#ede9fe)"  },
            { label: "Pending",      value: pending,       icon: "⏳", dark: false, accent: "#d97706", bg: "linear-gradient(135deg,#fffbeb,#fef3c7)"  },
          ].map((s, i) => (
            <div key={s.label} className="db-stat-card" style={{ background: s.bg, animationDelay: `${0.1 + i * 0.07}s` }}>
              <div className="db-stat-row">
                <span className="db-stat-icon">{s.icon}</span>
                <span className="db-stat-label-pill" style={{
                  background: s.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  color: s.dark ? 'rgba(255,255,255,0.7)' : s.accent,
                }}>{s.label}</span>
              </div>
              <p className="db-stat-num" style={{ color: s.dark ? '#fff' : s.accent }}>{s.value}</p>
              <p className="db-stat-lbl" style={{ color: s.dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Account card ── */}
        <div className="db-acct-card db-in db-in-2">
          <div className="db-acct-hdr">
            <div className="db-acct-hdr-inner">
              <div className="db-acct-hdr-icon">👤</div>
              <div>
                <p className="db-acct-title">{authContext.userName}</p>
                <p className="db-acct-sub">Your personal details</p>
              </div>
            </div>
          </div>
          <div className="db-acct-fields">
            {[
              { label: "Full Name",  value: authContext.userName,                     icon: "🪪" },
              { label: "Phone",      value: `+91 ${authContext.userPhone?.slice(3)}`, icon: "📱" },
              { label: "Account ID", value: authContext.userId,                        icon: "🔑" },
            ].map(f => (
              <div key={f.label} className="db-acct-field">
                <span className="db-acct-field-icon">{f.icon}</span>
                <div>
                  <p className="db-acct-field-label">{f.label}</p>
                  <p className="db-acct-field-value">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Orders ── */}
        <div className="db-in db-in-3">
          <div className="db-orders-hdr">
            <div>
              <h2 className="db-orders-title">Your Orders</h2>
              <p className="db-orders-count">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">📭</div>
              <p className="db-empty-title">No orders yet</p>
              <p className="db-empty-sub">Your shipments will appear here once placed.</p>
            </div>
          ) : (
            <div className="db-order-grid">
              {orders.map((order) => {
                const key = normalizeStatus(order.status);
                const cfg = statusConfig[key] ?? { ...fallbackConfig, label: order.status || 'Unknown' };
                const vehicle = getVehicle(order.vehicleId);
                const dotColor  = dotColorMap[cfg.dot] ?? '#94a3b8';
                const badgeSty  = badgeStyleMap[cfg.badge] ?? { bg: '#f8fafc', color: '#334155', ring: '#e2e8f0' };
                const barColor  = accentBarMap[cfg.dot] ?? '#94a3b8';

                return (
                  <Link
                    key={order._id || Math.random().toString()}
                    href={`/dashboard/${order._id}`}
                    className="db-order-card"
                  >
                    {/* animated shimmer sweep on hover */}
                    <div className="db-card-shimmer" />

                    {/* color accent bar top */}
                    <div className="db-card-bar" style={{ background: barColor }} />

                    {/* Card header */}
                    <div className="db-card-hdr">
                      <div>
                        <p className="db-card-eye">Shipment</p>
                        <p className="db-card-id">#{shortCode(order._id)}</p>
                      </div>
                      <span className="db-badge" style={{
                        background: badgeSty.bg,
                        color: badgeSty.color,
                        boxShadow: `0 0 0 1px ${badgeSty.ring}`,
                      }}>
                        <span className="db-badge-dot" style={{ background: dotColor }} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Vehicle row */}
                    <div className="db-vehicle-row">
                      <div className="db-vehicle-icon-box">
                        {vehicle?.icon ?? '🚛'}
                      </div>
                      <div className="db-vehicle-info">
                        <p className="db-vehicle-name">{vehicle?.name ?? order.vehicleId}</p>
                        <p className="db-vehicle-cap">{vehicle?.capacity ?? 'Unknown capacity'}</p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="db-route">
                      <div className="db-route-tl">
                        <div className="db-tl-dot db-tl-dot-fill" />
                        <div className="db-tl-line">
                          <div className="db-tl-line-inner" />
                        </div>
                        <div className="db-tl-dot db-tl-dot-ring" />
                      </div>
                      <div className="db-route-locs">
                        <div>
                          <p className="db-route-label">Pickup</p>
                          <p className="db-route-value">{order.pickupLocation}</p>
                        </div>
                        <div>
                          <p className="db-route-label">Dropoff</p>
                          <p className="db-route-value">{order.dropoffLocation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="db-card-footer">
                      <div className="db-footer-cell">
                        <p className="db-footer-label">Pickup Date</p>
                        <p className="db-footer-value">{formatIndianDate(order.pickupDate)}</p>
                      </div>
                      <div className="db-footer-cell db-footer-cell-right">
                        <p className="db-footer-label">Delivery Date</p>
                        <p className="db-footer-value">{formatIndianDate(order.deliveryDate)}</p>
                      </div>
                      <span className="db-card-arrow">→</span>
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

// ── All animation & layout CSS ────────────────────────────────────────────────
const ANIM_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800;9..144,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

/* ── root ── */
.db-root {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'DM Sans', sans-serif;
  color: #0f172a;
  overflow-x: hidden;
  position: relative;
}

/* ── ambient bg ── */
.db-bg-orb {
  position: fixed; border-radius: 50%;
  pointer-events: none; z-index: 0;
  animation: dbOrbFloat 8s ease-in-out infinite;
}
.db-bg-orb1 {
  top: -140px; right: -100px;
  width: 620px; height: 620px;
  background: radial-gradient(circle, rgba(37,99,235,.08) 0%, transparent 68%);
}
.db-bg-orb2 {
  bottom: 40px; left: -120px;
  width: 480px; height: 480px;
  background: radial-gradient(circle, rgba(79,70,229,.06) 0%, transparent 68%);
  animation-delay: -4s;
}
@keyframes dbOrbFloat {
  0%,100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-18px) scale(1.03); }
}
.db-bg-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: radial-gradient(rgba(37,99,235,.055) 1px, transparent 1px);
  background-size: 28px 28px;
}

/* ── navbar ── */
.db-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 62px; padding: 0 28px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,.88);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(37,99,235,.09);
  box-shadow: 0 2px 14px rgba(15,23,42,.05);
}
.db-nav-logo { display: flex; align-items: center; gap: 10px; }
.db-nav-logo-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg,#2563eb,#4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(37,99,235,.28);
  transition: transform .3s cubic-bezier(.34,1.56,.64,1);
}
.db-nav-logo-icon:hover { transform: rotate(-8deg) scale(1.1); }
.db-nav-logo-text {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 19px; font-weight: 800;
  color: #0f172a; letter-spacing: -.02em;
}
.db-nav-logo-text b { color: #2563eb; }
.db-nav-right { display: flex; align-items: center; gap: 10px; }
.db-nav-avatar {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg,#2563eb,#4f46e5);
  color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(37,99,235,.25);
}
.db-nav-name { font-family: 'Fraunces', Georgia, serif; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1; }
.db-nav-sub  { font-size: 11px; color: #94a3b8; margin-top: 2px; }

/* ── main ── */
.db-main {
  position: relative; z-index: 1;
  max-width: 1060px; margin: 0 auto;
  padding: 88px 24px 80px;
}

/* ── staggered fade-up ── */
.db-in {
  opacity: 0; transform: translateY(24px);
  animation: dbFadeUp .6s cubic-bezier(.22,1,.36,1) forwards;
}
.db-in-0 { animation-delay: .05s; }
.db-in-1 { animation-delay: .14s; }
.db-in-2 { animation-delay: .23s; }
.db-in-3 { animation-delay: .32s; }
@keyframes dbFadeUp { to { opacity: 1; transform: translateY(0); } }

/* ── page header ── */
.db-page-hdr {
  display: flex; align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px; flex-wrap: wrap; gap: 14px;
}
.db-eyebrow    { font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 5px; }
.db-page-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 42px; font-weight: 900;
  color: #0f172a; letter-spacing: -.04em; line-height: 1.0;
}

/* ── new pickup btn ── */
.db-new-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border-radius: 12px;
  background: linear-gradient(135deg,#1d4ed8,#4f46e5);
  color: #fff !important; text-decoration: none !important;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 13px; font-weight: 700; letter-spacing: -.01em;
  box-shadow: 0 4px 16px rgba(37,99,235,.3);
  transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s;
  white-space: nowrap;
}
.db-new-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(37,99,235,.4); }
.db-new-btn:active { transform: translateY(0); }

/* ── stat grid ── */
.db-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px; margin-bottom: 18px;
}
.db-stat-card {
  border-radius: 20px; padding: 22px;
  border: 1px solid rgba(0,0,0,.04);
  box-shadow: 0 2px 10px rgba(15,23,42,.06);
  cursor: default; overflow: hidden; position: relative;
  opacity: 0; transform: translateY(16px) scale(.97);
  animation: dbStatIn .5s cubic-bezier(.22,1,.36,1) forwards;
  transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s;
}
.db-stat-card::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.18) 50%, rgba(255,255,255,0) 70%);
  background-size: 200% 200%;
  opacity: 0;
  transition: opacity .3s;
  animation: dbStatShimmer 2.4s ease-in-out infinite paused;
}
.db-stat-card:hover::before { opacity: 1; animation-play-state: running; }
@keyframes dbStatShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.db-stat-card:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 20px 50px rgba(15,23,42,.14); }
@keyframes dbStatIn { to { opacity: 1; transform: translateY(0) scale(1); } }
.db-stat-row  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.db-stat-icon { font-size: 24px; }
.db-stat-label-pill { font-size: 10px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; }
.db-stat-num  { font-family: 'Fraunces', Georgia, serif; font-size: 50px; font-weight: 900; line-height: 1; margin-bottom: 4px; letter-spacing: -.04em; }
.db-stat-lbl  { font-size: 12px; font-weight: 500; }

/* ── account card ── */
.db-acct-card {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 20px; overflow: hidden;
  margin-bottom: 18px;
  box-shadow: 0 2px 10px rgba(15,23,42,.05);
  transition: box-shadow .22s, transform .22s;
}
.db-acct-card:hover { box-shadow: 0 8px 28px rgba(15,23,42,.09); transform: translateY(-2px); }
.db-acct-hdr { padding: 18px 24px; border-bottom: 1px solid #f1f5f9; background: #fafbff; }
.db-acct-hdr-inner { display: flex; align-items: center; gap: 12px; }
.db-acct-hdr-icon { width: 40px; height: 40px; border-radius: 12px; background: #eff6ff; border: 1px solid #bfdbfe; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.db-acct-title { font-family: 'Fraunces', Georgia, serif; font-size: 15px; font-weight: 700; color: #0f172a; }
.db-acct-sub   { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.db-acct-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); }
.db-acct-field {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 24px; border-right: 1px solid #f1f5f9;
  transition: background .18s;
}
.db-acct-field:hover { background: #f8faff; }
.db-acct-field-icon  { font-size: 18px; flex-shrink: 0; }
.db-acct-field-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 3px; }
.db-acct-field-value { font-size: 13px; font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 240px; }

/* ── orders header ── */
.db-orders-hdr   { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 18px; }
.db-orders-title { font-family: 'Fraunces', Georgia, serif; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -.03em; }
.db-orders-count { font-size: 12px; color: #94a3b8; font-weight: 500; margin-top: 3px; }

/* ── order grid ── */
.db-order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px,1fr));
  gap: 16px;
}

/* ── order card ── */
.db-order-card {
  position: relative; background: #fff;
  border: 1px solid #e2e8f0; border-radius: 20px;
  overflow: hidden; text-decoration: none !important; color: inherit !important;
  display: flex; flex-direction: column;
  box-shadow: 0 2px 8px rgba(15,23,42,.05);
  transition: transform .28s cubic-bezier(.22,1,.36,1),
              box-shadow .28s cubic-bezier(.22,1,.36,1),
              border-color .2s;
  opacity: 0; transform: translateY(20px);
  animation: dbFadeUp .55s cubic-bezier(.22,1,.36,1) forwards;
}
.db-order-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 24px 60px rgba(15,23,42,.13), 0 6px 16px rgba(15,23,42,.07);
  border-color: #bfdbfe;
}
.db-order-card:active { transform: translateY(-2px); }

/* shimmer on hover */
.db-card-shimmer {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,.55) 50%, transparent 70%);
  background-size: 200% 100%; opacity: 0;
  transition: opacity .25s;
  animation: dbCardShimmer 1.2s ease-in-out infinite paused;
}
.db-order-card:hover .db-card-shimmer { opacity: 1; animation-play-state: running; }
@keyframes dbCardShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* top accent bar */
.db-card-bar { height: 3px; width: 100%; flex-shrink: 0; }

/* card header */
.db-card-hdr {
  display: flex; align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px 12px; gap: 12px;
}
.db-card-eye { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 4px; }
.db-card-id  { font-family: 'Fraunces', Georgia, serif; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -.01em; }

/* badge */
.db-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 100px;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.db-badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  animation: dbDotPulse 2.2s ease-in-out infinite;
}
@keyframes dbDotPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(.65)} }

/* vehicle row */
.db-vehicle-row { display: flex; align-items: center; gap: 12px; padding: 0 20px 14px; }
.db-vehicle-icon-box {
  width: 44px; height: 44px; border-radius: 13px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1);
}
.db-order-card:hover .db-vehicle-icon-box { transform: scale(1.1) rotate(-5deg); }
.db-vehicle-name { font-family: 'Fraunces', Georgia, serif; font-size: 14px; font-weight: 700; color: #0f172a; }
.db-vehicle-cap  { font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 2px; }

/* divider */
.db-route { display: flex; gap: 14px; padding: 14px 20px; border-top: 1px solid #f1f5f9; }

/* timeline */
.db-route-tl { display: flex; flex-direction: column; align-items: center; padding-top: 4px; flex-shrink: 0; }
.db-tl-dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.db-tl-dot-fill { background: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.15); }
.db-tl-dot-ring { border: 2px solid #3b82f6; background: #fff; }
.db-tl-line { width: 2px; flex: 1; background: #e2e8f0; margin: 5px 0; min-height: 22px; border-radius: 2px; overflow: hidden; }
.db-tl-line-inner {
  width: 100%; height: 40%;
  background: linear-gradient(to bottom, #3b82f6, transparent);
  animation: dbLineFlow 2s ease-in-out infinite paused;
}
.db-order-card:hover .db-tl-line-inner { animation-play-state: running; }
@keyframes dbLineFlow { 0%{transform:translateY(-100%)} 100%{transform:translateY(320%)} }

.db-route-locs   { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.db-route-label  { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 2px; }
.db-route-value  { font-size: 13px; font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* card footer */
.db-card-footer {
  display: flex; align-items: center;
  padding: 12px 20px; margin-top: auto;
  background: #fafbff; border-top: 1px solid #f1f5f9;
}
.db-footer-cell { flex: 1; }
.db-footer-cell-right { border-left: 1px solid #e2e8f0; padding-left: 16px; }
.db-footer-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 2px; }
.db-footer-value { font-family: 'Fraunces', Georgia, serif; font-size: 13px; font-weight: 700; color: #0f172a; }
.db-card-arrow {
  font-size: 16px; color: #94a3b8; margin-left: 10px; flex-shrink: 0;
  transition: transform .22s cubic-bezier(.22,1,.36,1), color .2s;
  display: inline-block;
}
.db-order-card:hover .db-card-arrow { transform: translateX(5px); color: #2563eb; }

/* ── empty state ── */
.db-empty {
  background: #fff; border: 1.5px dashed #e2e8f0;
  border-radius: 20px; padding: 64px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;
}
.db-empty-icon  { font-size: 48px; animation: dbBounce 2.4s ease-in-out infinite; }
@keyframes dbBounce { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-12px)} 55%{transform:translateY(-12px)} }
.db-empty-title { font-family: 'Fraunces', Georgia, serif; font-size: 22px; font-weight: 800; color: #0f172a; }
.db-empty-sub   { font-size: 14px; color: #94a3b8; max-width: 300px; line-height: 1.6; }

/* ── loader ── */
.db-load-wrap { min-height: 100vh; background: #f0f4ff; display: flex; align-items: center; justify-content: center; }
.db-load-box  { display: flex; flex-direction: column; align-items: center; gap: 18px; }
.db-load-txt  { font-size: 14px; color: #64748b; font-weight: 500; letter-spacing: .01em; }

.db-loader { position: relative; width: 44px; height: 44px; }
.db-loader-ring {
  position: absolute; inset: 0;
  border-radius: 50%; border: 3px solid transparent;
  border-top-color: #2563eb;
  animation: dbLoaderSpin 1s cubic-bezier(.55,.15,.45,.85) infinite;
}
.db-loader-ring:nth-child(2) { inset: 6px; border-top-color: #6366f1; animation-duration: 1.4s; animation-direction: reverse; }
.db-loader-ring:nth-child(3) { inset: 12px; border-top-color: #3b82f6; animation-duration: 1s; animation-delay: -.2s; }
@keyframes dbLoaderSpin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
`;