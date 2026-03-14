// "use client";

// import { useAuth } from "@/context/AuthContext";
// import { connectToBackendServices } from "@/services/connectToBackend";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function ProfilePage() {
//   const { isAuthenticated, userName, userPhone, userId, updateUser, login } = useAuth();
//   const router = useRouter();

//   const [name, setName] = useState<string>(userName ?? "");
//   const [imageUrl, setImageUrl] = useState<string>("");

//   const [originalName, setOriginalName] = useState<string>(userName ?? "");
//   const [originalImageUrl, setOriginalImageUrl] = useState<string>("");

//   const [loading, setLoading] = useState<boolean>(false);

//   const hasChanges = name !== originalName || imageUrl !== originalImageUrl;

//   const fetchUserProfile = async () => {
//     setLoading(true);
//     try {
//       const response = await connectToBackendServices.getUserDetails();

//       if (response && response.success) {
//         const img = response.data.imageUrl ?? "";
//         const name = response.data.name ?? "";

//         setImageUrl(img);
//         setOriginalImageUrl(img);

//         setName(name);
//         setOriginalName(name);
//       }
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchUserProfile();
//     }
//   }, [isAuthenticated, userId]);

//   const updateUserProfile = async () => {
//   if (!hasChanges) return;

//   setLoading(true);

//   try {
//     const response = await connectToBackendServices.updateUserProfile({
//       name: name.trim(),
//       imageUrl: imageUrl.trim(),
//     });

//     if (response && response.success) {
//       setOriginalName(response.data.name);
//       setOriginalImageUrl(response.data.imageUrl);
      
//       // Grab the new token from the response and update the context & localStorage
//       if (response.data.newToken) {
//          login(response.data.newToken); 
//       }
      
//       router.push("/dashboard");
//     }
//   } catch (error) {
//     console.error("Error updating profile:", error);
//   }

//   setLoading(false);
// };

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-16 px-6 flex justify-center">
//       <div className="bg-white shadow-lg rounded-2xl w-full max-w-5xl p-10">

//         <h1 className="text-3xl font-bold mb-10 text-black">Profile Settings</h1>

//         <div className="grid md:grid-cols-2 gap-12">

//           {/* LEFT SIDE - DETAILS */}
//           <div className="space-y-6">

//             {/* Name */}
//             <div>
//               <label className="text-lg font-bold text-gray-600">
//                 Full Name
//               </label>

//               <input
//                 type="text"
//                 value={name.toUpperCase()}
//                 onChange={(e) => setName(e.target.value.toUpperCase())}
//                 className="text-black font-semibold mt-2 w-full border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black"
//               />
//             </div>

//             {/* Phone */}
//             <div>
//               <label className="text-lg font-semibold text-gray-600">
//                 Phone Number
//               </label>

//               <input
//                 value={userPhone ? `+91 ${userPhone.slice(3)}` : ""}
//                 disabled
//                 className="font-semibold mt-2 w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-900"
//               />
//             </div>

//             {/* Image URL */}
//             <div>
//               <label className="text-lg font-semibold text-gray-600">
//                 Profile Image URL
//               </label>

//               <input
//                 type="text"
//                 value={imageUrl}
//                 onChange={(e) => setImageUrl(e.target.value)}
//                 placeholder="https://..."
//                 className="text-black mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
//               />
//             </div>

//             {/* Save Button */}
//             <button
//               onClick={updateUserProfile}
//               disabled={!hasChanges || loading}
//               className={`w-full py-3 rounded-lg text-lg font-semibold transition
//               ${hasChanges
//                   ? "bg-black text-white hover:bg-gray-800"
//                   : "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 }`}
//             >
//               {loading ? "Saving..." : "Save Changes"}
//             </button>
//           </div>

//           {/* RIGHT SIDE - PROFILE IMAGE */}
//           <div className="flex flex-col items-center justify-center">

