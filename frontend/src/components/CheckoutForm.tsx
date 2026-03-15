"use client";

import { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { connectToBackendServices } from "@/services/connectToBackend"; // Update path if needed
import { useRouter } from "next/navigation";
interface CheckoutFormProps {
  moveId: string;
}

interface CreateIntentResponse {
  success: boolean;
  clientSecret?: string;
  message?: string;
}

// ✅ FIXED: Placed stripeStyle outside the component
const stripeStyle = {
  style: {
    base: {
      fontSize: "15px",
      fontFamily: "'DM Sans', sans-serif",
      color: "#0f172a",
      letterSpacing: "0.04em",
      fontWeight: "600",
      "::placeholder": { color: "#94a3b8", fontWeight: "400" },
    },
    invalid: { color: "#ef4444", iconColor: "#ef4444" },
  },
};

export default function CheckoutForm({ moveId }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      /* ─────────────────────────────
         1️⃣ Validate Move Details
      ──────────────────────────────*/
      const moveData = await connectToBackendServices.getUserOrderById(moveId);
      if (!moveData || moveData.success === false) {
        throw new Error(moveData.message || "Move not found in database");
      }

      /* ─────────────────────────────
         2️⃣ Create Payment Intent
      ──────────────────────────────*/
      const intentData: CreateIntentResponse = await connectToBackendServices.getProcessPayment(moveId);
      console.log("Intent Data:", intentData);
      if (!intentData.success || !intentData.clientSecret) {
        throw new Error(intentData.message || "Failed to initialize payment");
      }

      console.log("Confirming payment with clientSecret:", intentData.clientSecret);
      /* ─────────────────────────────
         3️⃣ Confirm Card Payment via Stripe
      ──────────────────────────────*/
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) throw new Error("Card element not found");
      console.log("Card Element found, proceeding with payment confirmation...");


      const result = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: { card: cardElement },
      });
      console.log("Stripe confirmCardPayment result:", result);
      if (result.error) throw new Error(result.error.message);

      const paymentIntentId = result.paymentIntent?.id;
      if (!paymentIntentId) throw new Error("PaymentIntent ID not returned");

      /* ─────────────────────────────
         4️⃣ Confirm Payment on Backend (Updates DB Status automatically)
      ──────────────────────────────*/
      const confirmData = await connectToBackendServices.getConfirmPayment(paymentIntentId);
      console.log("Confirm Data:", confirmData);
      if (!confirmData.success) {
        throw new Error(confirmData.message || "Payment confirmation failed on server");
      }

      alert("Payment successful 🎉 Move confirmed!");
      router.push(`/dashboard/${moveId}`);

    } catch (error: any) {
      console.error("Payment Error:", error);
      // Ensure we extract the error message safely, whether it's an Axios error or standard JS error
      const msg = error.response?.data?.message || error.message || "Payment failed";
      setErrorMessage(msg);
    }
    
    setLoading(false);
  };

  return (
    <div className="cf-root">
      <style>{CSS}</style>
      <div className="cf-orb cf-orb1" />
      <div className="cf-orb cf-orb2" />
      <div className="cf-grid" />
      <div className="cf-center">
        <div className="cf-trust-bar cf-in cf-d0">
          <span className="cf-trust-dot" />
          <span>🔒 Funds held in escrow — released only after delivery</span>
        </div>

        <div className="cf-card cf-in cf-d1">
          <div className="cf-shimmer" />
          <div className="cf-card-hdr">
            <div className="cf-logo">
              <div className="cf-logo-box">🧈</div>
              <span className="cf-logo-txt">Makhan<b> Move</b></span>
            </div>
            <div className="cf-secure-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Secured
            </div>
          </div>

          <div className="cf-amount-section cf-in cf-d2">
            <div className="cf-amount-icon">💳</div>
            <div>
              <p className="cf-amount-label">Amount to Pay</p>
              <p className="cf-amount-value">Escrow Payment</p>
            </div>
            <div className="cf-amount-badge">✦ Safe</div>
          </div>

          <div className="cf-divider" />

          <form onSubmit={handleSubmit} className="cf-form">
            <div className="cf-sec-lbl cf-in cf-d3">
              <span>01</span>&nbsp; Card Details
            </div>

            <div className="cf-field cf-in cf-d3">
              <label className="cf-lbl">
                <span>💳</span> Card Number
                <div className="cf-card-brands">
                  <span className="cf-brand">VISA</span>
                  <span className="cf-brand cf-brand-mc">MC</span>
                  <span className="cf-brand cf-brand-ru">RuPay</span>
                  <span className="cf-brand cf-brand-amex">Amex</span>
                </div>
              </label>
              <div className="cf-input-box cf-input-box--card">
                <div className="cf-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div className="cf-stripe-wrap">
                  <CardNumberElement options={stripeStyle} />
                </div>
              </div>
            </div>

            <div className="cf-row2 cf-in cf-d4">
              <div className="cf-field">
                <label className="cf-lbl">
                  <span>📅</span> Expiry Date
                </label>
                <div className="cf-input-box cf-input-box--half cf-input-box--expiry">
                  <div className="cf-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div className="cf-stripe-wrap">
                    <CardExpiryElement options={stripeStyle} />
                  </div>
                </div>
              </div>

              <div className="cf-field">
                <label className="cf-lbl">
                  <span>🔐</span> CVV / CVC
                </label>
                <div className="cf-input-box cf-input-box--half cf-input-box--cvv">
                  <div className="cf-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div className="cf-stripe-wrap">
                    <CardCvcElement options={stripeStyle} />
                  </div>
                  <div className="cf-cvv-tip">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    3 digits
                  </div>
                </div>
              </div>
            </div>

            <div className="cf-sec-note cf-in cf-d5">
              <span>🛡️</span>
              <span>256-bit SSL encryption &nbsp;·&nbsp; PCI-DSS compliant &nbsp;·&nbsp; Powered by Stripe</span>
            </div>

            {errorMessage && (
              <div className="cf-error">
                <span>⚠️</span>
                <p>{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!stripe || loading}
              className={`cf-btn ${loading ? 'cf-btn-loading' : ''} ${!stripe ? 'cf-btn-disabled' : ''}`}
            >
              {loading ? (
                <span className="cf-btn-inner">
                  <span className="cf-spinner" />
                  Processing Payment…
                </span>
              ) : (
                <span className="cf-btn-inner">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Pay Now
                  <span className="cf-btn-arrow">→</span>
                </span>
              )}
            </button>
          </form>

          <div className="cf-footer">
            <div className="cf-footer-item"><span>🔒</span> End-to-end encrypted</div>
            <div className="cf-footer-dot" />
            <div className="cf-footer-item"><span>💰</span> Escrow protected</div>
            <div className="cf-footer-dot" />
            <div className="cf-footer-item"><span>↩️</span> Refundable</div>
          </div>
        </div>

        <div className="cf-powered cf-in cf-d5">
          <span>Powered by</span>
          <span className="cf-stripe-badge">
            <svg height="14" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.77 10.04c0-.65.55-1.07 1.39-1.07 1.22 0 2.46.38 3.38.96V6.99c-1.07-.4-2.12-.6-3.37-.6C5.2 6.39 3.3 7.74 3.3 10.2c0 3.79 5.22 3.16 5.22 4.79 0 .74-.65 1.14-1.57 1.14-1.33 0-2.77-.52-3.97-1.27v2.97c1.33.57 2.67.84 3.97.84 2.97 0 5.02-1.35 5.02-3.88-.02-4.1-5.2-3.37-5.2-4.75zM18.84 9.4l-.23 1.04h-1.81V6.55l-3.2.64v10.2h3.2v-5.1h2.15l.44-2.89h-2.59.04zM26.6 9.1c-1.12 0-1.85.52-2.31 1.12l-.16-.89h-2.86v11.2l3.2-.64V19.3c.44.3 1.09.54 2 .54 2.05 0 3.9-1.65 3.9-5.4-.01-3.52-1.87-5.34-3.77-5.34zm-.67 8.14c-.55 0-.88-.2-1.12-.46l.02-3.58c.26-.29.59-.49 1.1-.49.85 0 1.43.94 1.43 2.25 0 1.34-.57 2.28-1.43 2.28zM31 7.74c0-1.02.83-1.84 1.85-1.84s1.85.82 1.85 1.84-.83 1.84-1.85 1.84S31 8.76 31 7.74zM31.4 9.4v10.38h3.2V9.4h-3.2zM43.04 10.14l-.4-1.3h-2.6v9.54h3.2v-6.16c.75-.96 2.02-.78 2.42-.66V9.4c-.44-.16-2.02-.44-2.62.74zM50.6 9.1c-3.07 0-4.94 2.59-4.94 5.36 0 3.52 2 5.38 5.1 5.38 1.47 0 2.58-.33 3.42-.89v-2.5c-.84.51-1.79.8-2.87.8-1.12 0-2.11-.38-2.23-1.73h5.64c.02-.17.04-.52.04-.8-.02-2.97-1.39-5.62-4.16-5.62zm-1.53 4.27c.1-1.29.93-1.82 1.58-1.82.63 0 1.4.52 1.45 1.82h-3.03z" fill="#635BFF"/>
            </svg>
          </span>
          <span>&nbsp;·&nbsp; Makhan Move Escrow</span>
        </div>
      </div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800;9..144,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.cf-root {
  min-height: 100vh; width: 100%;
  background: #f0f4ff;
  font-family: 'DM Sans', sans-serif; color: #0f172a;
  display: flex; align-items: center; justify-content: center;
  padding: 24px; position: relative; overflow: hidden;
}

.cf-orb {
  position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
  animation: cfOrbFloat 9s ease-in-out infinite;
}
.cf-orb1 { top:-120px; right:-80px; width:520px; height:520px; background:radial-gradient(circle,rgba(37,99,235,.08),transparent 68%); }
.cf-orb2 { bottom:0; left:-100px; width:420px; height:420px; background:radial-gradient(circle,rgba(79,70,229,.06),transparent 68%); animation-delay:-4.5s; }
@keyframes cfOrbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
.cf-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: radial-gradient(rgba(37,99,235,.055) 1px, transparent 1px);
  background-size: 28px 28px;
}

.cf-center {
  position: relative; z-index: 1;
  width: 100%; max-width: 460px;
  display: flex; flex-direction: column; align-items: stretch; gap: 14px;
}

.cf-trust-bar {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: rgba(255,255,255,.85); border: 1px solid #bfdbfe;
  border-radius: 100px; padding: 8px 18px;
  font-size: 12px; font-weight: 600; color: #1d4ed8;
  backdrop-filter: blur(8px); box-shadow: 0 2px 8px rgba(37,99,235,.1);
}
.cf-trust-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
  animation: cfPulse 2s ease-in-out infinite; flex-shrink: 0;
}
@keyframes cfPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.55)} }

