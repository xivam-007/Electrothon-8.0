'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { connectToBackendServices } from '@/services/connectToBackend';

type PhoneStatus = 'idle' | 'checking' | 'not-found' | 'found';

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>('idle');

  const router = useRouter();
  const authContext = useAuth();

  useEffect(() => {
    if (authContext?.isAuthenticated) router.push('/dashboard');
  }, [authContext?.isAuthenticated, router]);

  // Debounced phone check
  useEffect(() => {
    if (phoneNumber.length !== 10) {
      setPhoneStatus('idle');
      return;
    }

    setPhoneStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const response = await connectToBackendServices.checkPhone(phoneNumber);
        setPhoneStatus(response.exists ? 'found' : 'not-found');
      } catch {
        setPhoneStatus('idle');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [phoneNumber]);

  const handleRequestOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (phoneStatus === 'not-found') {
      setError('This number is not registered. Please sign up first.');
      return;
    }

    setLoading(true);
    try {
      const response = await connectToBackendServices.otpRequest({ flow: 'login', phoneNumber });
      if (response?.success) {
        setStep(2);
      } else {
        setError(response?.message || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await connectToBackendServices.verifyOTPLogin({ phoneNumber, otp });
      if (response?.success && response?.token) {
        authContext?.login(response.token);
      } else {
        setError(response?.message || 'Invalid OTP. Please try again.');
      }
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const phoneBorderClass =
    phoneStatus === 'not-found' ? 'border-red-400 focus:ring-red-400' :
    phoneStatus === 'found'     ? 'border-green-400 focus:ring-green-400' :
    'border-slate-300 focus:ring-blue-500';

  if (authContext?.isAuthenticated) return null;

  return (
    <div className="font-semibold text-black min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
            KP
          </div>
        </div>
        <h2 className="text-center text-4xl font-bold text-slate-900">
          {step === 1 ? 'Log in to your account' : 'Enter verification code'}
        </h2>
        <p className="mt-3 text-center text-base text-slate-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition">
            Create one
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-12 px-8 sm:px-12 rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl">

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-8" onSubmit={handleRequestOTP}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className={`block w-full pl-14 pr-28 py-4 border rounded-xl shadow-sm text-base placeholder-slate-400 focus:outline-none focus:ring-2 ${phoneBorderClass}`}
                    placeholder="Enter your number"
                  />
                  {/* Status badge inside input */}
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium">
                    {phoneStatus === 'checking'  && <span className="text-slate-400">Checking...</span>}
                    {phoneStatus === 'not-found' && <span className="text-red-500">✗ Not registered</span>}
                    {phoneStatus === 'found'     && <span className="text-green-500">✓ Registered</span>}
                  </span>
                </div>
                {/* Hint below input */}
                {phoneStatus === 'not-found' && (
                  <p className="mt-2 text-sm text-red-600">
                    This number is not registered.{' '}
                    <Link href="/signup" className="font-semibold underline">Sign up instead?</Link>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10 || phoneStatus === 'not-found' || phoneStatus === 'checking'}
                className="w-full flex justify-center py-4 px-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>

          ) : (
            <form className="space-y-8" onSubmit={handleVerifyOTP}>
              <div className="text-base text-slate-600 text-center">
                We've sent a code to <span className="font-semibold">+91 {phoneNumber}</span>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Enter OTP</label>
                <input
                  type="text"
                  minLength={6}
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="block w-full px-4 py-4 border border-slate-300 rounded-xl text-center text-2xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="• • • • • •"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center py-4 px-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

// "use client"

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuth } from '@/context/AuthContext';
// import { connectToBackendServices } from '@/services/connectToBackend';

// type PhoneStatus = 'idle' | 'checking' | 'not-found' | 'found';

// const LoginPage = () => {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [otp, setOtp] = useState('');
//   const [step, setStep] = useState<1 | 2>(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>('idle');

//   const router = useRouter();
//   const authContext = useAuth();

//   useEffect(() => {
//     if (authContext?.isAuthenticated) router.push('/dashboard');
//   }, [authContext?.isAuthenticated, router]);

//   // Debounced phone check
//   useEffect(() => {
//     if (phoneNumber.length !== 10) {
//       setPhoneStatus('idle');
//       return;
//     }
//     setPhoneStatus('checking');
//     const timer = setTimeout(async () => {
//       try {
//         const response = await connectToBackendServices.checkPhone(phoneNumber);
//         setPhoneStatus(response.exists ? 'found' : 'not-found');
//       } catch {
//         setPhoneStatus('idle');
//       }
//     }, 600);
//     return () => clearTimeout(timer);
//   }, [phoneNumber]);

//   const handleRequestOTP = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError('');
//     if (!/^\d{10}$/.test(phoneNumber)) {
//       setError('Please enter a valid 10-digit mobile number.');
//       return;
//     }
//     if (phoneStatus === 'not-found') {
//       setError('This number is not registered. Please sign up first.');
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await connectToBackendServices.otpRequest({ flow: 'login', phoneNumber });
//       if (response?.success) {
//         setStep(2);
//       } else {
//         setError(response?.message || 'Failed to send OTP. Please try again.');
//       }
//     } catch {
//       setError('Failed to send OTP. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError('');
//     if (otp.length !== 6) {
//       setError('Please enter a valid 6-digit OTP.');
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await connectToBackendServices.verifyOTPLogin({ phoneNumber, otp });
//       if (response?.success && response?.token) {
//         authContext?.login(response.token);
//       } else {
//         setError(response?.message || 'Invalid OTP. Please try again.');
//       }
//     } catch {
//       setError('Invalid OTP. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const phoneBorderClass =
//     phoneStatus === 'not-found' ? 'border-red-400 focus:ring-red-400' :
//     phoneStatus === 'found'     ? 'border-green-400 focus:ring-green-400' :
//     'border-slate-300 focus:ring-blue-500';

//   if (authContext?.isAuthenticated) return null;

//   return (
//     <div className="lg-root">
//       <style>{CSS}</style>

//       {/* ── ambient bg ── */}
//       <div className="lg-orb lg-orb1" />
//       <div className="lg-orb lg-orb2" />
//       <div className="lg-orb lg-orb3" />
//       <div className="lg-grid" />

//       {/* ── LEFT PANEL — brand side ── */}
//       <div className="lg-left">

//         {/* logo */}
//         <div className="lg-logo">
//           <div className="lg-logo-box">🧈</div>
//           <span className="lg-logo-txt">Makhan<b> Move</b></span>
//         </div>

//         {/* hero text */}
//         <div className="lg-left-hero">
//           <div className="lg-left-chip">
//             <span className="lg-chip-dot" />
//             AI-Powered Logistics
//           </div>
//           <h1 className="lg-left-title">
//             Move smarter.<br />
//             <em>Pay safer.</em>
//           </h1>
//           <p className="lg-left-sub">
//             Our AI agent negotiates the best rate with drivers in Hinglish — no advance payment, no scams. Your money stays in escrow until delivery.
//           </p>
//         </div>

//         {/* feature pills */}
//         <div className="lg-features">
//           {[
//             { icon: '🤖', text: 'AI negotiates for you' },
//             { icon: '🔒', text: 'Escrow-secured payment' },
//             { icon: '🛡️', text: 'ML fraud detection' },
//             { icon: '⚡', text: 'Deal in ~2 minutes' },
//           ].map((f, i) => (
//             <div key={f.text} className="lg-feat" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
//               <span className="lg-feat-icon">{f.icon}</span>
//               <span className="lg-feat-txt">{f.text}</span>
//             </div>
//           ))}
//         </div>

//         {/* floating trucks decoration */}
//         <div className="lg-trucks" aria-hidden="true">
//           <svg className="lg-truck-svg" viewBox="0 0 420 90" xmlns="http://www.w3.org/2000/svg">
//             {/* road */}
//             <rect x="0" y="68" width="420" height="22" fill="rgba(255,255,255,0.08)" rx="4"/>
//             <rect x="0" y="68" width="420" height="2" fill="rgba(255,255,255,0.15)"/>
//             {[10,80,150,220,290,360].map(x => (
//               <rect key={x} x={x} y="77" width="35" height="3" fill="rgba(255,255,255,0.25)" rx="2"/>
//             ))}
//             {/* blue truck */}
//             <g className="lg-truck-anim1">
//               <ellipse cx="68" cy="68" rx="60" ry="5" fill="rgba(0,0,0,0.15)"/>
//               <polygon points="18,36 128,36 138,26 28,26" fill="rgba(255,255,255,0.35)"/>
//               <polygon points="128,36 138,26 138,60 128,68" fill="rgba(255,255,255,0.15)"/>
//               <polygon points="18,36 128,36 128,68 18,68" fill="rgba(255,255,255,0.25)"/>
//               <polygon points="0,44 18,36 18,52 0,60" fill="rgba(255,255,255,0.2)"/>
//               <polygon points="0,44 18,36 18,68 0,68" fill="rgba(255,255,255,0.18)"/>
//               <polygon points="2,46 15,41 15,54 2,59" fill="rgba(255,255,255,0.3)"/>
//               <ellipse cx="16" cy="68" rx="9" ry="9" fill="rgba(0,0,0,0.4)"/>
//               <ellipse cx="16" cy="68" rx="5" ry="5" fill="rgba(255,255,255,0.2)"/>
//               <ellipse cx="106" cy="68" rx="9" ry="9" fill="rgba(0,0,0,0.4)"/>
//               <ellipse cx="106" cy="68" rx="5" ry="5" fill="rgba(255,255,255,0.2)"/>
//             </g>
//             {/* small auto */}
//             <g className="lg-truck-anim2">
//               <polygon points="282,42 322,42 328,36 288,36" fill="rgba(255,255,255,0.28)"/>
//               <polygon points="322,42 328,36 328,62 322,68" fill="rgba(255,255,255,0.12)"/>
//               <polygon points="282,42 322,42 322,68 282,68" fill="rgba(255,255,255,0.2)"/>
//               <polygon points="270,48 282,42 282,54 270,60" fill="rgba(255,255,255,0.18)"/>
//               <polygon points="270,48 282,42 282,68 270,68" fill="rgba(255,255,255,0.15)"/>
//               <ellipse cx="280" cy="68" rx="7" ry="7" fill="rgba(0,0,0,0.35)"/>
//               <ellipse cx="280" cy="68" rx="4" ry="4" fill="rgba(255,255,255,0.2)"/>
//               <ellipse cx="316" cy="68" rx="7" ry="7" fill="rgba(0,0,0,0.35)"/>
//               <ellipse cx="316" cy="68" rx="4" ry="4" fill="rgba(255,255,255,0.2)"/>
//             </g>
//           </svg>
//         </div>

//       </div>

//       {/* ── RIGHT PANEL — form side ── */}
//       <div className="lg-right">

//         <div className="lg-form-wrap">

//           {/* step indicator */}
//           <div className="lg-steps">
//             <div className={`lg-step ${step === 1 ? 'lg-step-active' : 'lg-step-done'}`}>
//               <div className="lg-step-dot">
//                 {step > 1 ? '✓' : '1'}
//               </div>
//               <span>Phone</span>
//             </div>
//             <div className="lg-step-line">
//               <div className="lg-step-line-inner" style={{ width: step === 2 ? '100%' : '0%' }} />
//             </div>
//             <div className={`lg-step ${step === 2 ? 'lg-step-active' : ''}`}>
//               <div className="lg-step-dot">2</div>
//               <span>Verify</span>
//             </div>
//           </div>

//           {/* card */}
//           <div className="lg-card lg-in">

//             {/* card header */}
//             <div className="lg-card-hdr">
//               <div className="lg-card-hdr-icon">
//                 {step === 1 ? '📱' : '🔐'}
//               </div>
//               <div>
//                 <h2 className="lg-card-title">
//                   {step === 1 ? 'Welcome back' : 'Verify your phone'}
//                 </h2>
//                 <p className="lg-card-sub">
//                   {step === 1
//                     ? 'Enter your registered mobile number'
//                     : `Code sent to +91 ${phoneNumber}`}
//                 </p>
//               </div>
//             </div>

//             {/* error */}
//             {error && (
//               <div className="lg-error">
//                 <span>⚠️</span>
//                 <p>{error}</p>
//               </div>
//             )}

//             {/* ── STEP 1: Phone ── */}
//             {step === 1 ? (
//               <form onSubmit={handleRequestOTP} className="lg-form">

//                 <div className="lg-field">
//                   <label className="lg-lbl">
//                     <span>📞</span> Mobile Number
//                   </label>
//                   <div className="lg-phone-wrap">
//                     <span className="lg-phone-prefix">+91</span>
//                     <input
//                       type="tel"
//                       maxLength={10}
//                       required
//                       value={phoneNumber}
//                       onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
//                       className={`lg-inp lg-inp-phone ${
//                         phoneStatus === 'not-found' ? 'lg-inp-error' :
//                         phoneStatus === 'found'     ? 'lg-inp-success' : ''
//                       }`}
//                       placeholder="Enter your number"
//                     />
//                     <span className="lg-phone-status">
//                       {phoneStatus === 'checking'  && <span className="lg-status-checking"><span className="lg-status-spin" />Checking</span>}
//                       {phoneStatus === 'not-found' && <span className="lg-status-error">✗ Not found</span>}
//                       {phoneStatus === 'found'     && <span className="lg-status-found">✓ Registered</span>}
//                     </span>
//                   </div>
//                   {phoneStatus === 'not-found' && (
//                     <p className="lg-hint-error">
//                       Not registered yet?{' '}
//                       <Link href="/signup" className="lg-link">Sign up instead →</Link>
//                     </p>
//                   )}
//                   {phoneStatus === 'found' && (
//                     <p className="lg-hint-success">✅ Great! Tap below to receive your OTP.</p>
//                   )}
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading || phoneNumber.length !== 10 || phoneStatus === 'not-found' || phoneStatus === 'checking'}
//                   className={`lg-btn ${
//                     !loading && phoneNumber.length === 10 && phoneStatus === 'found'
//                       ? 'lg-btn-active'
//                       : 'lg-btn-disabled'
//                   }`}
//                 >
//                   {loading ? (
//                     <><span className="lg-btn-spinner" /> Sending OTP…</>
//                   ) : (
//                     <>
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.9a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
//                       Get OTP
//                       <span className="lg-btn-arrow">→</span>
//                     </>
//                   )}
//                 </button>

//                 <p className="lg-signup-txt">
//                   Don't have an account?{' '}
//                   <Link href="/signup" className="lg-link">Create one 🚀</Link>
//                 </p>

//               </form>
//             ) : (

//               /* ── STEP 2: OTP ── */
//               <form onSubmit={handleVerifyOTP} className="lg-form">

//                 <div className="lg-field">
//                   <label className="lg-lbl">
//                     <span>🔑</span> Enter OTP
//                   </label>
//                   <input
//                     type="text"
//                     minLength={6}
//                     maxLength={6}
//                     required
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//                     className="lg-inp lg-inp-otp"
//                     placeholder="• • • • • •"
//                   />
//                   {/* OTP progress dots */}
//                   <div className="lg-otp-dots">
//                     {[0,1,2,3,4,5].map(i => (
//                       <div
//                         key={i}
//                         className={`lg-otp-dot ${i < otp.length ? 'lg-otp-dot-filled' : ''}`}
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 <div className="lg-otp-info">
//                   <span>📨 Code sent to <b>+91 {phoneNumber}</b></span>
//                   <button
//                     type="button"
//                     onClick={() => { setStep(1); setOtp(''); setError(''); }}
//                     className="lg-edit-btn"
//                   >
//                     ✏️ Edit number
//                   </button>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading || otp.length !== 6}
//                   className={`lg-btn ${
//                     !loading && otp.length === 6 ? 'lg-btn-active' : 'lg-btn-disabled'
//                   }`}
//                 >
//                   {loading ? (
//                     <><span className="lg-btn-spinner" /> Verifying…</>
//                   ) : (
//                     <>
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
//                       Sign In
//                       <span className="lg-btn-arrow">→</span>
//                     </>
//                   )}
//                 </button>

//               </form>
//             )}

//           </div>

//           <p className="lg-footer-note">
//             🔒 Secured by end-to-end encryption &nbsp;·&nbsp; No spam, ever.
//           </p>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

// // ── CSS ────────────────────────────────────────────────────────────────────────
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800;9..144,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

// /* ── root: split layout ── */
// .lg-root {
//   min-height: 100vh; width: 100%;
//   display: grid; grid-template-columns: 1fr 1fr;
//   font-family: 'DM Sans', sans-serif;
//   color: #0f172a; overflow: hidden; position: relative;
// }
// @media (max-width: 860px) {
//   .lg-root { grid-template-columns: 1fr; }
//   .lg-left  { display: none; }
// }

// /* ── ambient bg ── */
// .lg-orb {
//   position: fixed; border-radius: 50%;
//   pointer-events: none; z-index: 0;
//   animation: lgFloat 9s ease-in-out infinite;
// }
// .lg-orb1 { top:-120px; right:0; width:500px; height:500px; background:radial-gradient(circle,rgba(37,99,235,.07),transparent 68%); }
// .lg-orb2 { bottom:0; left:50%; width:400px; height:400px; background:radial-gradient(circle,rgba(79,70,229,.06),transparent 68%); animation-delay:-4.5s; }
// .lg-orb3 { top:40%; right:10%; width:260px; height:260px; background:radial-gradient(circle,rgba(16,185,129,.04),transparent 68%); animation-delay:-2s; }
// @keyframes lgFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
// .lg-grid {
//   position: fixed; inset: 0; z-index: 0; pointer-events: none;
//   background-image: radial-gradient(rgba(37,99,235,.05) 1px, transparent 1px);
//   background-size: 28px 28px;
// }

// /* ── LEFT PANEL ── */
// .lg-left {
//   position: relative; z-index: 1;
//   background: linear-gradient(160deg, #1d4ed8 0%, #4f46e5 50%, #1e1b4b 100%);
//   padding: 48px 44px; display: flex; flex-direction: column; justify-content: space-between;
//   overflow: hidden;
// }
// /* left panel inner glow */
// .lg-left::before {
//   content: '';
//   position: absolute; top: -80px; left: -80px;
//   width: 360px; height: 360px; border-radius: 50%;
//   background: radial-gradient(circle, rgba(255,255,255,.08), transparent 65%);
//   pointer-events: none;
// }
// .lg-left::after {
//   content: '';
//   position: absolute; bottom: 60px; right: -60px;
//   width: 280px; height: 280px; border-radius: 50%;
//   background: radial-gradient(circle, rgba(255,255,255,.05), transparent 65%);
//   pointer-events: none;
// }

// /* logo on left */
// .lg-logo { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
// .lg-logo-box {
//   width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
//   background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.25);
//   display: flex; align-items: center; justify-content: center; font-size: 20px;
//   backdrop-filter: blur(8px);
//   transition: transform .3s cubic-bezier(.34,1.56,.64,1);
// }
// .lg-logo-box:hover { transform: rotate(-8deg) scale(1.12); }
// .lg-logo-txt {
//   font-family: 'Fraunces', Georgia, serif;
//   font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -.02em;
// }
// .lg-logo-txt b { color: rgba(255,255,255,.75); font-weight: 800; }

// /* left hero */
// .lg-left-hero { position: relative; z-index: 1; }
// .lg-left-chip {
//   display: inline-flex; align-items: center; gap: 7px;
//   background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
//   color: rgba(255,255,255,.9);
//   font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
//   padding: 5px 14px; border-radius: 100px; margin-bottom: 20px;
// }
// .lg-chip-dot {
//   width: 5px; height: 5px; border-radius: 50%; background: #34d399;
//   animation: lgPulse 2s ease-in-out infinite;
// }
// @keyframes lgPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.55)} }
// .lg-left-title {
//   font-family: 'Fraunces', Georgia, serif;
//   font-size: 48px; font-weight: 900; color: #fff;
//   line-height: 1.05; letter-spacing: -.04em; margin-bottom: 16px;
// }
// .lg-left-title em { font-style: normal; color: #a5f3fc; }
// .lg-left-sub {
//   font-size: 15px; color: rgba(255,255,255,.7); line-height: 1.7;
//   font-weight: 400; max-width: 340px;
// }

// /* feature pills */
// .lg-features { display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
// .lg-feat {
//   display: flex; align-items: center; gap: 12px;
//   background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
//   border-radius: 12px; padding: 12px 16px;
//   backdrop-filter: blur(6px);
//   opacity: 0; transform: translateX(-16px);
//   animation: lgFeatIn .55s cubic-bezier(.22,1,.36,1) forwards;
//   transition: background .2s, transform .2s;
// }
// .lg-feat:hover { background: rgba(255,255,255,.14); transform: translateX(4px); }
// @keyframes lgFeatIn { to { opacity: 1; transform: translateX(0); } }
// .lg-feat-icon { font-size: 20px; flex-shrink: 0; }
// .lg-feat-txt  { font-size: 14px; color: rgba(255,255,255,.88); font-weight: 500; }

// /* trucks decoration */
// .lg-trucks { position: relative; z-index: 1; overflow: hidden; height: 90px; border-radius: 12px; }
// .lg-truck-svg { width: 100%; height: 90px; overflow: visible; }
// .lg-truck-anim1 { animation: lgTruckMove1 8s linear infinite; }
// .lg-truck-anim2 { animation: lgTruckMove2 12s linear infinite; }
// @keyframes lgTruckMove1 { 0%{transform:translateX(-160px)} 100%{transform:translateX(460px)} }
// @keyframes lgTruckMove2 { 0%{transform:translateX(460px) scaleX(-1)} 100%{transform:translateX(-200px) scaleX(-1)} }

// /* ── RIGHT PANEL ── */
// .lg-right {
//   position: relative; z-index: 1;
//   background: #f0f4ff;
//   display: flex; align-items: center; justify-content: center;
//   padding: 48px 32px; min-height: 100vh;
// }

// .lg-form-wrap { width: 100%; max-width: 420px; }

// /* step indicator */
// .lg-steps {
//   display: flex; align-items: center; gap: 0;
//   margin-bottom: 28px;
// }
// .lg-step { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
// .lg-step-dot {
//   width: 30px; height: 30px; border-radius: 50%;
//   display: flex; align-items: center; justify-content: center;
//   font-size: 12px; font-weight: 700;
//   border: 2px solid #e2e8f0; background: #fff; color: #94a3b8;
//   transition: all .3s cubic-bezier(.22,1,.36,1);
// }
// .lg-step-active .lg-step-dot {
//   background: linear-gradient(135deg,#2563eb,#4f46e5);
//   border-color: #2563eb; color: #fff;
//   box-shadow: 0 0 0 4px rgba(37,99,235,.15);
// }
// .lg-step-done .lg-step-dot {
//   background: #10b981; border-color: #10b981; color: #fff;
// }
// .lg-step span { font-size: 12px; font-weight: 600; color: #94a3b8; }
// .lg-step-active span { color: #2563eb; }
// .lg-step-done span   { color: #10b981; }
// .lg-step-line {
//   flex: 1; height: 2px; background: #e2e8f0; margin: 0 10px;
//   border-radius: 2px; overflow: hidden;
// }
// .lg-step-line-inner {
//   height: 100%; background: linear-gradient(90deg,#2563eb,#4f46e5);
//   transition: width .5s cubic-bezier(.22,1,.36,1);
//   border-radius: 2px;
// }

// /* card */
// .lg-card {
//   background: #fff; border: 1px solid #e2e8f0; border-radius: 24px;
//   overflow: hidden; box-shadow: 0 4px 24px rgba(15,23,42,.08);
//   transition: box-shadow .25s;
// }
// .lg-card:hover { box-shadow: 0 8px 40px rgba(15,23,42,.12); }

// .lg-in {
//   opacity: 0; transform: translateY(20px);
//   animation: lgUp .55s cubic-bezier(.22,1,.36,1) .05s forwards;
// }
// @keyframes lgUp { to { opacity: 1; transform: translateY(0); } }

// /* card header */
// .lg-card-hdr {
//   display: flex; align-items: center; gap: 14px;
//   padding: 22px 26px 18px; border-bottom: 1px solid #f1f5f9; background: #fafbff;
// }
// .lg-card-hdr-icon {
//   width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
//   background: #eff6ff; border: 1px solid #bfdbfe;
//   display: flex; align-items: center; justify-content: center; font-size: 22px;
//   transition: transform .3s cubic-bezier(.34,1.56,.64,1);
// }
// .lg-card:hover .lg-card-hdr-icon { transform: scale(1.08) rotate(-5deg); }
// .lg-card-title {
//   font-family: 'Fraunces', Georgia, serif;
//   font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -.02em;
// }
// .lg-card-sub { font-size: 12px; color: #94a3b8; margin-top: 3px; }

// /* error */
// .lg-error {
//   display: flex; align-items: flex-start; gap: 10px;
//   background: #fff1f2; border-left: 3px solid #ef4444;
//   padding: 12px 16px; margin: 16px 26px 0;
//   border-radius: 0 10px 10px 0;
//   animation: lgErrIn .3s cubic-bezier(.22,1,.36,1);
// }
// @keyframes lgErrIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
// .lg-error span { font-size: 16px; flex-shrink: 0; }
// .lg-error p { font-size: 13px; color: #be123c; font-weight: 500; line-height: 1.5; }

// /* form body */
// .lg-form { padding: 24px 26px; display: flex; flex-direction: column; gap: 18px; }

// .lg-field { display: flex; flex-direction: column; gap: 8px; }
// .lg-lbl {
//   font-family: 'Fraunces', Georgia, serif;
//   font-size: 11px; font-weight: 700; letter-spacing: .12em;
//   text-transform: uppercase; color: #64748b;
//   display: flex; align-items: center; gap: 6px;
// }

// /* phone input */
// .lg-phone-wrap { position: relative; display: flex; align-items: center; }
// .lg-phone-prefix {
//   position: absolute; left: 14px; font-size: 14px; font-weight: 700;
//   color: #0f172a; pointer-events: none; z-index: 1; letter-spacing: .02em;
// }
// .lg-phone-status {
//   position: absolute; right: 14px;
//   font-size: 11px; font-weight: 700; flex-shrink: 0;
// }
// .lg-status-checking { color: #94a3b8; display: flex; align-items: center; gap: 5px; }
// .lg-status-spin {
//   width: 10px; height: 10px; border-radius: 50%;
//   border: 1.5px solid #cbd5e1; border-top-color: #2563eb;
//   animation: lgSpin .7s linear infinite; display: inline-block;
// }
// @keyframes lgSpin { to { transform: rotate(360deg); } }
// .lg-status-error { color: #ef4444; }
// .lg-status-found  { color: #10b981; }

// .lg-inp {
//   width: 100%; padding: 14px 16px; padding-left: 48px;
//   background: #fff; border: 1.5px solid #cbd5e1; border-radius: 13px;
//   color: #0f172a; font-family: 'DM Sans', sans-serif;
//   font-size: 15px; font-weight: 600; outline: none;
//   transition: border-color .2s, box-shadow .2s, background .2s;
//   -webkit-appearance: none;
// }
// .lg-inp-phone { padding-right: 110px; }
// .lg-inp::placeholder { color: #94a3b8; font-weight: 400; }
// .lg-inp:focus {
//   border-color: #2563eb; background: #fafcff;
//   box-shadow: 0 0 0 4px rgba(37,99,235,.09);
// }
// .lg-inp-error   { border-color: #f87171 !important; }
// .lg-inp-error:focus { box-shadow: 0 0 0 4px rgba(239,68,68,.09) !important; }
// .lg-inp-success { border-color: #34d399 !important; }
// .lg-inp-success:focus { box-shadow: 0 0 0 4px rgba(52,211,153,.09) !important; }

// /* OTP input */
// .lg-inp-otp {
//   padding-left: 16px; text-align: center;
//   font-size: 28px; letter-spacing: .42em; font-weight: 800;
//   font-family: 'Fraunces', Georgia, serif;
//   border-color: #bfdbfe;
// }
// .lg-inp-otp:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,.09); }

// /* OTP progress dots */
// .lg-otp-dots { display: flex; gap: 8px; justify-content: center; margin-top: 10px; }
// .lg-otp-dot {
//   width: 10px; height: 10px; border-radius: 50%;
//   background: #e2e8f0; border: 1.5px solid #cbd5e1;
//   transition: all .2s cubic-bezier(.34,1.56,.64,1);
// }
// .lg-otp-dot-filled {
//   background: #2563eb; border-color: #2563eb;
//   transform: scale(1.25);
//   box-shadow: 0 0 0 3px rgba(37,99,235,.2);
// }

// /* hints */
// .lg-hint-error   { font-size: 12px; color: #ef4444; font-weight: 500; }
// .lg-hint-success { font-size: 12px; color: #10b981; font-weight: 500; }
// .lg-link { color: #2563eb; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }

// /* OTP info row */
// .lg-otp-info {
//   display: flex; align-items: center; justify-content: space-between;
//   font-size: 13px; color: #64748b; background: #f8fafc;
//   border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px;
//   gap: 8px; flex-wrap: wrap;
// }
// .lg-edit-btn {
//   background: none; border: none; cursor: pointer;
//   color: #2563eb; font-size: 12px; font-weight: 700;
//   font-family: 'DM Sans', sans-serif;
//   transition: color .15s;
// }
// .lg-edit-btn:hover { color: #1d4ed8; }

// /* submit button */
// .lg-btn {
//   width: 100%; padding: 15px 24px; border-radius: 14px; border: none; cursor: pointer;
//   font-family: 'Fraunces', Georgia, serif; font-size: 15px; font-weight: 700;
//   letter-spacing: .01em;
//   display: flex; align-items: center; justify-content: center; gap: 9px;
//   transition: all .25s cubic-bezier(.22,1,.36,1);
// }
// .lg-btn-active {
//   background: linear-gradient(135deg,#1d4ed8,#4f46e5); color: #fff;
//   box-shadow: 0 4px 18px rgba(37,99,235,.3);
// }
// .lg-btn-active:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(37,99,235,.4); }
// .lg-btn-active:active { transform: translateY(0); }
// .lg-btn-disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
// .lg-btn-spinner {
//   width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
//   border: 2.5px solid rgba(255,255,255,.25); border-top-color: #fff;
//   animation: lgSpin .7s linear infinite;
// }
// .lg-btn-arrow { transition: transform .2s; display: inline-block; }
// .lg-btn-active:hover .lg-btn-arrow { transform: translateX(5px); }

// /* signup link */
// .lg-signup-txt { font-size: 13px; color: #64748b; text-align: center; }

// /* footer note */
// .lg-footer-note {
//   text-align: center; font-size: 12px; color: #94a3b8;
//   margin-top: 18px; line-height: 1.6;
// }
// `;'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuth } from '@/context/AuthContext';
// import { connectToBackendServices } from '@/services/connectToBackend';

// type PhoneStatus = 'idle' | 'checking' | 'not-found' | 'found';

// const LoginPage = () => {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [otp, setOtp] = useState('');
//   const [step, setStep] = useState<1 | 2>(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>('idle');

//   const router = useRouter();
//   const authContext = useAuth();

//   useEffect(() => {
//     if (authContext?.isAuthenticated) router.push('/dashboard');
//   }, [authContext?.isAuthenticated, router]);

//   // Debounced phone check
//   useEffect(() => {
//     if (phoneNumber.length !== 10) {
//       setPhoneStatus('idle');
//       return;
//     }
//     setPhoneStatus('checking');
//     const timer = setTimeout(async () => {
//       try {
//         const response = await connectToBackendServices.checkPhone(phoneNumber);
//         setPhoneStatus(response.exists ? 'found' : 'not-found');
//       } catch {
//         setPhoneStatus('idle');
//       }
//     }, 600);
//     return () => clearTimeout(timer);
//   }, [phoneNumber]);

//   const handleRequestOTP = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError('');
//     if (!/^\d{10}$/.test(phoneNumber)) {
//       setError('Please enter a valid 10-digit mobile number.');
//       return;
//     }
//     if (phoneStatus === 'not-found') {
//       setError('This number is not registered. Please sign up first.');
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await connectToBackendServices.otpRequest({ flow: 'login', phoneNumber });
//       if (response?.success) {
//         setStep(2);
//       } else {
//         setError(response?.message || 'Failed to send OTP. Please try again.');
//       }
//     } catch {
//       setError('Failed to send OTP. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError('');
//     if (otp.length !== 6) {
//       setError('Please enter a valid 6-digit OTP.');
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await connectToBackendServices.verifyOTPLogin({ phoneNumber, otp });
//       if (response?.success && response?.token) {
//         authContext?.login(response.token);
//       } else {
//         setError(response?.message || 'Invalid OTP. Please try again.');
//       }
//     } catch {
//       setError('Invalid OTP. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const phoneBorderClass =
//     phoneStatus === 'not-found' ? 'border-red-400 focus:ring-red-400' :
//     phoneStatus === 'found'     ? 'border-green-400 focus:ring-green-400' :
//     'border-slate-300 focus:ring-blue-500';

//   if (authContext?.isAuthenticated) return null;

//   return (
//     <div className="lg-root">
//       <style>{CSS}</style>

//       {/* ── ambient bg ── */}
//       <div className="lg-orb lg-orb1" />
//       <div className="lg-orb lg-orb2" />
//       <div className="lg-orb lg-orb3" />
//       <div className="lg-grid" />

//       {/* ── LEFT PANEL — brand side ── */}
//       <div className="lg-left">

//         {/* logo */}
//         <div className="lg-logo">
//           <div className="lg-logo-box">🧈</div>
//           <span className="lg-logo-txt">Makhan<b> Move</b></span>
//         </div>

//         {/* hero text */}
//         <div className="lg-left-hero">
//           <div className="lg-left-chip">
//             <span className="lg-chip-dot" />
//             AI-Powered Logistics
//           </div>
//           <h1 className="lg-left-title">
//             Move smarter.<br />
//             <em>Pay safer.</em>
//           </h1>
//           <p className="lg-left-sub">
//             Our AI agent negotiates the best rate with drivers in Hinglish — no advance payment, no scams. Your money stays in escrow until delivery.
//           </p>
//         </div>

//         {/* feature pills */}
//         <div className="lg-features">
//           {[
//             { icon: '🤖', text: 'AI negotiates for you' },
//             { icon: '🔒', text: 'Escrow-secured payment' },
//             { icon: '🛡️', text: 'ML fraud detection' },
//             { icon: '⚡', text: 'Deal in ~2 minutes' },
//           ].map((f, i) => (
//             <div key={f.text} className="lg-feat" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
//               <span className="lg-feat-icon">{f.icon}</span>
//               <span className="lg-feat-txt">{f.text}</span>
//             </div>
//           ))}
//         </div>

//         {/* floating trucks decoration */}
//         <div className="lg-trucks" aria-hidden="true">
//           <svg className="lg-truck-svg" viewBox="0 0 420 90" xmlns="http://www.w3.org/2000/svg">
//             {/* road */}
//             <rect x="0" y="68" width="420" height="22" fill="rgba(255,255,255,0.08)" rx="4"/>
//             <rect x="0" y="68" width="420" height="2" fill="rgba(255,255,255,0.15)"/>
//             {[10,80,150,220,290,360].map(x => (
//               <rect key={x} x={x} y="77" width="35" height="3" fill="rgba(255,255,255,0.25)" rx="2"/>
//             ))}
//             {/* blue truck */}
//             <g className="lg-truck-anim1">
//               <ellipse cx="68" cy="68" rx="60" ry="5" fill="rgba(0,0,0,0.15)"/>
//               <polygon points="18,36 128,36 138,26 28,26" fill="rgba(255,255,255,0.35)"/>
//               <polygon points="128,36 138,26 138,60 128,68" fill="rgba(255,255,255,0.15)"/>
//               <polygon points="18,36 128,36 128,68 18,68" fill="rgba(255,255,255,0.25)"/>
//               <polygon points="0,44 18,36 18,52 0,60" fill="rgba(255,255,255,0.2)"/>
//               <polygon points="0,44 18,36 18,68 0,68" fill="rgba(255,255,255,0.18)"/>
//               <polygon points="2,46 15,41 15,54 2,59" fill="rgba(255,255,255,0.3)"/>
//               <ellipse cx="16" cy="68" rx="9" ry="9" fill="rgba(0,0,0,0.4)"/>
//               <ellipse cx="16" cy="68" rx="5" ry="5" fill="rgba(255,255,255,0.2)"/>
//               <ellipse cx="106" cy="68" rx="9" ry="9" fill="rgba(0,0,0,0.4)"/>
//               <ellipse cx="106" cy="68" rx="5" ry="5" fill="rgba(255,255,255,0.2)"/>
//             </g>
//             {/* small auto */}
//             <g className="lg-truck-anim2">
//               <polygon points="282,42 322,42 328,36 288,36" fill="rgba(255,255,255,0.28)"/>
//               <polygon points="322,42 328,36 328,62 322,68" fill="rgba(255,255,255,0.12)"/>
//               <polygon points="282,42 322,42 322,68 282,68" fill="rgba(255,255,255,0.2)"/>
//               <polygon points="270,48 282,42 282,54 270,60" fill="rgba(255,255,255,0.18)"/>
//               <polygon points="270,48 282,42 282,68 270,68" fill="rgba(255,255,255,0.15)"/>
//               <ellipse cx="280" cy="68" rx="7" ry="7" fill="rgba(0,0,0,0.35)"/>
//               <ellipse cx="280" cy="68" rx="4" ry="4" fill="rgba(255,255,255,0.2)"/>
//               <ellipse cx="316" cy="68" rx="7" ry="7" fill="rgba(0,0,0,0.35)"/>
//               <ellipse cx="316" cy="68" rx="4" ry="4" fill="rgba(255,255,255,0.2)"/>
//             </g>
//           </svg>
//         </div>

//       </div>

//       {/* ── RIGHT PANEL — form side ── */}
//       <div className="lg-right">

//         <div className="lg-form-wrap">

//           {/* step indicator */}
//           <div className="lg-steps">
//             <div className={`lg-step ${step === 1 ? 'lg-step-active' : 'lg-step-done'}`}>
//               <div className="lg-step-dot">
//                 {step > 1 ? '✓' : '1'}
//               </div>
//               <span>Phone</span>
//             </div>
//             <div className="lg-step-line">
//               <div className="lg-step-line-inner" style={{ width: step === 2 ? '100%' : '0%' }} />
//             </div>
//             <div className={`lg-step ${step === 2 ? 'lg-step-active' : ''}`}>
//               <div className="lg-step-dot">2</div>
//               <span>Verify</span>
//             </div>
//           </div>

//           {/* card */}
//           <div className="lg-card lg-in">

//             {/* card header */}
//             <div className="lg-card-hdr">
//               <div className="lg-card-hdr-icon">
//                 {step === 1 ? '📱' : '🔐'}
//               </div>
//               <div>
//                 <h2 className="lg-card-title">
//                   {step === 1 ? 'Welcome back' : 'Verify your phone'}
//                 </h2>
//                 <p className="lg-card-sub">
//                   {step === 1
//                     ? 'Enter your registered mobile number'
//                     : `Code sent to +91 ${phoneNumber}`}
//                 </p>
//               </div>
//             </div>

//             {/* error */}
//             {error && (
//               <div className="lg-error">
//                 <span>⚠️</span>
//                 <p>{error}</p>
//               </div>
//             )}

//             {/* ── STEP 1: Phone ── */}
//             {step === 1 ? (
//               <form onSubmit={handleRequestOTP} className="lg-form">

//                 <div className="lg-field">
//                   <label className="lg-lbl">
//                     <span>📞</span> Mobile Number
//                   </label>
//                   <div className="lg-phone-wrap">
//                     <span className="lg-phone-prefix">+91</span>
//                     <input
//                       type="tel"
//                       maxLength={10}
//                       required
//                       value={phoneNumber}
//                       onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
//                       className={`lg-inp lg-inp-phone ${
//                         phoneStatus === 'not-found' ? 'lg-inp-error' :
//                         phoneStatus === 'found'     ? 'lg-inp-success' : ''
//                       }`}
//                       placeholder="Enter your number"
//                     />
//                     <span className="lg-phone-status">
//                       {phoneStatus === 'checking'  && <span className="lg-status-checking"><span className="lg-status-spin" />Checking</span>}
//                       {phoneStatus === 'not-found' && <span className="lg-status-error">✗ Not found</span>}
//                       {phoneStatus === 'found'     && <span className="lg-status-found">✓ Registered</span>}
//                     </span>
//                   </div>
//                   {phoneStatus === 'not-found' && (
//                     <p className="lg-hint-error">
//                       Not registered yet?{' '}
//                       <Link href="/signup" className="lg-link">Sign up instead →</Link>
//                     </p>
//                   )}
//                   {phoneStatus === 'found' && (
//                     <p className="lg-hint-success">✅ Great! Tap below to receive your OTP.</p>
//                   )}
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading || phoneNumber.length !== 10 || phoneStatus === 'not-found' || phoneStatus === 'checking'}
//                   className={`lg-btn ${
//                     !loading && phoneNumber.length === 10 && phoneStatus === 'found'
//                       ? 'lg-btn-active'
//                       : 'lg-btn-disabled'
//                   }`}
//                 >
//                   {loading ? (
//                     <><span className="lg-btn-spinner" /> Sending OTP…</>
//                   ) : (
//                     <>
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.9a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
//                       Get OTP
//                       <span className="lg-btn-arrow">→</span>
//                     </>
//                   )}
//                 </button>

//                 <p className="lg-signup-txt">
//                   Don't have an account?{' '}
//                   <Link href="/signup" className="lg-link">Create one 🚀</Link>
//                 </p>

//               </form>
//             ) : (

//               /* ── STEP 2: OTP ── */
//               <form onSubmit={handleVerifyOTP} className="lg-form">

//                 <div className="lg-field">
//                   <label className="lg-lbl">
//                     <span>🔑</span> Enter OTP
//                   </label>
//                   <input
//                     type="text"
//                     minLength={6}
//                     maxLength={6}
//                     required
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//                     className="lg-inp lg-inp-otp"
//                     placeholder="• • • • • •"
//                   />
//                   {/* OTP progress dots */}
//                   <div className="lg-otp-dots">
//                     {[0,1,2,3,4,5].map(i => (
//                       <div
//                         key={i}
//                         className={`lg-otp-dot ${i < otp.length ? 'lg-otp-dot-filled' : ''}`}
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 <div className="lg-otp-info">
//                   <span>📨 Code sent to <b>+91 {phoneNumber}</b></span>
//                   <button
//                     type="button"
//                     onClick={() => { setStep(1); setOtp(''); setError(''); }}
//                     className="lg-edit-btn"
//                   >
//                     ✏️ Edit number
//                   </button>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading || otp.length !== 6}
//                   className={`lg-btn ${
//                     !loading && otp.length === 6 ? 'lg-btn-active' : 'lg-btn-disabled'
//                   }`}
//                 >
//                   {loading ? (
//                     <><span className="lg-btn-spinner" /> Verifying…</>
//                   ) : (
//                     <>
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
//                       Sign In
//                       <span className="lg-btn-arrow">→</span>
//                     </>
//                   )}
//                 </button>

//               </form>
//             )}

//           </div>

//           <p className="lg-footer-note">
//             🔒 Secured by end-to-end encryption &nbsp;·&nbsp; No spam, ever.
//           </p>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

// // ── CSS ────────────────────────────────────────────────────────────────────────
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800;9..144,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

// /* ── root: split layout ── */
// .lg-root {
//   min-height: 100vh; width: 100%;
//   display: grid; grid-template-columns: 1fr 1fr;
//   font-family: 'DM Sans', sans-serif;
//   color: #0f172a; overflow: hidden; position: relative;
// }
// @media (max-width: 860px) {
//   .lg-root { grid-template-columns: 1fr; }
//   .lg-left  { display: none; }
// }

// /* ── ambient bg ── */
// .lg-orb {
//   position: fixed; border-radius: 50%;
//   pointer-events: none; z-index: 0;
//   animation: lgFloat 9s ease-in-out infinite;
// }
// .lg-orb1 { top:-120px; right:0; width:500px; height:500px; background:radial-gradient(circle,rgba(37,99,235,.07),transparent 68%); }
// .lg-orb2 { bottom:0; left:50%; width:400px; height:400px; background:radial-gradient(circle,rgba(79,70,229,.06),transparent 68%); animation-delay:-4.5s; }
// .lg-orb3 { top:40%; right:10%; width:260px; height:260px; background:radial-gradient(circle,rgba(16,185,129,.04),transparent 68%); animation-delay:-2s; }
// @keyframes lgFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
// .lg-grid {
//   position: fixed; inset: 0; z-index: 0; pointer-events: none;
//   background-image: radial-gradient(rgba(37,99,235,.05) 1px, transparent 1px);
//   background-size: 28px 28px;
// }

// /* ── LEFT PANEL ── */
// .lg-left {
//   position: relative; z-index: 1;
//   background: linear-gradient(160deg, #1d4ed8 0%, #4f46e5 50%, #1e1b4b 100%);
//   padding: 48px 44px; display: flex; flex-direction: column; justify-content: space-between;
//   overflow: hidden;
// }
// /* left panel inner glow */
// .lg-left::before {
//   content: '';
//   position: absolute; top: -80px; left: -80px;
//   width: 360px; height: 360px; border-radius: 50%;
//   background: radial-gradient(circle, rgba(255,255,255,.08), transparent 65%);
//   pointer-events: none;
// }
// .lg-left::after {
//   content: '';
//   position: absolute; bottom: 60px; right: -60px;
//   width: 280px; height: 280px; border-radius: 50%;
//   background: radial-gradient(circle, rgba(255,255,255,.05), transparent 65%);
//   pointer-events: none;
// }

// /* logo on left */
// .lg-logo { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
// .lg-logo-box {
//   width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
//   background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.25);
//   display: flex; align-items: center; justify-content: center; font-size: 20px;
//   backdrop-filter: blur(8px);
//   transition: transform .3s cubic-bezier(.34,1.56,.64,1);
// }
// .lg-logo-box:hover { transform: rotate(-8deg) scale(1.12); }
// .lg-logo-txt {
//   font-family: 'Fraunces', Georgia, serif;
//   font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -.02em;
// }
// .lg-logo-txt b { color: rgba(255,255,255,.75); font-weight: 800; }

// /* left hero */
// .lg-left-hero { position: relative; z-index: 1; }
// .lg-left-chip {
//   display: inline-flex; align-items: center; gap: 7px;
//   background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
//   color: rgba(255,255,255,.9);
//   font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
//   padding: 5px 14px; border-radius: 100px; margin-bottom: 20px;
// }
// .lg-chip-dot {
//   width: 5px; height: 5px; border-radius: 50%; background: #34d399;
//   animation: lgPulse 2s ease-in-out infinite;
// }
// @keyframes lgPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.55)} }
// .lg-left-title {
//   font-family: 'Fraunces', Georgia, serif;
//   font-size: 48px; font-weight: 900; color: #fff;
//   line-height: 1.05; letter-spacing: -.04em; margin-bottom: 16px;
// }
// .lg-left-title em { font-style: normal; color: #a5f3fc; }
// .lg-left-sub {
//   font-size: 15px; color: rgba(255,255,255,.7); line-height: 1.7;
//   font-weight: 400; max-width: 340px;
// }

// /* feature pills */
// .lg-features { display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
// .lg-feat {
//   display: flex; align-items: center; gap: 12px;
//   background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
//   border-radius: 12px; padding: 12px 16px;
//   backdrop-filter: blur(6px);
//   opacity: 0; transform: translateX(-16px);
//   animation: lgFeatIn .55s cubic-bezier(.22,1,.36,1) forwards;
//   transition: background .2s, transform .2s;
// }
// .lg-feat:hover { background: rgba(255,255,255,.14); transform: translateX(4px); }
// @keyframes lgFeatIn { to { opacity: 1; transform: translateX(0); } }
// .lg-feat-icon { font-size: 20px; flex-shrink: 0; }
// .lg-feat-txt  { font-size: 14px; color: rgba(255,255,255,.88); font-weight: 500; }

// /* trucks decoration */
// .lg-trucks { position: relative; z-index: 1; overflow: hidden; height: 90px; border-radius: 12px; }
// .lg-truck-svg { width: 100%; height: 90px; overflow: visible; }
// .lg-truck-anim1 { animation: lgTruckMove1 8s linear infinite; }
// .lg-truck-anim2 { animation: lgTruckMove2 12s linear infinite; }
// @keyframes lgTruckMove1 { 0%{transform:translateX(-160px)} 100%{transform:translateX(460px)} }
// @keyframes lgTruckMove2 { 0%{transform:translateX(460px) scaleX(-1)} 100%{transform:translateX(-200px) scaleX(-1)} }

// /* ── RIGHT PANEL ── */
// .lg-right {
//   position: relative; z-index: 1;
//   background: #f0f4ff;
//   display: flex; align-items: center; justify-content: center;
//   padding: 48px 32px; min-height: 100vh;
// }

// .lg-form-wrap { width: 100%; max-width: 420px; }

// /* step indicator */
// .lg-steps {
//   display: flex; align-items: center; gap: 0;
//   margin-bottom: 28px;
// }
// .lg-step { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
// .lg-step-dot {
//   width: 30px; height: 30px; border-radius: 50%;
//   display: flex; align-items: center; justify-content: center;
//   font-size: 12px; font-weight: 700;
//   border: 2px solid #e2e8f0; background: #fff; color: #94a3b8;
//   transition: all .3s cubic-bezier(.22,1,.36,1);
// }
// .lg-step-active .lg-step-dot {
//   background: linear-gradient(135deg,#2563eb,#4f46e5);
//   border-color: #2563eb; color: #fff;
//   box-shadow: 0 0 0 4px rgba(37,99,235,.15);
// }
// .lg-step-done .lg-step-dot {
//   background: #10b981; border-color: #10b981; color: #fff;
// }
// .lg-step span { font-size: 12px; font-weight: 600; color: #94a3b8; }
// .lg-step-active span { color: #2563eb; }
// .lg-step-done span   { color: #10b981; }
// .lg-step-line {
//   flex: 1; height: 2px; background: #e2e8f0; margin: 0 10px;
//   border-radius: 2px; overflow: hidden;
// }
// .lg-step-line-inner {
//   height: 100%; background: linear-gradient(90deg,#2563eb,#4f46e5);
//   transition: width .5s cubic-bezier(.22,1,.36,1);
//   border-radius: 2px;
// }

// /* card */
// .lg-card {
//   background: #fff; border: 1px solid #e2e8f0; border-radius: 24px;
//   overflow: hidden; box-shadow: 0 4px 24px rgba(15,23,42,.08);
//   transition: box-shadow .25s;
// }
// .lg-card:hover { box-shadow: 0 8px 40px rgba(15,23,42,.12); }

// .lg-in {
//   opacity: 0; transform: translateY(20px);
//   animation: lgUp .55s cubic-bezier(.22,1,.36,1) .05s forwards;
// }
// @keyframes lgUp { to { opacity: 1; transform: translateY(0); } }

// /* card header */
// .lg-card-hdr {
//   display: flex; align-items: center; gap: 14px;
//   padding: 22px 26px 18px; border-bottom: 1px solid #f1f5f9; background: #fafbff;
// }
// .lg-card-hdr-icon {
//   width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
//   background: #eff6ff; border: 1px solid #bfdbfe;
//   display: flex; align-items: center; justify-content: center; font-size: 22px;
//   transition: transform .3s cubic-bezier(.34,1.56,.64,1);
// }
// .lg-card:hover .lg-card-hdr-icon { transform: scale(1.08) rotate(-5deg); }
// .lg-card-title {
//   font-family: 'Fraunces', Georgia, serif;
//   font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -.02em;
// }
// .lg-card-sub { font-size: 12px; color: #94a3b8; margin-top: 3px; }

// /* error */
// .lg-error {
//   display: flex; align-items: flex-start; gap: 10px;
//   background: #fff1f2; border-left: 3px solid #ef4444;
//   padding: 12px 16px; margin: 16px 26px 0;
//   border-radius: 0 10px 10px 0;
//   animation: lgErrIn .3s cubic-bezier(.22,1,.36,1);
// }
// @keyframes lgErrIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
// .lg-error span { font-size: 16px; flex-shrink: 0; }
// .lg-error p { font-size: 13px; color: #be123c; font-weight: 500; line-height: 1.5; }

// /* form body */
// .lg-form { padding: 24px 26px; display: flex; flex-direction: column; gap: 18px; }

// .lg-field { display: flex; flex-direction: column; gap: 8px; }
// .lg-lbl {
//   font-family: 'Fraunces', Georgia, serif;
//   font-size: 11px; font-weight: 700; letter-spacing: .12em;
//   text-transform: uppercase; color: #64748b;
//   display: flex; align-items: center; gap: 6px;
// }

// /* phone input */
// .lg-phone-wrap { position: relative; display: flex; align-items: center; }
// .lg-phone-prefix {
//   position: absolute; left: 14px; font-size: 14px; font-weight: 700;
//   color: #0f172a; pointer-events: none; z-index: 1; letter-spacing: .02em;
// }
// .lg-phone-status {
//   position: absolute; right: 14px;
//   font-size: 11px; font-weight: 700; flex-shrink: 0;
// }
// .lg-status-checking { color: #94a3b8; display: flex; align-items: center; gap: 5px; }
// .lg-status-spin {
//   width: 10px; height: 10px; border-radius: 50%;
//   border: 1.5px solid #cbd5e1; border-top-color: #2563eb;
//   animation: lgSpin .7s linear infinite; display: inline-block;
// }
// @keyframes lgSpin { to { transform: rotate(360deg); } }
// .lg-status-error { color: #ef4444; }
// .lg-status-found  { color: #10b981; }

// .lg-inp {
//   width: 100%; padding: 14px 16px; padding-left: 48px;
//   background: #fff; border: 1.5px solid #cbd5e1; border-radius: 13px;
//   color: #0f172a; font-family: 'DM Sans', sans-serif;
//   font-size: 15px; font-weight: 600; outline: none;
//   transition: border-color .2s, box-shadow .2s, background .2s;
//   -webkit-appearance: none;
// }
// .lg-inp-phone { padding-right: 110px; }
// .lg-inp::placeholder { color: #94a3b8; font-weight: 400; }
// .lg-inp:focus {
//   border-color: #2563eb; background: #fafcff;
//   box-shadow: 0 0 0 4px rgba(37,99,235,.09);
// }
// .lg-inp-error   { border-color: #f87171 !important; }
// .lg-inp-error:focus { box-shadow: 0 0 0 4px rgba(239,68,68,.09) !important; }
// .lg-inp-success { border-color: #34d399 !important; }
// .lg-inp-success:focus { box-shadow: 0 0 0 4px rgba(52,211,153,.09) !important; }

// /* OTP input */
// .lg-inp-otp {
//   padding-left: 16px; text-align: center;
//   font-size: 28px; letter-spacing: .42em; font-weight: 800;
//   font-family: 'Fraunces', Georgia, serif;
//   border-color: #bfdbfe;
// }
// .lg-inp-otp:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,.09); }

// /* OTP progress dots */
// .lg-otp-dots { display: flex; gap: 8px; justify-content: center; margin-top: 10px; }
// .lg-otp-dot {
//   width: 10px; height: 10px; border-radius: 50%;
//   background: #e2e8f0; border: 1.5px solid #cbd5e1;
//   transition: all .2s cubic-bezier(.34,1.56,.64,1);
// }
// .lg-otp-dot-filled {
//   background: #2563eb; border-color: #2563eb;
//   transform: scale(1.25);
//   box-shadow: 0 0 0 3px rgba(37,99,235,.2);
// }

// /* hints */
// .lg-hint-error   { font-size: 12px; color: #ef4444; font-weight: 500; }
// .lg-hint-success { font-size: 12px; color: #10b981; font-weight: 500; }
// .lg-link { color: #2563eb; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }

// /* OTP info row */
// .lg-otp-info {
//   display: flex; align-items: center; justify-content: space-between;
//   font-size: 13px; color: #64748b; background: #f8fafc;
//   border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px;
//   gap: 8px; flex-wrap: wrap;
// }
// .lg-edit-btn {
//   background: none; border: none; cursor: pointer;
//   color: #2563eb; font-size: 12px; font-weight: 700;
//   font-family: 'DM Sans', sans-serif;
//   transition: color .15s;
// }
// .lg-edit-btn:hover { color: #1d4ed8; }

// /* submit button */
// .lg-btn {
//   width: 100%; padding: 15px 24px; border-radius: 14px; border: none; cursor: pointer;
//   font-family: 'Fraunces', Georgia, serif; font-size: 15px; font-weight: 700;
//   letter-spacing: .01em;
//   display: flex; align-items: center; justify-content: center; gap: 9px;
//   transition: all .25s cubic-bezier(.22,1,.36,1);
// }
// .lg-btn-active {
//   background: linear-gradient(135deg,#1d4ed8,#4f46e5); color: #fff;
//   box-shadow: 0 4px 18px rgba(37,99,235,.3);
// }
// .lg-btn-active:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(37,99,235,.4); }
// .lg-btn-active:active { transform: translateY(0); }
// .lg-btn-disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
// .lg-btn-spinner {
//   width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
//   border: 2.5px solid rgba(255,255,255,.25); border-top-color: #fff;
//   animation: lgSpin .7s linear infinite;
// }
// .lg-btn-arrow { transition: transform .2s; display: inline-block; }
// .lg-btn-active:hover .lg-btn-arrow { transform: translateX(5px); }

// /* signup link */
// .lg-signup-txt { font-size: 13px; color: #64748b; text-align: center; }

// /* footer note */
// .lg-footer-note {
//   text-align: center; font-size: 12px; color: #94a3b8;
//   margin-top: 18px; line-height: 1.6;
// }
// `;