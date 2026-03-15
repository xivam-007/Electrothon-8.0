"use client";

import { useState, useRef } from "react";
import {
  Download,
  MapPin,
  Truck,
  Package,
  Calendar,
  Clock,
  Ruler,
  FileText,
  ArrowRight,
  CheckCircle,
  User,
  Phone,
  Home,
  Globe,
  IndianRupee
} from "lucide-react";

export interface PdfProps {
  moveID: string;
  deliveryDate: string;
  deliveryTime: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupLocation: string;
  pickupTime: string;
  distance: string;
  price: number;
  weight: string;
  name: string;
  phone: string;
  address: string;
  website: string;
  vehicleId: string;
}

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800;9..144,900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .receipt-root {
    font-family: 'DM Sans', sans-serif;
    background: #f5f7fa;
    min-height: 100vh;
    padding: 32px 20px 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ── Top action bar ── */
  .topbar {
    width: 100%;
    max-width: 820px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    padding: 0 4px;
  }
  .topbar-brand {
    display: flex; align-items: center; gap: 10px;
  }
  .brand-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg,#2563eb,#4f46e5);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(37,99,235,.28);
  }
  .brand-name {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: -.02em;
  }
  .brand-tagline {
    font-size: 11px; color: #94a3b8; font-weight: 500;
  }
  .dl-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer;
    font-family: 'Fraunces', Georgia, serif;
    font-size: 13px; font-weight: 700;
    background: linear-gradient(135deg,#1d4ed8,#4f46e5); color: #fff;
    box-shadow: 0 3px 12px rgba(37,99,235,.28);
    transition: all .22s cubic-bezier(.22,1,.36,1);
  }
  .dl-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,.38); }
  .dl-btn:disabled { opacity: .65; cursor: not-allowed; }
  .dl-btn.success { background: linear-gradient(135deg,#16a34a,#15803d); box-shadow: 0 3px 12px rgba(22,163,74,.3); }

  /* ── Document paper ── */
  .receipt-page {
    width: 100%;
    max-width: 820px;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 32px rgba(15,23,42,.08), 0 1px 4px rgba(15,23,42,.04);
    border: 1px solid #e2e8f0;
    position: relative;
  }

  /* ── Document header ── */
  .doc-header {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 36px 40px 28px;
    position: relative;
    overflow: hidden;
  }
  .doc-header::before {
    content: '';
    position: absolute; top: 0; left: 0; bottom: 0;
    width: 5px;
    background: linear-gradient(180deg, #2563eb, #4f46e5);
  }
  .doc-header::after {
    content: '';
    position: absolute; top: 0; left: 5px; right: 0; bottom: 0;
    background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
    pointer-events: none; z-index: 0;
  }
  .dh-top {
    display: flex; align-items: flex-start; justify-content: space-between;
    position: relative; z-index: 1;
  }
  .dh-left {}
  .dh-eyebrow {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 8px;
    font-size: 10px; font-weight: 700; letter-spacing: .18em;
    text-transform: uppercase; color: #94a3b8;
    margin-bottom: 10px;
  }
  .dh-eyebrow-line {
    width: 20px; height: 1.5px; background: #2563eb; border-radius: 2px;
  }
  .dh-title {
    position: relative; z-index: 1;
    font-family: 'Fraunces', Georgia, serif;
    font-size: 46px; font-weight: 900;
    color: #0f172a; letter-spacing: -.04em; line-height: 1.0;
    margin-bottom: 14px;
  }
  .dh-title em {
    font-style: italic; color: #2563eb;
  }
  .dh-move-id {
    position: relative; z-index: 1;
    display: inline-flex; align-items: center; gap: 7px;
    background: #eff6ff; border: 1px solid #bfdbfe;
    border-radius: 100px; padding: 5px 14px;
    font-size: 12px; font-weight: 700; color: #1d4ed8;
    letter-spacing: .04em;
  }
  .dh-id-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
    animation: idPulse 2s ease-in-out infinite;
  }
  @keyframes idPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.55)} }

  .dh-right {
    text-align: right; position: relative; z-index: 1;
  }
  .dh-date-block {
    display: flex; flex-direction: column; align-items: flex-end; gap: 6px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: 14px; padding: 14px 18px;
  }
  .dh-date-row {
    display: flex; align-items: center; gap: 7px;
    font-size: 13px; font-weight: 600; color: #0f172a;
  }
  .dh-date-row .dh-sub {
    font-size: 10px; font-weight: 600; color: #94a3b8;
    text-transform: uppercase; letter-spacing: .1em;
    display: block; text-align: right; margin-bottom: 2px;
  }

  /* status strip */
  .status-strip {
    display: flex; align-items: center; gap: 6px;
    margin-top: 22px; position: relative; z-index: 1;
    border-top: 1px solid #f1f5f9; padding-top: 16px;
  }
  .ss-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 600; color: #64748b;
  }
  .ss-dot {
    width: 5px; height: 5px; border-radius: 50%; background: #22c55e;
  }
  .ss-sep { color: #cbd5e1; margin: 0 6px; }
  .ss-item.paid { color: #16a34a; font-weight: 700; }
  .ss-item.verified { color: #2563eb; font-weight: 700; }

  /* ── Document body ── */
  .doc-body {
    padding: 32px 40px 36px;
    position: relative;
  }

  /* section label */
  .section-label {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 10px; font-weight: 700; letter-spacing: .18em;
    text-transform: uppercase; color: #94a3b8;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 14px; margin-top: 28px;
  }
  .section-label:first-child { margin-top: 0; }
  .section-label::after {
    content: ''; flex: 1; height: 1px; background: #f1f5f9;
  }

  /* ── Customer card ── */
  .customer-card {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 20px 24px;
  }
  .customer-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px;
  }
  .customer-field {
    display: flex; align-items: flex-start; gap: 10px;
  }
  .cf-icon-wrap {
    width: 30px; height: 30px; border-radius: 8px;
    background: #eff6ff; border: 1px solid #bfdbfe;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 2px;
  }
  .cf-label {
    font-size: 10px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: .09em; margin-bottom: 3px;
  }
  .cf-value {
    font-size: 14px; font-weight: 600; color: #0f172a; line-height: 1.4;
  }
  .cf-value a {
    color: #2563eb; text-decoration: none; font-weight: 600;
  }
  .cf-value a:hover { text-decoration: underline; }

  /* ── Route card ── */
  .route-card {
    display: grid; grid-template-columns: 1fr auto 1fr;
    gap: 0; align-items: center;
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;
    overflow: hidden;
  }
  .route-end {
    padding: 20px 22px;
  }
  .route-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 700; letter-spacing: .1em;
    text-transform: uppercase; padding: 3px 10px; border-radius: 100px;
    margin-bottom: 8px;
  }
  .pickup-pill {
    background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;
  }
  .dropoff-pill {
    background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;
  }
  .route-addr {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 15px; font-weight: 700; color: #0f172a;
    line-height: 1.4; margin-bottom: 8px;
  }
  .route-meta {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: #64748b; font-weight: 500; flex-wrap: wrap;
  }
  .route-sep { color: #cbd5e1; margin: 0 2px; }

  /* route middle divider */
  .route-middle {
    display: flex; flex-direction: column; align-items: center;
    gap: 0; padding: 0 8px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;
    align-self: stretch; justify-content: center;
  }
  .rm-line {
    width: 1px; flex: 1; background: #e2e8f0; min-height: 20px;
  }
  .rm-circle {
    width: 32px; height: 32px; border-radius: 50%;
    background: #fff; border: 1.5px solid #bfdbfe;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(37,99,235,.1);
    flex-shrink: 0;
  }
  .route-dropoff-inner {
    text-align: right;
  }
  .route-meta-right {
    justify-content: flex-end;
  }

  /* ── Specs grid ── */
  .specs-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  }
  .spec-card {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px;
    padding: 18px 16px; text-align: center;
    transition: transform .2s, box-shadow .2s;
  }
  .spec-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(15,23,42,.08); }
  .spec-icon-wrap {
    width: 38px; height: 38px; border-radius: 10px;
    background: #eff6ff; border: 1px solid #bfdbfe;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 10px; color: #2563eb;
  }
  .spec-name {
    font-size: 10px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: .1em; margin-bottom: 5px;
  }
  .spec-value {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 17px; font-weight: 800; color: #0f172a; letter-spacing: -.01em;
  }

  /* ── Footer row ── */
  .footer-row {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 20px; margin-top: 28px;
    padding-top: 24px; border-top: 1px solid #f1f5f9;
    flex-wrap: wrap;
  }
  .footer-note {
    font-size: 13px; color: #64748b; line-height: 1.7;
    max-width: 340px; font-style: italic;
  }
  .total-card {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 16px; padding: 18px 24px; text-align: right;
    min-width: 180px;
    box-shadow: 0 2px 10px rgba(15,23,42,.06);
    position: relative; overflow: hidden;
  }
  .total-card::before {
    content: ''; position: absolute; top: 0; right: 0;
    width: 80px; height: 80px;
    background: radial-gradient(circle, rgba(37,99,235,.06), transparent 65%);
  }
  .total-label {
    display: flex; align-items: center; justify-content: flex-end; gap: 5px;
    font-size: 10px; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; color: #94a3b8;
    margin-bottom: 6px; position: relative; z-index: 1;
  }
  .total-amount {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 30px; font-weight: 900; color: #0f172a;
    letter-spacing: -.03em; line-height: 1;
    position: relative; z-index: 1;
  }
  .total-symbol {
    font-size: 20px; vertical-align: super;
    color: #2563eb; margin-right: 2px;
  }

  /* ── Document footer band ── */
  .doc-footer-band {
    background: #fafbff; border-top: 1px solid #e2e8f0;
    padding: 16px 40px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dfb-left {
    font-size: 11px; color: #94a3b8; font-weight: 500;
  }
  .dfb-right {
    display: flex; align-items: center; gap: 16px;
  }
  .dfb-seal {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 700; color: #15803d;
    background: #f0fdf4; border: 1px solid #bbf7d0;
    padding: 4px 10px; border-radius: 100px;
  }
  .dfb-seal-dot {
    width: 5px; height: 5px; border-radius: 50%; background: #22c55e;
    animation: idPulse 2s ease-in-out infinite;
  }

  /* ── Digital Seal ── */
  .stamp {
    position: absolute; bottom: 84px; right: 44px;
    width: 134px; height: 134px;
    transform: rotate(-14deg);
    pointer-events: none;
    opacity: .28;
    transition: opacity .3s;
  }
  .stamp:hover { opacity: .44; }
  .stamp svg { width: 100%; height: 100%; display: block; }

  /* ── Guarantee strip ── */
  .guarantee-strip {
    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
    border: 1px solid #bbf7d0; border-radius: 12px;
    padding: 14px 20px; margin-top: 20px;
    display: flex; align-items: center; gap: 12px;
  }
  .gs-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: #16a34a; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .gs-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 13px; font-weight: 800; color: #14532d; margin-bottom: 2px;
  }
  .gs-sub {
    font-size: 12px; color: #16a34a; font-weight: 500;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media print {
    body * { visibility: hidden; }
    .printable, .printable * { visibility: visible; }
    .printable { position: fixed; inset: 0; }
    .dl-btn, .topbar { display: none !important; }
    .receipt-page { box-shadow: none; border: none; border-radius: 0; }
    .receipt-root { background: white; padding: 0; }
    .doc-header { background: #fff !important; border-bottom: 1px solid #e2e8f0 !important; }
    .doc-header::before { background: linear-gradient(180deg, #2563eb, #4f46e5) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .total-card { background: #f8fafc !important; border: 2px solid #e2e8f0 !important; }
    .stamp { display: block; }
  }
`;

const PdfViewer = ({
  moveID,
  deliveryDate,
  deliveryTime,
  dropoffLocation,
  pickupDate,
  pickupLocation,
  pickupTime,
  distance,
  price,
  weight,
  name,
  phone,
  address,
  website,
  vehicleId
}: PdfProps) => {

  const [dlState, setDlState] = useState("idle");
  const printRef = useRef(null);

  const handleDownload = () => {
    setDlState("printing");
    setTimeout(() => {
      window.print();
      setDlState("done");
      setTimeout(() => setDlState("idle"), 2500);
    }, 200);
  };

  return (
    <>
      <style>{style}</style>

      <div className="receipt-root printable" ref={printRef}>

        {/* ── Action bar ── */}
        <div className="topbar">
          <div className="topbar-brand">
            <div className="brand-icon">🧈</div>
            <div>
              <div className="brand-name">Makhan Move</div>
              <div className="brand-tagline">Official document · Verified contract</div>
            </div>
          </div>
          <button
            className={`dl-btn ${dlState === "done" ? "success" : ""}`}
            onClick={handleDownload}
            disabled={dlState === "printing"}
          >
            {dlState === "done" ? (
              <><CheckCircle size={15} /> Saved!</>
            ) : dlState === "printing" ? (
              <><span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> Preparing…</>
            ) : (
              <><Download size={15} /> Download PDF</>
            )}
          </button>
        </div>

        {/* ── Document ── */}
        <div className="receipt-page">

          {/* ── Header ── */}
          <div className="doc-header">
            <div className="dh-top">
              <div className="dh-left">
                <div className="dh-eyebrow">
                  <div className="dh-eyebrow-line" />
                  Moving Services Agreement
                </div>
                <h1 className="dh-title">Service<br /><em>Contract</em></h1>
                <div className="dh-move-id">
                  <span className="dh-id-dot" />
                  Move #{moveID}
                </div>
              </div>
              <div className="dh-right">
                <div className="dh-date-block">
                  <div>
                    <div className="dh-sub text-black">Pickup Date</div>
                    <div className="dh-date-row">
                      <Calendar size={13} color="#818cf8" />
                      <span>{pickupDate}</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  <div>
                    <div className="dh-sub text-black">Pickup Time</div>
                    <div className="dh-date-row">
                      <Clock size={13} color="#94a3b8" />
                      <span>{pickupTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="status-strip">
              <div className="ss-item paid">
                <span className="ss-dot" style={{ background: '#4ade80' }} />
                Payment Received
              </div>
              <span className="ss-sep">·</span>
              <div className="ss-item verified">
                <span className="ss-dot" style={{ background: '#93c5fd' }} />
                AI Verified
              </div>
              <span className="ss-sep">·</span>
              <div className="ss-item">
                <span className="ss-dot" style={{ background: '#fbbf24' }} />
                Escrow Protected
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="doc-body">

            {/* Customer */}
            <div className="section-label">Mover Details</div>
            <div className="customer-card">
              <div className="customer-grid">
                <div className="customer-field">
                  <div className="cf-icon-wrap"><User size={14} color="#2563eb" /></div>
                  <div>
                    <div className="cf-label">Full Name</div>
                    <div className="cf-value">{name}</div>
                  </div>
                </div>
                <div className="customer-field">
                  <div className="cf-icon-wrap"><Phone size={14} color="#2563eb" /></div>
                  <div>
                    <div className="cf-label">Phone</div>
                    <div className="cf-value">{phone}</div>
                  </div>
                </div>
                <div className="customer-field">
                  <div className="cf-icon-wrap"><Home size={14} color="#2563eb" /></div>
                  <div>
                    <div className="cf-label">Address</div>
                    <div className="cf-value">{address}</div>
                  </div>
                </div>
                <div className="customer-field">
                  <div className="cf-icon-wrap"><Globe size={14} color="#2563eb" /></div>
                  <div>
                    <div className="cf-label">Website</div>
                    <div className="cf-value">
                      <a href={website} target="_blank" rel="noopener noreferrer">{website}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="section-label">Route Details</div>
            <div className="route-card">
              <div className="route-end">
                <div className="route-pill pickup-pill">
                  <MapPin size={10} /> Pickup
                </div>
                <p className="route-addr">{pickupLocation}</p>
                <div className="route-meta">
                  <Calendar size={10} color="#94a3b8" />
                  {pickupDate}
                  <span className="route-sep">·</span>
                  <Clock size={10} color="#94a3b8" />
                  {pickupTime}
                </div>
              </div>

              <div className="route-middle">
                <div className="rm-line" />
                <div className="rm-circle">
                  <ArrowRight size={12} color="#2563eb" />
                </div>
                <div className="rm-line" />
              </div>

              <div className="route-end route-dropoff-inner">
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                  <div className="route-pill dropoff-pill">
                    <MapPin size={10} /> Drop-off
                  </div>
                </div>
                <p className="route-addr">{dropoffLocation}</p>
                <div className="route-meta route-meta-right">
                  <Calendar size={10} color="#94a3b8" />
                  {deliveryDate}
                  <span className="route-sep">·</span>
                  <Clock size={10} color="#94a3b8" />
                  {deliveryTime}
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="section-label">Move Specifications</div>
            <div className="specs-grid">
              <div className="spec-card">
                <div className="spec-icon-wrap"><Truck size={16} /></div>
                <div className="spec-name">Vehicle</div>
                <div className="spec-value">{vehicleId}</div>
              </div>
              <div className="spec-card">
                <div className="spec-icon-wrap"><Ruler size={16} /></div>
                <div className="spec-name">Distance</div>
                <div className="spec-value">{distance}</div>
              </div>
              <div className="spec-card">
                <div className="spec-icon-wrap"><Package size={16} /></div>
                <div className="spec-name">Weight</div>
                <div className="spec-value">{weight}</div>
              </div>
            </div>

            {/* Safe Move Guarantee */}
            <div className="guarantee-strip">
              <div className="gs-icon">
                <CheckCircle size={18} color="#fff" />
              </div>
              <div>
                <div className="gs-title">Safe Move Guarantee 🛡️</div>
                <div className="gs-sub">Payment held in escrow — released only after safe delivery is confirmed.</div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer-row">
              <p className="footer-note">
                Shukriya hamare moving services chunne ke liye.<br />
                Koi sawaal ho toh humse kabhi bhi sampark karein.
              </p>
              <div className="total-card">
                <div className="total-label">
                  <IndianRupee size={11} />
                  Total Amount
                </div>
                <div className="total-amount">
                  <span className="total-symbol">₹</span>
                  {price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

          </div>

          {/* ── Footer band ── */}
          <div className="doc-footer-band">
            <div className="dfb-left">
              © 2025 Makhan Move · AI-Powered Moving Brokerage · Built for India 🇮🇳
            </div>
            <div className="dfb-right">
              <div className="dfb-seal">
                <div className="dfb-seal-dot" />
                Digitally Verified
              </div>
              <div className="dfb-seal" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}>
                <div className="dfb-seal-dot" style={{ background: '#60a5fa' }} />
                Escrow Secured
              </div>
            </div>
          </div>

          {/* Digital Stamp Seal */}
          <div className="stamp" aria-hidden>
            <svg viewBox="0 0 134 134" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <path id="topArc"    d="M 67,67 m -48,0 a 48,48 0 1,1 96,0" />
                <path id="bottomArc" d="M 67,67 m -48,0 a 48,48 0 0,0 96,0" />
              </defs>

              {/* Outer ring */}
              <circle cx="67" cy="67" r="63" fill="none" stroke="#2563eb" strokeWidth="2.5" />
              {/* Inner ring */}
              <circle cx="67" cy="67" r="56" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="3 3" />
              {/* Inner inner ring */}
              <circle cx="67" cy="67" r="46" fill="none" stroke="#2563eb" strokeWidth="1.5" />

              {/* Curved text top: MAKHAN MOVE */}
              <text fill="#2563eb" fontSize="9.5" fontFamily="Fraunces, Georgia, serif" fontWeight="800" letterSpacing="3.2">
                <textPath href="#topArc" startOffset="10%">MAKHAN MOVE · OFFICIAL</textPath>
              </text>

              {/* Curved text bottom: VERIFIED */}
              <text fill="#2563eb" fontSize="8.5" fontFamily="Fraunces, Georgia, serif" fontWeight="700" letterSpacing="4">
                <textPath href="#bottomArc" startOffset="18%">· DIGITALLY VERIFIED ·</textPath>
              </text>

              {/* Center: 🧈 emoji as text */}
              <text x="67" y="60" textAnchor="middle" fontSize="22" fontFamily="Arial">🧈</text>

              {/* Center: PAID */}
              <text x="67" y="76" textAnchor="middle" fill="#2563eb"
                fontSize="10" fontFamily="Fraunces, Georgia, serif"
                fontWeight="900" letterSpacing="3" textDecoration="none">
                PAID
              </text>

              {/* Center: check line */}
              <line x1="52" y1="81" x2="82" y2="81" stroke="#2563eb" strokeWidth="1" />

              {/* Center: SECURED */}
              <text x="67" y="91" textAnchor="middle" fill="#2563eb"
                fontSize="7.5" fontFamily="DM Sans, sans-serif"
                fontWeight="700" letterSpacing="2.5">
                SECURED
              </text>

              {/* 6 decorative dots on outer ring */}
              {[0,60,120,180,240,300].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x = 67 + 59 * Math.cos(rad - Math.PI / 2);
                const y = 67 + 59 * Math.sin(rad - Math.PI / 2);
                return <circle key={deg} cx={x} cy={y} r="2.5" fill="#2563eb" />;
              })}
            </svg>
          </div>

        </div>
      </div>
    </>
  );
};

export default PdfViewer;