//             <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
//               {imageUrl ? (
//                 <img
//                   src={imageUrl}
//                   alt="Profile"
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="flex items-center justify-center w-full h-full text-gray-400 text-lg">
//                   No Image
//                 </div>
//               )}
//             </div>

//             <p className="mt-6 text-gray-500 text-sm text-center max-w-xs">
//               Add a profile image URL to update your avatar
//             </p>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useAuth } from "@/context/AuthContext";
import { connectToBackendServices } from "@/services/connectToBackend";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { isAuthenticated, userName, userPhone, userId, updateUser, login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState<string>(userName ?? "");
  const [imageUrl, setImageUrl] = useState<string>("");

  const [originalName, setOriginalName] = useState<string>(userName ?? "");
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const hasChanges = name !== originalName || imageUrl !== originalImageUrl;

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await connectToBackendServices.getUserDetails();

      if (response && response.success) {
        const img = response.data.imageUrl ?? "";
        const name = response.data.name ?? "";

        setImageUrl(img);
        setOriginalImageUrl(img);

        setName(name);
        setOriginalName(name);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, userId]);

  const updateUserProfile = async () => {
    if (!hasChanges) return;

    setLoading(true);

    try {
      const response = await connectToBackendServices.updateUserProfile({
        name: name.trim(),
        imageUrl: imageUrl.trim(),
      });

      if (response && response.success) {
        setOriginalName(response.data.name);
        setOriginalImageUrl(response.data.imageUrl);

        if (response.data.newToken) {
          login(response.data.newToken);
        }

        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }

    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="pf-root">
        <style>{CSS}</style>
        <div className="pf-notfound">
          <div className="pf-notfound-icon">🔒</div>
          <h1 className="pf-notfound-txt">404 - Page Not Found</h1>
        </div>
      </div>
    );
  }

  const initials = userName
    ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="pf-root">
      <style>{CSS}</style>

      {/* ── ambient bg ── */}
      <div className="pf-orb pf-orb1" />
      <div className="pf-orb pf-orb2" />
      <div className="pf-grid" />

      {/* ── Main ── */}
      <main className="pf-main">

        {/* ── Page header ── */}
        <div className="pf-page-hdr pf-in pf-d0">
          <p className="pf-eyebrow">Account ✦ Settings</p>
          <h1 className="pf-page-title">Profile <em>Settings</em></h1>
          <p className="pf-page-sub">Manage your personal information and profile picture.</p>
        </div>

        {/* ── Card ── */}
        <div className="pf-card pf-in pf-d1">

          {/* card header */}
          <div className="pf-card-hdr">
            <div className="pf-card-hdr-icon">⚙️</div>
            <div>
              <p className="pf-card-ttl">Personal Information</p>
              <p className="pf-card-sub">Update your name and profile image</p>
            </div>
            {hasChanges && (
              <div className="pf-unsaved-badge">
                <span className="pf-unsaved-dot" />
                Unsaved changes
              </div>
            )}
          </div>

          <div className="pf-card-body">

            {/* ── LEFT: form fields ── */}
            <div className="pf-fields">

              {/* sec label */}
              <div className="pf-sec-lbl"><span>01</span>&nbsp; Identity</div>

              {/* Full Name */}
              <div className="pf-field pf-in pf-d2">
                <label className="pf-lbl">
                  <span className="pf-lbl-icon">🪪</span>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name.toUpperCase()}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="pf-inp"
                  placeholder="YOUR FULL NAME"
                />
              </div>

              {/* Phone */}
              <div className="pf-field pf-in pf-d3">
                <label className="pf-lbl">
                  <span className="pf-lbl-icon">📱</span>
                  Phone Number
                  <span className="pf-locked-badge">🔒 Locked</span>
                </label>
                <input
                  value={userPhone ? `+91 ${userPhone.slice(3)}` : ""}
                  disabled
                  className="pf-inp pf-inp-disabled"
                />
              </div>

              {/* sec label */}
              <div className="pf-sec-lbl" style={{ marginTop: 8 }}><span>02</span>&nbsp; Avatar</div>

              {/* Image URL */}
              <div className="pf-field pf-in pf-d4">
                <label className="pf-lbl">
                  <span className="pf-lbl-icon">🖼️</span>
                  Profile Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="pf-inp"
                />
                {imageUrl && (
                  <p className="pf-url-hint">✅ Image URL set — preview on the right</p>
                )}
              </div>

              {/* Save button */}
              <div className="pf-in pf-d5">
                <button
                  onClick={updateUserProfile}
                  disabled={!hasChanges || loading}
                  className={`pf-save-btn ${hasChanges && !loading ? 'pf-save-btn--active' : 'pf-save-btn--disabled'}`}
                >
                  {loading ? (
                    <>
                      <div className="pf-btn-spinner" />
                      Saving changes…
                    </>
                  ) : hasChanges ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Save Changes
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      No Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── RIGHT: avatar preview ── */}
            <div className="pf-avatar-side pf-in pf-d2">
              <div className="pf-avatar-wrap">
                {/* ring decoration */}
                <div className="pf-avatar-ring" />
                <div className="pf-avatar-ring pf-avatar-ring2" />

                <div className="pf-avatar-circle">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Profile"
                      className="pf-avatar-img"
                    />
                  ) : (
                    <div className="pf-avatar-placeholder">
                      <span className="pf-avatar-initials">{initials}</span>
                    </div>
                  )}
                </div>

                {/* online indicator */}
                <div className="pf-avatar-status" />
              </div>

              <p className="pf-avatar-name">{userName || 'Your Name'}</p>
              <p className="pf-avatar-phone">
                {userPhone ? `+91 ${userPhone.slice(3)}` : ''}
              </p>

              {/* info pills */}
              <div className="pf-info-pills">
                <div className="pf-info-pill">
                  <span>🆔</span>
                  <span className="pf-pill-val">{userId ? userId.slice(-8).toUpperCase() : '—'}</span>
                </div>
                <div className="pf-info-pill pf-info-pill-green">
                  <span>✅</span>
                  <span className="pf-pill-val">Verified</span>
                </div>
              </div>

              <p className="pf-avatar-hint">Add a URL above to update your avatar</p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800;9..144,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