.cf-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 24px;
  overflow: hidden; position: relative;
  box-shadow: 0 4px 28px rgba(15,23,42,.09), 0 1px 4px rgba(15,23,42,.05);
  transition: box-shadow .3s;
}
.cf-card:hover { box-shadow: 0 10px 48px rgba(15,23,42,.12), 0 2px 8px rgba(15,23,42,.06); }

.cf-shimmer {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.5) 50%, transparent 65%);
  background-size: 200% 100%; opacity: 0; transition: opacity .3s;
  animation: cfShimmer 2.5s ease-in-out infinite paused;
}
.cf-card:hover .cf-shimmer { opacity: 1; animation-play-state: running; }
@keyframes cfShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

.cf-card-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 26px 16px; border-bottom: 1px solid #f1f5f9; background: #fafbff;
  position: relative; z-index: 1;
}
.cf-logo { display: flex; align-items: center; gap: 9px; }
.cf-logo-box {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg,#2563eb,#4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; box-shadow: 0 2px 6px rgba(37,99,235,.28);
  transition: transform .3s cubic-bezier(.34,1.56,.64,1);
}
.cf-logo-box:hover { transform: rotate(-8deg) scale(1.1); }
.cf-logo-txt {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 17px; font-weight: 800; color: #0f172a; letter-spacing: -.02em;
}
.cf-logo-txt b { color: #2563eb; }
.cf-secure-badge {
  display: flex; align-items: center; gap: 5px;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: 100px; padding: 4px 11px;
  font-size: 11px; font-weight: 700; color: #15803d;
}

.cf-amount-section {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 26px; border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  position: relative; z-index: 1;
}
.cf-amount-icon {
  font-size: 28px; width: 50px; height: 50px; flex-shrink: 0;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(15,23,42,.06);
  animation: cfIconBob 3s ease-in-out infinite;
}
@keyframes cfIconBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
.cf-amount-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 3px; }
.cf-amount-value { font-family: 'Fraunces', Georgia, serif; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -.02em; }
.cf-amount-badge {
  margin-left: auto; background: #eff6ff; border: 1px solid #bfdbfe;
  color: #1d4ed8; font-size: 11px; font-weight: 700;
  padding: 4px 12px; border-radius: 100px; flex-shrink: 0;
  animation: cfPulse 2.5s ease-in-out infinite;
}

