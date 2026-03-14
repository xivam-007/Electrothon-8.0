"use client";

import { useState, useRef } from "react";
import {
  Download,
  MapPin,
  Truck,
  Package,
  Calendar,
  Clock,
  DollarSign,
  Ruler,
  FileText,
  ArrowRight,
  CheckCircle,
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
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .receipt-root {
    font-family: 'DM Sans', sans-serif;
    background: #0a0a0f;
    color: #f0ede8;
  }
  .receipt-page {
    background: #111118;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  }
  .gold { color: #c9a84c; }
  .gold-bg { background: linear-gradient(135deg, #c9a84c, #e8c96a); }
  .serif { font-family: 'DM Serif Display', Georgia, serif; }
  
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
  }
  .topbar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #c9a84c22, #c9a84c44);
    border: 1px solid #c9a84c44;
    display: flex; align-items: center; justify-content: center;
  }
  .brand-title { font-size: 15px; font-weight: 600; color: #f0ede8; letter-spacing: -0.01em; }
  .brand-sub { font-size: 12px; color: #6b6878; }
  
  .dl-btn {
    display: flex; align-items: center; gap-8px; gap: 8px;
    padding: 10px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #c9a84c, #e8c96a);
    color: #0a0a0f;
    font-size: 13px; font-weight: 700;
    border: none; cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.01em;
    box-shadow: 0 4px 20px rgba(201,168,76,0.3);
  }
  .dl-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(201,168,76,0.4); }
  .dl-btn:active { transform: translateY(0); }
  .dl-btn.success { background: linear-gradient(135deg, #2ecc71, #27ae60); box-shadow: 0 4px 20px rgba(46,204,113,0.3); }

  .doc-body { padding: 40px; }

  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 36px;
  }
  .receipt-title {
    font-family: 'DM Serif Display', serif;
    font-size: 52px;
    line-height: 1;
    color: #f0ede8;
    letter-spacing: -0.02em;
    margin: 0 0 12px 0;
  }
  .move-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px;
    border-radius: 100px;
    background: rgba(201,168,76,0.1);
    border: 1px solid rgba(201,168,76,0.2);
    font-size: 12px; color: #c9a84c; font-weight: 600;
    letter-spacing: 0.05em; text-transform: uppercase;
  }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #2ecc71; box-shadow: 0 0 6px #2ecc71; }
  
  .datetime-block { text-align: right; }
  .dt-item { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-bottom: 6px; }
  .dt-main { font-size: 16px; font-weight: 600; color: #f0ede8; }
  .dt-sub { font-size: 14px; color: #6b6878; }
  
  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent); margin: 0 0 32px 0; }

  .route-card {
    display: grid; grid-template-columns: 1fr auto 1fr;
    gap: 0;
    padding: 28px 32px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 18px;
    margin-bottom: 28px;
    align-items: center;
  }
  .route-point {}
  .route-label {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 10px;
  }
  .route-pill {
    padding: 3px 10px; border-radius: 100px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  }
  .pickup-pill { background: rgba(201,168,76,0.12); color: #c9a84c; border: 1px solid rgba(201,168,76,0.2); }
  .dropoff-pill { background: rgba(99,179,237,0.12); color: #63b3ed; border: 1px solid rgba(99,179,237,0.2); }
  .route-address { font-size: 15px; font-weight: 500; color: #d4d0cb; line-height: 1.5; max-width: 200px; }
  
  .route-arrow {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 0 16px;
  }
  .arrow-line { width: 1px; height: 32px; background: linear-gradient(to bottom, rgba(201,168,76,0.2), rgba(201,168,76,0.6), rgba(99,179,237,0.6), rgba(99,179,237,0.2)); }
  .arrow-circle {
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
  }

  .specs-label {
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;
    color: #4a4758; margin-bottom: 14px;
  }
  .specs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
  .spec-card {
    padding: 20px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    transition: border-color 0.2s;
  }
  .spec-card:hover { border-color: rgba(201,168,76,0.2); }
  .spec-icon { margin-bottom: 14px; color: #4a4758; }
  .spec-name { font-size: 11px; color: #4a4758; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .spec-value { font-size: 15px; font-weight: 600; color: #d4d0cb; }

  .footer-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    padding-top: 28px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .footer-note { font-size: 13px; color: #4a4758; line-height: 1.6; max-width: 300px; }
  .total-card {
    min-width: 220px;
    padding: 24px;
    background: linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.04));
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: 18px;
  }
  .total-label { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; color: #c9a84c; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  .total-amount {
    font-family: 'DM Serif Display', serif;
    font-size: 44px;
    line-height: 1;
    color: #f0ede8;
    letter-spacing: -0.02em;
  }
  .total-currency { font-size: 22px; vertical-align: super; margin-right: 2px; color: #c9a84c; }

  /* Loading skeleton */
  .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  @media (max-width: 600px) {
    .doc-body { padding: 24px 20px; }
    .receipt-title { font-size: 36px; }
    .doc-header { flex-direction: column; gap: 16px; }
    .datetime-block { text-align: left; }
    .dt-item { justify-content: flex-start; }
    .route-card { grid-template-columns: 1fr; gap: 20px; }
    .route-arrow { flex-direction: row; padding: 0; }
    .arrow-line { width: 32px; height: 1px; background: linear-gradient(to right, rgba(201,168,76,0.4), rgba(99,179,237,0.4)); }
    .specs-grid { grid-template-columns: 1fr; }
    .footer-row { flex-direction: column; align-items: stretch; }
    .total-card { min-width: unset; }
  }

  @media print {
    body * { visibility: hidden; }
    .printable, .printable * { visibility: visible; }
    .printable { position: fixed; inset: 0; }
    .dl-btn, .topbar { display: none !important; }
    .receipt-page { box-shadow: none; border: none; border-radius: 0; }
    .receipt-root { background: white; }
    .receipt-page, .doc-body { background: white; color: #111; }
    .receipt-title, .spec-value, .route-address, .dt-main, .total-amount { color: #111 !important; }
    .spec-card, .route-card, .total-card { background: #f9f9f9 !important; border-color: #ddd !important; }
    .footer-note, .specs-label, .spec-name, .dt-sub, .brand-sub { color: #555 !important; }
    .total-amount { color: #111 !important; }
    .total-currency { color: #c9a84c !important; }
  }
`;

const PdfViewer = (props : PdfProps) => {
  const {
    moveID = "MVE-20847",
    vehicleId = "TRK-4492",
    distance = "124 miles",
    price = 849.00,
    pickupLocation = "1847 Elm Street, Brooklyn, NY 11201",
    dropoffLocation = "55 Water Street, Manhattan, NY 10041",
    weight = "1,240 lbs",
    pickupDate = "March 14, 2026",
    pickupTime = "9:30 AM",
  } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dlState, setDlState] = useState("idle"); // idle | printing | done
  const printRef = useRef(null);

  const handleDownload = () => {
    setDlState("printing");
    setTimeout(() => {
      window.print();
      setDlState("done");
      setTimeout(() => setDlState("idle"), 2500);
    }, 200);
  };

  if (isLoading) {
    return (
      <>
        <style>{style}</style>
        <div className="receipt-root" style={{ padding: "24px", minHeight: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative", width: "48px", height: "48px" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(201,168,76,0.1)" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#c9a84c", animation: "spin 0.8s linear infinite" }} />
            </div>
            <p style={{ color: "#6b6878", fontSize: "14px", fontWeight: 500 }}>Generating receipt…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{style}</style>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="receipt-root printable" ref={printRef}>
        <div className="receipt-page" style={{ maxWidth: "780px", margin: "0 auto" }}>

          {/* ── Top Bar ── */}
          <div className="topbar">
            <div className="topbar-brand">
              <div className="brand-icon">
                <FileText size={18} color="#c9a84c" />
              </div>
              <div>
                <div className="brand-title">Move Receipt</div>
                <div className="brand-sub">Official document</div>
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
                <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> Preparing…</>
              ) : (
                <><Download size={15} /> Download PDF</>
              )}
            </button>
          </div>

          {/* ── Document Body ── */}
          <div className="doc-body">

            {/* Header */}
            <div className="doc-header">
              <div>
                <h1 className="receipt-title serif">Receipt</h1>
                <div className="move-badge">
                  <span className="badge-dot" />
                  Move #{moveID}
                </div>
              </div>
              <div className="datetime-block">
                <div className="dt-item">
                  <Calendar size={14} color="#c9a84c" />
                  <span className="dt-main">{pickupDate}</span>
                </div>
                <div className="dt-item">
                  <Clock size={14} color="#6b6878" />
                  <span className="dt-sub">{pickupTime}</span>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Route Card */}
            <div className="route-card">
              <div className="route-point">
                <div className="route-label">
                  <MapPin size={13} color="#c9a84c" />
                  <span className="route-pill pickup-pill">Pickup</span>
                </div>
                <p className="route-address">{pickupLocation}</p>
              </div>

              <div className="route-arrow">
                <div className="arrow-line" />
                <div className="arrow-circle">
                  <ArrowRight size={14} color="#6b6878" />
                </div>
                <div className="arrow-line" />
              </div>

              <div className="route-point" style={{ textAlign: "right" }}>
                <div className="route-label" style={{ justifyContent: "flex-end" }}>
                  <span className="route-pill dropoff-pill">Drop-off</span>
                  <MapPin size={13} color="#63b3ed" />
                </div>
                <p className="route-address" style={{ marginLeft: "auto" }}>{dropoffLocation}</p>
              </div>
            </div>

            {/* Specs */}
            <div className="specs-label">Move Specifications</div>
            <div className="specs-grid">
              <div className="spec-card">
                <div className="spec-icon"><Truck size={20} /></div>
                <div className="spec-name">Vehicle</div>
                <div className="spec-value">{vehicleId}</div>
              </div>
              <div className="spec-card">
                <div className="spec-icon"><Ruler size={20} /></div>
                <div className="spec-name">Distance</div>
                <div className="spec-value">{distance}</div>
              </div>
              <div className="spec-card">
                <div className="spec-icon"><Package size={20} /></div>
                <div className="spec-name">Weight</div>
                <div className="spec-value">{weight}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer-row">
              <p className="footer-note">
                Thank you for choosing our moving services. Questions about this receipt? Contact our support team anytime.
              </p>
              <div className="total-card">
                <div className="total-label">
                  <DollarSign size={12} />
                  Total Paid
                </div>
                <div className="total-amount">
                  <span className="total-currency">$</span>
                  {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/^\$/, "")}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PdfViewer;