/* ── root ── */
.pf-root {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'DM Sans', sans-serif;
  color: #0f172a;
  overflow-x: hidden;
  position: relative;
}

/* ── bg ── */
.pf-orb {
  position: fixed; border-radius: 50%;
  pointer-events: none; z-index: 0;
  animation: pfOrbFloat 8s ease-in-out infinite;
}
.pf-orb1 {
  top: -140px; right: -100px; width: 620px; height: 620px;
  background: radial-gradient(circle, rgba(37,99,235,.08), transparent 68%);
}
.pf-orb2 {
  bottom: 40px; left: -120px; width: 480px; height: 480px;
  background: radial-gradient(circle, rgba(79,70,229,.06), transparent 68%);
  animation-delay: -4s;
}
@keyframes pfOrbFloat {
  0%,100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-20px) scale(1.03); }
}
.pf-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: radial-gradient(rgba(37,99,235,.055) 1px, transparent 1px);
  background-size: 28px 28px;
}

/* ── main ── */
.pf-main {
  position: relative; z-index: 1;
  max-width: 860px; margin: 0 auto;
  padding: 88px 24px 80px;
}

/* ── stagger fade-up ── */
.pf-in {
  opacity: 0; transform: translateY(22px);
  animation: pfUp .58s cubic-bezier(.22,1,.36,1) forwards;
}
.pf-d0 { animation-delay: .05s; }
.pf-d1 { animation-delay: .13s; }
.pf-d2 { animation-delay: .21s; }
.pf-d3 { animation-delay: .28s; }
.pf-d4 { animation-delay: .35s; }
.pf-d5 { animation-delay: .42s; }
@keyframes pfUp { to { opacity: 1; transform: translateY(0); } }