.cf-divider { height: 1px; background: #f1f5f9; }

.cf-form {
  padding: 22px 26px 18px;
  display: flex; flex-direction: column; gap: 16px;
  position: relative; z-index: 1;
}

.cf-sec-lbl {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 10px; font-weight: 700; letter-spacing: .18em;
  text-transform: uppercase; color: #94a3b8;
  display: flex; align-items: center; gap: 10px; margin-bottom: -4px;
}
.cf-sec-lbl::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }

.cf-field { display: flex; flex-direction: column; gap: 8px; }
.cf-lbl {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 11px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: #64748b;
  display: flex; align-items: center; gap: 6px;
}

.cf-card-brands { display: flex; gap: 5px; margin-left: auto; }
.cf-brand {
  font-size: 9px; font-weight: 800; letter-spacing: .06em;
  padding: 2px 7px; border-radius: 4px;
  background: #1e3a8a; color: #fff;
}
.cf-brand-mc   { background: linear-gradient(90deg,#eb001b,#f79e1b); }
.cf-brand-ru   { background: #1a6b3c; }
.cf-brand-amex { background: #2e77bc; }

/* ── shared input box ── */
.cf-input-box {
  display: flex; align-items: center; gap: 10px;
  background: #fff; border: 1.5px solid #cbd5e1; border-radius: 13px;
  padding: 13px 16px;
  transition: border-color .22s, box-shadow .22s, background .22s;
}
.cf-input-box:focus-within {
  border-color: #2563eb;
  background: #fafcff;
  box-shadow: 0 0 0 4px rgba(37,99,235,.09);
}
.cf-input-box--card { padding: 13px 16px 13px 12px; }
.cf-input-icon { flex-shrink: 0; display: flex; align-items: center; }
.cf-stripe-wrap { flex: 1; min-width: 0; }

/* ── expiry + cvv row ── */
.cf-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.cf-input-box--half { padding: 13px 12px; }

.cf-input-box--expiry {
  border-color: #bfdbfe;
  background: #f8fbff;
}
.cf-input-box--expiry:focus-within {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 4px rgba(37,99,235,.09);
}

.cf-input-box--cvv {
  border-color: #ddd6fe;
  background: #faf8ff;
}
.cf-input-box--cvv:focus-within {
  border-color: #7c3aed;
  background: #f5f3ff;
  box-shadow: 0 0 0 4px rgba(124,58,237,.09);
}

.cf-cvv-tip {
  display: flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 600; color: #7c3aed;
  background: #f5f3ff; border: 1px solid #ddd6fe;
  padding: 2px 8px; border-radius: 100px;
  white-space: nowrap; flex-shrink: 0;
}

/* security note */
.cf-sec-note {
  display: flex; align-items: center; gap: 8px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 500;
}

/* error */
.cf-error {
  display: flex; align-items: flex-start; gap: 9px;
  background: #fff1f2; border-left: 3px solid #ef4444;
  padding: 11px 14px; border-radius: 0 10px 10px 0;
  animation: cfErrIn .3s cubic-bezier(.22,1,.36,1);
}
@keyframes cfErrIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
.cf-error span { font-size: 15px; flex-shrink: 0; }
.cf-error p { font-size: 13px; color: #be123c; font-weight: 500; line-height: 1.5; }

/* button */
.cf-btn {
  width: 100%; padding: 16px 24px; border-radius: 14px; border: none; cursor: pointer;
  font-family: 'Fraunces', Georgia, serif; font-size: 16px; font-weight: 700;
  letter-spacing: .01em;
  background: linear-gradient(135deg,#1d4ed8,#4f46e5); color: #fff;
  box-shadow: 0 4px 18px rgba(37,99,235,.30), inset 0 1px 0 rgba(255,255,255,.15);
  transition: all .25s cubic-bezier(.22,1,.36,1); margin-top: 4px;
}
.cf-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(37,99,235,.42), inset 0 1px 0 rgba(255,255,255,.15); }
.cf-btn:active:not(:disabled) { transform: translateY(0); }
.cf-btn-loading  { background: #e2e8f0 !important; color: #94a3b8 !important; cursor: not-allowed; box-shadow: none !important; transform: none !important; }
.cf-btn-disabled { background: #e2e8f0 !important; color: #94a3b8 !important; cursor: not-allowed; box-shadow: none !important; }
.cf-btn-inner { display: flex; align-items: center; justify-content: center; gap: 9px; }
.cf-btn-arrow { transition: transform .2s; display: inline-block; }
.cf-btn:hover:not(:disabled) .cf-btn-arrow { transform: translateX(5px); }
.cf-spinner {
  width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
  border: 2.5px solid rgba(255,255,255,.25); border-top-color: #fff;
  animation: cfSpin .7s linear infinite;
}
@keyframes cfSpin { to { transform: rotate(360deg); } }

/* footer */
.cf-footer {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 14px 26px;
  background: #fafbff; border-top: 1px solid #f1f5f9;
  font-size: 11px; color: #94a3b8; font-weight: 600;
  position: relative; z-index: 1;
}
.cf-footer-item { display: flex; align-items: center; gap: 4px; }
.cf-footer-dot { width: 3px; height: 3px; border-radius: 50%; background: #cbd5e1; flex-shrink: 0; }

.cf-powered {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 11px; color: #94a3b8; font-weight: 500;
}
.cf-stripe-badge { display: flex; align-items: center; }

/* stagger fade-up */
.cf-in { opacity: 0; transform: translateY(18px); animation: cfUp .55s cubic-bezier(.22,1,.36,1) forwards; }
.cf-d0{animation-delay:.04s} .cf-d1{animation-delay:.12s} .cf-d2{animation-delay:.20s}
.cf-d3{animation-delay:.28s} .cf-d4{animation-delay:.35s} .cf-d5{animation-delay:.42s}
@keyframes cfUp { to { opacity: 1; transform: translateY(0); } }
`;