/* ── page header ── */
.pf-page-hdr { margin-bottom: 28px; }
.pf-eyebrow  {
  font-size: 11px; font-weight: 700; letter-spacing: .16em;
  text-transform: uppercase; color: #2563eb;
  margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px;
}
.pf-page-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 44px; font-weight: 900; color: #0f172a;
  letter-spacing: -.04em; line-height: 1.0; margin-bottom: 10px;
}
.pf-page-title em { font-style: normal; color: #2563eb; }
.pf-page-sub { font-size: 15px; color: #64748b; font-weight: 400; line-height: 1.6; }

/* ── card ── */
.pf-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 24px;
  overflow: hidden; box-shadow: 0 2px 12px rgba(15,23,42,.06);
  transition: box-shadow .25s;
}
.pf-card:hover { box-shadow: 0 8px 32px rgba(15,23,42,.1); }

.pf-card-hdr {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 28px; border-bottom: 1px solid #f1f5f9; background: #fafbff;
}
.pf-card-hdr-icon {
  width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
  background: #eff6ff; border: 1px solid #bfdbfe;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
  animation: pfSpin 12s linear infinite;
}
@keyframes pfSpin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
.pf-card-ttl { font-family: 'Fraunces', Georgia, serif; font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.pf-card-sub { font-size: 12px; color: #94a3b8; }
.pf-unsaved-badge {
  margin-left: auto; display: flex; align-items: center; gap: 6px;
  background: #fef3c7; border: 1px solid #fde68a; color: #b45309;
  font-size: 11px; font-weight: 700; padding: 5px 13px; border-radius: 100px;
  white-space: nowrap;
  animation: pfBadgePop .3s cubic-bezier(.34,1.56,.64,1);
}
@keyframes pfBadgePop { from{transform:scale(.6);opacity:0} to{transform:scale(1);opacity:1} }
.pf-unsaved-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #f59e0b;
  animation: pfDotPulse 1.6s ease-in-out infinite;
}
@keyframes pfDotPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.6)} }

/* ── card body ── */
.pf-card-body {
  display: grid; grid-template-columns: 1fr 340px;
  gap: 0;
}
@media(max-width: 700px) {
  .pf-card-body { grid-template-columns: 1fr; }
  .pf-avatar-side { border-left: none !important; border-top: 1px solid #f1f5f9; }
}

/* ── fields (left) ── */
.pf-fields { padding: 28px; display: flex; flex-direction: column; gap: 20px; }

.pf-sec-lbl {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 10px; font-weight: 700; letter-spacing: .18em;
  text-transform: uppercase; color: #94a3b8;
  display: flex; align-items: center; gap: 10px; margin-bottom: -6px;
}
.pf-sec-lbl::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }

.pf-field { display: flex; flex-direction: column; gap: 8px; }

.pf-lbl {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 11px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: #64748b;
  display: flex; align-items: center; gap: 6px;
}
.pf-lbl-icon { font-size: 14px; }
.pf-locked-badge {
  margin-left: auto; font-size: 10px; font-weight: 600;
  background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0;
  padding: 2px 8px; border-radius: 100px; letter-spacing: .04em;
}

.pf-inp {
  width: 100%; padding: 13px 16px;
  background: #fff; border: 1.5px solid #cbd5e1; border-radius: 13px;
  color: #0f172a; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600; outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
  -webkit-appearance: none;
}
.pf-inp::placeholder { color: #94a3b8; font-weight: 400; }
.pf-inp:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37,99,235,.09);
  background: #fafcff;
}
.pf-inp-disabled {
  background: #f8fafc; color: #64748b; cursor: not-allowed;
  border-color: #e2e8f0;
}
.pf-url-hint {
  font-size: 12px; color: #16a34a; font-weight: 500;
  display: flex; align-items: center; gap: 5px;
  animation: pfUp .3s ease forwards;
}

/* ── save button ── */
.pf-save-btn {
  width: 100%; padding: 15px 24px; border-radius: 14px;
  border: none; cursor: pointer;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 15px; font-weight: 700; letter-spacing: .01em;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  transition: all .25s cubic-bezier(.22,1,.36,1);
}
.pf-save-btn--active {
  background: linear-gradient(135deg,#1d4ed8,#4f46e5); color: #fff;
  box-shadow: 0 4px 18px rgba(37,99,235,.30);
}
.pf-save-btn--active:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(37,99,235,.40);
}
.pf-save-btn--active:active { transform: translateY(0); }
.pf-save-btn--disabled {
  background: #f1f5f9; color: #94a3b8; cursor: not-allowed;
  box-shadow: none;
}
.pf-btn-spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,.25);
  border-top-color: #fff;
  animation: pfSpinFast .7s linear infinite; flex-shrink: 0;
}
@keyframes pfSpinFast { to { transform: rotate(360deg); } }

/* ── avatar side (right) ── */
.pf-avatar-side {
  border-left: 1px solid #f1f5f9;
  background: linear-gradient(180deg, #fafbff 0%, #f0f4ff 100%);
  padding: 36px 28px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
}

.pf-avatar-wrap {
  position: relative;
  width: 160px; height: 160px;
  display: flex; align-items: center; justify-content: center;
}
.pf-avatar-ring {
  position: absolute; inset: -10px; border-radius: 50%;
  border: 2px dashed rgba(37,99,235,.18);
  animation: pfRingRotate 12s linear infinite;
}
.pf-avatar-ring2 {
  inset: -20px; border-color: rgba(79,70,229,.1);
  animation-duration: 18s; animation-direction: reverse;
}
@keyframes pfRingRotate { to { transform: rotate(360deg); } }

.pf-avatar-circle {
  width: 140px; height: 140px; border-radius: 50%; overflow: hidden;
  border: 4px solid #fff;
  box-shadow: 0 8px 32px rgba(37,99,235,.18), 0 2px 8px rgba(15,23,42,.1);
  transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;
  animation: pfAvatarIn .6s cubic-bezier(.34,1.56,.64,1) .2s both;
}
@keyframes pfAvatarIn { from{transform:scale(.7) rotate(-8deg);opacity:0} to{transform:scale(1) rotate(0);opacity:1} }
.pf-avatar-circle:hover {
  transform: scale(1.06);
  box-shadow: 0 14px 40px rgba(37,99,235,.25), 0 4px 12px rgba(15,23,42,.12);
}
.pf-avatar-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .4s cubic-bezier(.22,1,.36,1);
}
.pf-avatar-circle:hover .pf-avatar-img { transform: scale(1.07); }
.pf-avatar-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(135deg,#eff6ff,#e0e7ff);
  display: flex; align-items: center; justify-content: center;
}
.pf-avatar-initials {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 48px; font-weight: 900; color: #2563eb; letter-spacing: -.02em;
}
.pf-avatar-status {
  position: absolute; bottom: 8px; right: 8px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #10b981; border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(16,185,129,.4);
  animation: pfStatusPulse 2.5s ease-in-out infinite;
}
@keyframes pfStatusPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
  50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
}

.pf-avatar-name {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 18px; font-weight: 800; color: #0f172a;
  letter-spacing: -.02em; text-align: center; margin-top: 4px;
}
.pf-avatar-phone { font-size: 13px; color: #64748b; font-weight: 500; }

.pf-info-pills { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 4px; }
.pf-info-pill {
  display: flex; align-items: center; gap: 5px;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 100px;
  padding: 5px 12px; font-size: 11px; color: #64748b;
  box-shadow: 0 1px 3px rgba(15,23,42,.05);
}
.pf-info-pill-green { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.pf-pill-val { font-weight: 700; font-size: 11px; }

.pf-avatar-hint {
  font-size: 12px; color: #94a3b8; text-align: center;
  max-width: 200px; line-height: 1.5;
}

/* ── not found ── */
.pf-notfound {
  position: fixed; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
}
.pf-notfound-icon { font-size: 40px; }
.pf-notfound-txt  { font-family: 'Fraunces', Georgia, serif; font-size: 22px; font-weight: 800; color: #0f172a; }
`;