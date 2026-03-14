// "use client";

// import { useAuth } from "@/context/AuthContext";
// import { connectToBackendServices } from "@/services/connectToBackend";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import toast from "react-hot-toast";

// // ── Vehicle definitions ──────────────────────────────────────────────────────
// export const VEHICLES = [
//   {
//     id: "mini-3w",
//     name: "Mini 3W",
//     capacity: "50",
//     dimensions: { L: "4.7 ft", W: "3.8 ft", H: "3.6 ft" },
//     icon: "🛺",
//   },
//   {
//     id: "3-wheeler",
//     name: "3 Wheeler",
//     capacity: "500",
//     dimensions: { L: "6 ft", W: "5 ft", H: "4.6 ft" },
//     icon: "🚜",
//   },
//   {
//     id: "tata-ace",
//     name: "Tata Ace",
//     capacity: "750",
//     dimensions: { L: "7 ft", W: "5.5 ft", H: "5 ft" },
//     icon: "🚐",
//   },
//   {
//     id: "pickup-8ft",
//     name: "Pickup 8ft",
//     capacity: "1200",
//     dimensions: { L: "8 ft", W: "6 ft", H: "5.5 ft" },
//     icon: "🚚",
//   },
//   {
//     id: "pickup-1-7ton",
//     name: "Pickup 1.7 Ton",
//     capacity: "1700",
//     dimensions: { L: "10 ft", W: "6.5 ft", H: "6 ft" },
//     icon: "🚛",
//   },
//   {
//     id: "14ft-open",
//     name: "14ft (Open)",
//     capacity: "3500",
//     dimensions: { L: "14 ft", W: "7 ft", H: "—" },
//     icon: "🚛",
//   },
//   {
//     id: "14ft-closed",
//     name: "14ft (Closed)",
//     capacity: "3500",
//     dimensions: { L: "14 ft", W: "7 ft", H: "7 ft" },
//     icon: "🚛",
//   },
//   {
//     id: "tata-17ft",
//     name: "Tata 17ft",
//     capacity: "4000",
//     dimensions: { L: "17 ft", W: "7.5 ft", H: "7.5 ft" },
//     icon: "🚛",
//   },
// ]

// type VehicleId = (typeof VEHICLES)[number]["id"];

// // ── Form state ───────────────────────────────────────────────────────────────
// interface FormData {
//   vehicleId: VehicleId | "";
//   pickupLocation: string;
//   dropoffLocation: string;
//   pickupDate: string;
//   pickupTime: string;
// }

// // ── Component ────────────────────────────────────────────────────────────────
// export default function NewMovePage() {
//   const { isAuthenticated } = useAuth();
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   const [formData, setFormData] = useState<FormData>({
//     vehicleId: "",
//     pickupLocation: "",
//     dropoffLocation: "",
//     pickupDate: "",
//     pickupTime: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleVehicleSelect = (id: VehicleId) => {
//     setFormData((prev) => ({ ...prev, vehicleId: id }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isLoading) return;

//     try {
//       setIsLoading(true);

//       if (!formData.vehicleId) throw new Error("Please select a vehicle");
//       if (!formData.pickupLocation || !formData.dropoffLocation)
//         throw new Error("Please fill all required fields");

//       const vehicle = VEHICLES.find((v) => v.id === formData.vehicleId)!;

//       const payload = {
//         vehicleId: formData.vehicleId,
//         weight: vehicle.capacity,
//         pickupLocation: formData.pickupLocation.trim(),
//         dropoffLocation: formData.dropoffLocation.trim(),
//         pickupDate: formData.pickupDate,
//         pickupTime: formData.pickupTime,
//       };

//       const response = await connectToBackendServices.createOrder(payload);

//       if (!response?.success) {
//         throw new Error(response?.message || "Failed to create move request");
//       }

//       toast.success("Move created successfully");
//       router.push("/dashboard");
//     } catch (error: any) {
//       console.error("Create order error:", error);
//       alert(error.message || "Something went wrong while creating the move");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center">
//         <p className="text-slate-500 font-medium">Not authorized.</p>
//       </div>
//     );
//   }

//   const inputClass =
//     "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition";

//   const labelClass =
//     "block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2";

//   return (
//     <div className="min-h-screen bg-[#f5f5f3] font-sans">
//       <main className="max-w-2xl mx-auto px-6 py-10">

//         {/* ── PAGE TITLE ── */}
//         <div className="mb-8">
//           <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
//             New Shipment
//           </p>
//           <h1 className="text-3xl font-bold text-slate-900">Create Pickup</h1>
//           <p className="text-sm text-slate-400 mt-1">
//             Fill in the details below to schedule a new pickup.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">

//           {/* ── VEHICLE SELECTOR ── */}
//           <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100">
//               <p className="text-sm font-bold text-slate-900">Select Vehicle</p>
//             </div>

//             <div className="divide-y divide-slate-50">
//               {VEHICLES.map((vehicle) => {
//                 const isSelected = formData.vehicleId === vehicle.id;
//                 return (
//                   <button
//                     key={vehicle.id}
//                     type="button"
//                     onClick={() => handleVehicleSelect(vehicle.id)}
//                     className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all ${
//                       isSelected
//                         ? "bg-violet-50 border-l-4 border-l-violet-600"
//                         : "hover:bg-slate-50 border-l-4 border-l-transparent"
//                     }`}
//                   >
//                     {/* Vehicle icon */}
//                     <div
//                       className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
//                         isSelected ? "bg-violet-100" : "bg-slate-100"
//                       }`}
//                     >
//                       {vehicle.icon}
//                     </div>

//                     {/* Info */}
//                     <div className="flex-1 min-w-0">
//                       <p
//                         className={`text-sm font-bold ${
//                           isSelected ? "text-violet-700" : "text-slate-900"
//                         }`}
//                       >
//                         {vehicle.name}
//                       </p>

//                       <p className="text-xs text-slate-400 font-medium mt-0.5">
//                         {vehicle.capacity}
//                       </p>

//                       {/* Dimensions */}
//                       <div className="flex flex-wrap gap-2 mt-2">
//                         {(
//                           [
//                             ["L", vehicle.dimensions.L],
//                             ["W", vehicle.dimensions.W],
//                             ["H", vehicle.dimensions.H],
//                           ] as [string, string][]
//                         ).map(([label, val]) => (
//                           <span
//                             key={label}
//                             className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
//                               isSelected
//                                 ? "bg-violet-100 text-violet-700"
//                                 : "bg-slate-100 text-slate-500"
//                             }`}
//                           >
//                             <span className="opacity-60">{label}</span>
//                             {val}
//                           </span>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Radio indicator */}
//                     <div
//                       className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
//                         isSelected
//                           ? "border-violet-600 bg-violet-600"
//                           : "border-slate-300"
//                       }`}
//                     >
//                       {isSelected && (
//                         <div className="w-1.5 h-1.5 rounded-full bg-white" />
//                       )}
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* ── ROUTE ── */}
//           <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100">
//               <p className="text-sm font-bold text-slate-900">Route</p>
//             </div>

//             <div className="px-6 py-5 space-y-5">
//               <div className="flex gap-4 items-stretch">
//                 {/* Timeline dots */}
//                 <div className="flex flex-col items-center pt-9 gap-1 flex-shrink-0">
//                   <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
//                   <div className="w-px flex-1 bg-slate-200 min-h-[2.5rem]" />
//                   <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-900" />
//                 </div>

//                 <div className="flex flex-col gap-5 flex-1 min-w-0">
//                   <div>
//                     <label className={labelClass}>Pickup Location</label>
//                     <input
//                       type="text"
//                       name="pickupLocation"
//                       required
//                       value={formData.pickupLocation}
//                       onChange={handleChange}
//                       placeholder="Address or landmark"
//                       className={inputClass}
//                     />
//                   </div>

//                   <div>
//                     <label className={labelClass}>Dropoff Location</label>
//                     <input
//                       type="text"
//                       name="dropoffLocation"
//                       required
//                       value={formData.dropoffLocation}
//                       onChange={handleChange}
//                       placeholder="Address or landmark"
//                       className={inputClass}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── SCHEDULE ── */}
//           <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100">
//               <p className="text-sm font-bold text-slate-900">Schedule</p>
//             </div>

//             <div className="px-6 py-5 grid sm:grid-cols-2 gap-5">
//               <div>
//                 <label className={labelClass}>Pickup Date</label>
//                 <input
//                   type="date"
//                   name="pickupDate"
//                   required
//                   value={formData.pickupDate}
//                   onChange={handleChange}
//                   className={inputClass}
//                 />
//               </div>

//               <div>
//                 <label className={labelClass}>Pickup Time</label>
//                 <input
//                   type="time"
//                   name="pickupTime"
//                   required
//                   value={formData.pickupTime}
//                   onChange={handleChange}
//                   className={inputClass}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* ── SUBMIT ── */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all flex justify-center items-center gap-2 ${
//               isLoading
//                 ? "bg-slate-200 text-slate-400 cursor-not-allowed"
//                 : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md"
//             }`}
//           >
//             {isLoading ? (
//               <>
//                 <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
//                 Saving…
//               </>
//             ) : (
//               <>
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                   strokeWidth={2.5}
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M12 4v16m8-8H4"
//                   />
//                 </svg>
//                 Create Pickup
//               </>
//             )}
//           </button>
//         </form>
//       </main>
//     </div>
//   );
// }

"use client";

import { useAuth } from "@/context/AuthContext";
import { connectToBackendServices } from "@/services/connectToBackend";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export const VEHICLES = [
  { id: "mini-3w",       name: "Mini 3W",       capacity: "50",   dimensions: { L: "4.7 ft", W: "3.8 ft", H: "3.6 ft" }, icon: "🛺" },
  { id: "3-wheeler",     name: "3 Wheeler",      capacity: "500",  dimensions: { L: "6 ft",   W: "5 ft",   H: "4.6 ft" }, icon: "🚜" },
  { id: "tata-ace",      name: "Tata Ace",       capacity: "750",  dimensions: { L: "7 ft",   W: "5.5 ft", H: "5 ft"   }, icon: "🚐" },
  { id: "pickup-8ft",    name: "Pickup 8ft",     capacity: "1200", dimensions: { L: "8 ft",   W: "6 ft",   H: "5.5 ft" }, icon: "🚚" },
  { id: "pickup-1-7ton", name: "Pickup 1.7 Ton", capacity: "1700", dimensions: { L: "10 ft",  W: "6.5 ft", H: "6 ft"   }, icon: "🚛" },
  { id: "14ft-open",     name: "14ft Open",      capacity: "3500", dimensions: { L: "14 ft",  W: "7 ft",   H: "—"      }, icon: "🚛" },
  { id: "14ft-closed",   name: "14ft Closed",    capacity: "3500", dimensions: { L: "14 ft",  W: "7 ft",   H: "7 ft"   }, icon: "🚛" },
  { id: "tata-17ft",     name: "Tata 17ft",      capacity: "4000", dimensions: { L: "17 ft",  W: "7.5 ft", H: "7.5 ft" }, icon: "🚛" },
];

// ── Three.js Realistic 3D Fleet ─────────────────────────────────────────────
function AnimatedFleet() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => initScene(el);
    document.head.appendChild(script);

    function initScene(container: HTMLElement) {
      const W = window.innerWidth;
      const H = 130;
      const THREE = (window as any).THREE;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const cam = new THREE.OrthographicCamera(-W/2, W/2, H/2, -H/2, 0.1, 2000);
      cam.position.set(0, 20, 600);
      cam.lookAt(0, 0, 0);

      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambient);
      const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
      sun.position.set(200, 400, 300);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      scene.add(sun);
      const fill = new THREE.DirectionalLight(0xd0e8ff, 0.4);
      fill.position.set(-200, 100, -100);
      scene.add(fill);

      const roadGeo = new THREE.PlaneGeometry(W * 2, 50);
      const roadMat = new THREE.MeshLambertMaterial({ color: 0x4b5563 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.y = -18;
      road.receiveShadow = true;
      scene.add(road);

      for (let i = -W; i < W; i += 90) {
        const dashG = new THREE.PlaneGeometry(50, 3);
        const dashM = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
        const dash = new THREE.Mesh(dashG, dashM);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(i, -17.8, 0);
        scene.add(dash);
      }

      [-22, 22].forEach(z => {
        const lineG = new THREE.PlaneGeometry(W * 2, 1.5);
        const lineM = new THREE.MeshBasicMaterial({ color: 0xf3f4f6, opacity: 0.6, transparent: true });
        const line = new THREE.Mesh(lineG, lineM);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, -17.9, z);
        scene.add(line);
      });

      function buildTruck(cfg: {
        bodyColor: number; cabinColor: number; darkColor: number;
        glassColor: number; scale: number;
      }) {
        const group = new THREE.Group();
        const sc = cfg.scale;

        const bodyMat   = new THREE.MeshLambertMaterial({ color: cfg.bodyColor });
        const cabinMat  = new THREE.MeshLambertMaterial({ color: cfg.cabinColor });
        const darkMat   = new THREE.MeshLambertMaterial({ color: cfg.darkColor });
        const glassMat  = new THREE.MeshLambertMaterial({ color: cfg.glassColor, transparent: true, opacity: 0.8 });
        const blackMat  = new THREE.MeshLambertMaterial({ color: 0x1c1c1c });
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
        const lightMat  = new THREE.MeshLambertMaterial({ color: 0xfffde7, emissive: 0xfff176, emissiveIntensity: 0.8 });
        const redMat    = new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.4 });

        const cargoW = 28 * sc, cargoH = 14 * sc, cargoD = 16 * sc;
        const cargoGeo = new THREE.BoxGeometry(cargoW, cargoH, cargoD);
        const cargo = new THREE.Mesh(cargoGeo, bodyMat);
        cargo.position.set(-8 * sc, 2 * sc, 0);
        cargo.castShadow = true;
        group.add(cargo);

        const roofLipGeo = new THREE.BoxGeometry(cargoW + 0.5, 0.8 * sc, cargoD + 0.5);
        const roofLip = new THREE.Mesh(roofLipGeo, darkMat);
        roofLip.position.set(-8 * sc, (cargoH / 2 + 0.4) * sc, 0);
        group.add(roofLip);

        [-4, 0, 4].forEach(xOff => {
          const ribGeo = new THREE.BoxGeometry(0.6 * sc, cargoH * 0.85, cargoD + 0.2);
          const rib = new THREE.Mesh(ribGeo, darkMat);
          rib.position.set((-8 + xOff) * sc, 2 * sc, 0);
          group.add(rib);
        });

        const rearDoorGeo = new THREE.BoxGeometry(0.4 * sc, cargoH - 0.5, cargoD - 0.5);
        const rearDoor = new THREE.Mesh(rearDoorGeo, darkMat);
        rearDoor.position.set((-8 - cargoW / 2) * sc, 2 * sc, 0);
        group.add(rearDoor);

        const cabW = 10 * sc, cabH = 15 * sc, cabD = 16 * sc;
        const cabGeo = new THREE.BoxGeometry(cabW, cabH, cabD);
        const cabin = new THREE.Mesh(cabGeo, cabinMat);
        cabin.position.set((cargoW / 2 + cabW / 2 - 14) * sc, 4 * sc, 0);
        cabin.castShadow = true;
        group.add(cabin);

        const cabX = (cargoW / 2 + cabW / 2 - 14) * sc;

        const roofGeo = new THREE.BoxGeometry(cabW - 0.5, 1.5 * sc, cabD - 0.5);
        const roof = new THREE.Mesh(roofGeo, darkMat);
        roof.position.set(cabX, (4 + cabH / 2 + 0.75) * sc, 0);
        group.add(roof);

        const windGeo = new THREE.BoxGeometry(0.4 * sc, cabH * 0.45, cabD * 0.68);
        const wind = new THREE.Mesh(windGeo, glassMat);
        wind.position.set(cabX + cabW / 2 * 0.9, (4 + 1.5) * sc, 0);
        group.add(wind);

        const sideWinGeo = new THREE.BoxGeometry(cabW * 0.45, cabH * 0.32, 0.3 * sc);
        const sideWinL = new THREE.Mesh(sideWinGeo, glassMat);
        sideWinL.position.set(cabX - 1 * sc, (4 + 2) * sc, cabD / 2 + 0.1);
        group.add(sideWinL);
        const sideWinR = new THREE.Mesh(sideWinGeo, glassMat);
        sideWinR.position.set(cabX - 1 * sc, (4 + 2) * sc, -cabD / 2 - 0.1);
        group.add(sideWinR);

        const hlGeo = new THREE.BoxGeometry(0.5 * sc, 2 * sc, 2.5 * sc);
        [-3, 3].forEach(z => {
          const hl = new THREE.Mesh(hlGeo, lightMat);
          hl.position.set(cabX + cabW / 2, (4 - 2.5) * sc, z * sc);
          group.add(hl);
        });

        const tlGeo = new THREE.BoxGeometry(0.4 * sc, 2 * sc, 2 * sc);
        [-4, 4].forEach(z => {
          const tl = new THREE.Mesh(tlGeo, redMat);
          tl.position.set((-8 - cargoW / 2 - 0.1) * sc, 2 * sc, z * sc);
          group.add(tl);
        });

        const bumperGeo = new THREE.BoxGeometry(1.2 * sc, 3 * sc, cabD + 0.5);
        const bumper = new THREE.Mesh(bumperGeo, chromeMat);
        bumper.position.set(cabX + cabW / 2 + 0.5, (4 - 4) * sc, 0);
        group.add(bumper);

        const exGeo = new THREE.CylinderGeometry(0.6 * sc, 0.6 * sc, 8 * sc);
        const ex = new THREE.Mesh(exGeo, darkMat);
        ex.position.set(cabX - 2 * sc, (4 + cabH / 2 + 3) * sc, cabD / 2 - 1);
        group.add(ex);

        const frameGeo = new THREE.BoxGeometry((cargoW + cabW - 10) * sc, 2 * sc, 3 * sc);
        const frameL = new THREE.Mesh(frameGeo, blackMat);
        frameL.position.set(-8 * sc, (-cargoH / 2 - 1) * sc, 5 * sc);
        group.add(frameL);
        const frameR = frameL.clone();
        frameR.position.z = -5 * sc;
        group.add(frameR);

        const wheelRadius = 5 * sc;
        const wheelThick = 3.5 * sc;
        const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThick, 18);
        const tireMat   = new THREE.MeshLambertMaterial({ color: 0x111827 });
        const rimGeoI   = new THREE.CylinderGeometry(wheelRadius * 0.55, wheelRadius * 0.55, wheelThick + 0.2, 6);
        const rimMat    = new THREE.MeshLambertMaterial({ color: 0x9ca3af });
        const hubGeo    = new THREE.CylinderGeometry(wheelRadius * 0.18, wheelRadius * 0.18, wheelThick + 0.4, 12);
        const hubMat    = new THREE.MeshLambertMaterial({ color: 0xd1d5db });

        const wheelPositions = [
          { x: cabX + 3 * sc,   z:  9 * sc },
          { x: cabX + 3 * sc,   z: -9 * sc },
          { x: (-8 - 6) * sc,   z:  9 * sc },
          { x: (-8 - 6) * sc,   z: -9 * sc },
          { x: (-8 + 1) * sc,   z:  9 * sc },
          { x: (-8 + 1) * sc,   z: -9 * sc },
        ];

        const wheelGroups: any[] = [];
        wheelPositions.forEach(pos => {
          const wg = new THREE.Group();
          const tire = new THREE.Mesh(wheelGeo, tireMat);
          tire.rotation.x = Math.PI / 2;
          const rim  = new THREE.Mesh(rimGeoI, rimMat);
          rim.rotation.x = Math.PI / 2;
          const hub  = new THREE.Mesh(hubGeo, hubMat);
          hub.rotation.x = Math.PI / 2;
          wg.add(tire); wg.add(rim); wg.add(hub);
          wg.position.set(pos.x, (-cargoH / 2 - 1) * sc, pos.z);
          wg.castShadow = true;
          group.add(wg);
          wheelGroups.push(wg);
        });

        const shadowGeo = new THREE.CircleGeometry((cargoW / 2 + 2) * sc, 24);
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = (-cargoH / 2 - wheelRadius - 0.5) * sc;
        group.add(shadow);

        return { group, wheelGroups };
      }

      const fleetDefs = [
        { bodyColor: 0x2563eb, cabinColor: 0x1d4ed8, darkColor: 0x1e3a8a, glassColor: 0x93c5fd, scale: 1.0,  spd: 2.2,  x: -800, y: -3 },
        { bodyColor: 0x16a34a, cabinColor: 0x15803d, darkColor: 0x14532d, glassColor: 0x86efac, scale: 0.88, spd: 1.5,  x: -400, y: -5 },
        { bodyColor: 0xea580c, cabinColor: 0xc2410c, darkColor: 0x7c2d12, glassColor: 0xfed7aa, scale: 0.94, spd: 3.0,  x: -1200, y:-4 },
        { bodyColor: 0x7c3aed, cabinColor: 0x6d28d9, darkColor: 0x4c1d95, glassColor: 0xddd6fe, scale: 0.78, spd: 1.9,  x: -600, y: -6 },
        { bodyColor: 0xd97706, cabinColor: 0xb45309, darkColor: 0x78350f, glassColor: 0xfde68a, scale: 0.96, spd: 2.6,  x: -1600, y:-3 },
      ];

      const fleet = fleetDefs.map(def => {
        const { group, wheelGroups } = buildTruck(def);
        const wheelR = 5 * def.scale;
        const cargoH = 14 * def.scale;
        group.position.set(def.x, def.y + (-18 + wheelR + cargoH / 2 + 1), 0);
        scene.add(group);
        return { group, wheelGroups, spd: def.spd, scale: def.scale };
      });

      const dashes = scene.children.filter(c =>
        c instanceof THREE.Mesh &&
        (c as any).geometry instanceof THREE.PlaneGeometry &&
        (c as any).material instanceof THREE.MeshBasicMaterial &&
        ((c as any).material as any).color.getHex() === 0xffffff
      );

      let animId: number;
      const roadSpeed = 1.8;

      function animate() {
        animId = requestAnimationFrame(animate);

        fleet.forEach(f => {
          f.group.position.x += f.spd;
          if (f.group.position.x > W + 300) {
            f.group.position.x = -W - 300;
          }
          const wheelRot = f.spd / (5 * f.scale) * 0.15;
          f.wheelGroups.forEach((wg: any) => {
            wg.rotation.y += wheelRot;
          });
          f.group.position.y += Math.sin(Date.now() * 0.005 + f.spd) * 0.03;
        });

        dashes.forEach((d) => {
          d.position.x += roadSpeed;
          if (d.position.x > W) d.position.x -= W * 2;
        });

        renderer.render(scene, cam);
      }

      animate();

      const onResize = () => {
        const nW = window.innerWidth;
        renderer.setSize(nW, H);
        cam.left = -nW / 2; cam.right = nW / 2;
        cam.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      (el as any)._cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    return () => {
      if ((el as any)._cleanup) (el as any)._cleanup();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 130, zIndex: 3, pointerEvents: 'none',
      }}
    />
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
type VehicleId = (typeof VEHICLES)[number]["id"];
interface FormData {
  vehicleId: VehicleId | "";
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function NewMovePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    vehicleId: "", pickupLocation: "", dropoffLocation: "", pickupDate: "", pickupTime: "",
  });

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleVehicleSelect = (id: VehicleId) => {
    setFormData(prev => ({ ...prev, vehicleId: id }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (!formData.vehicleId) throw new Error("Please select a vehicle");
      if (!formData.pickupLocation || !formData.dropoffLocation) throw new Error("Please fill all required fields");
      const vehicle = VEHICLES.find(v => v.id === formData.vehicleId)!;
      const payload = {
        vehicleId: formData.vehicleId, weight: vehicle.capacity,
        pickupLocation: formData.pickupLocation.trim(),
        dropoffLocation: formData.dropoffLocation.trim(),
        pickupDate: formData.pickupDate, pickupTime: formData.pickupTime,
      };
      const response = await connectToBackendServices.createOrder(payload);
      if (!response?.success) throw new Error(response?.message || "Failed to create move request");
      toast.success("Move created successfully");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Create order error:", error);
      alert(error.message || "Something went wrong");
    } finally { setIsLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="mm-root"><style>{CSS}</style>
        <div className="mm-auth-wall"><div>🔒</div><p>Not authorized.</p></div>
      </div>
    );
  }

  const selectedVehicle = VEHICLES.find(v => v.id === formData.vehicleId);

  return (
    <div className="mm-root">
      <style>{CSS}</style>

      {/* Sky background */}
      <div className="mm-sky" />

      {/* Clouds */}
      <div className="mm-cloud" style={{ width: 190, height: 42, top: '9%', animationDuration: '58s' }} />
      <div className="mm-cloud" style={{ width: 120, height: 28, top: '15%', animationDuration: '74s', animationDelay: '-22s' }} />
      <div className="mm-cloud" style={{ width: 210, height: 38, top: '5%', animationDuration: '85s', animationDelay: '-38s' }} />

      {/* Road */}
      <div className="mm-road">
        <div className="mm-road-top" />
        <div className="mm-road-body" />
        <div className="mm-road-dash" />
      </div>

      {/* Animated fleet */}
      {mounted && <AnimatedFleet />}

      {/* Page content */}
      <div className="mm-page">
        <div className="mm-wrap">

          {/* Hero */}
          <div className={`mm-hero mm-fd mm-d0 ${mounted ? 'mm-visible' : ''}`}>
            <div className="mm-chip"><span className="mm-chip-dot" />New Shipment</div>
            <h1 className="mm-title">Create <em>Pickup</em></h1>
            <p className="mm-sub">AI agent negotiates the best rate for you. No advance payment to drivers. Fully secured.</p>
          </div>

          {/* Trust */}
          <div className="mm-trust mm-fd mm-d1">
            {[["🤖","AI negotiates","auto"],["🔒","Escrow","protected"],["⚡","Response","~2 min"],["🛡","Scam","detection"]].map(([ic,lb,vl]) => (
              <div key={String(lb)} className="mm-tp"><span>{ic}</span>{lb}&nbsp;<b>{vl}</b></div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>

            {/* 01 Vehicle */}
            <div className="mm-sl mm-fd mm-d2"><span>01</span>&nbsp; Select vehicle</div>
            <div className="mm-card mm-fd mm-d2">
              <div className="mm-ch">
                <div className="mm-ci">🚚</div>
                <div><p className="mm-ct">Vehicle Type</p><p className="mm-cs">Choose based on cargo size &amp; weight</p></div>
                {selectedVehicle && (
                  <div className="mm-sb"><span className="mm-sbd" />{selectedVehicle.icon} {selectedVehicle.name}</div>
                )}
              </div>
              <div className="mm-vg">
                {VEHICLES.map((v, i) => {
                  const s = formData.vehicleId === v.id;
                  return (
                    <button key={v.id} type="button" onClick={() => handleVehicleSelect(v.id)}
                      className={`mm-vc${s ? ' mm-vc--s' : ''}`}
                      style={{ animationDelay: `${0.04 * i}s` }}>
                      <div className="mm-vt">
                        <div className={`mm-vi${s ? ' mm-vi--s' : ''}`}>{v.icon}</div>
                        <div className={`mm-vr${s ? ' mm-vr--s' : ''}`}>{s && <div className="mm-vrd" />}</div>
                      </div>
                      <p className={`mm-vn${s ? ' mm-vn--s' : ''}`}>{v.name}</p>
                      <p className="mm-vcp">{v.capacity} kg</p>
                      <div className="mm-vd">
                        {[["L",v.dimensions.L],["W",v.dimensions.W],["H",v.dimensions.H]].map(([l,d]) => (
                          <span key={String(l)} className={`mm-dt${s?' mm-dt--s':''}`}>
                            <span className="mm-dl">{l}</span>{d}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 02 Route */}
            <div className="mm-sl mm-fd mm-d3"><span>02</span>&nbsp; Route</div>
            <div className="mm-card mm-fd mm-d3">
              <div className="mm-ch"><div className="mm-ci">📍</div><div><p className="mm-ct">Pickup &amp; Dropoff</p><p className="mm-cs">Enter full address or landmark</p></div></div>
              <div className="mm-rb">
                <div className="mm-rr">
                  <div className="mm-tlc">
                    <div className="mm-tld mm-tlf" />
                    <div className="mm-tll"><div className="mm-tlli" /></div>
                    <div className="mm-tld mm-tlo" />
                  </div>
                  <div className="mm-fc">
                    <div className="mm-f">
                      <label className="mm-lb">Pickup location</label>
                      <div className="mm-iw">
                        <span className="mm-ic">🏠</span>
                        <input className="mm-inp" type="text" name="pickupLocation" required
                          value={formData.pickupLocation} onChange={handleChange}
                          placeholder="e.g. Andheri West, Mumbai" />
                      </div>
                    </div>
                    <div className="mm-f">
                      <label className="mm-lb">Dropoff location</label>
                      <div className="mm-iw">
                        <span className="mm-ic">📦</span>
                        <input className="mm-inp" type="text" name="dropoffLocation" required
                          value={formData.dropoffLocation} onChange={handleChange}
                          placeholder="e.g. Koregaon Park, Pune" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 03 Schedule */}
            <div className="mm-sl mm-fd mm-d4"><span>03</span>&nbsp; Schedule</div>
            <div className="mm-card mm-fd mm-d4">
              <div className="mm-ch"><div className="mm-ci">🗓</div><div><p className="mm-ct">When to pick up?</p><p className="mm-cs">Set your preferred date &amp; time</p></div></div>
              <div className="mm-sg">
                <div className="mm-f"><label className="mm-lb">Pickup date</label><input className="mm-inp mm-inp--pl" type="date" name="pickupDate" required value={formData.pickupDate} onChange={handleChange} /></div>
                <div className="mm-f"><label className="mm-lb">Pickup time</label><input className="mm-inp mm-inp--pl" type="time" name="pickupTime" required value={formData.pickupTime} onChange={handleChange} /></div>
              </div>
            </div>

            {/* AI notice */}
            <div className="mm-ai mm-fd mm-d5">
              <div className="mm-aib">✦</div>
              <div>
                <p className="mm-ait">AI Agent handles negotiation automatically</p>
                <p className="mm-ais">Calls drivers in Hinglish, negotiates hard, flags fraud via ML. Payment in escrow — released only after delivery.</p>
              </div>
            </div>

            {/* Submit */}
            <div className="mm-fd mm-d6">
              <button type="submit" disabled={isLoading} className={`mm-btn${isLoading ? ' mm-btn--ld' : ''}`}>
                {isLoading ? (
                  <><span className="mm-sp" /> Saving your move...</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16m8-8H4"/></svg>Create Pickup<span className="mm-ba">→</span></>
                )}
              </button>
              <p className="mm-bf">🔒 Funds held in escrow until service is complete</p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800;9..144,900&family=DM+Sans:wght@400;500;600;700&display=swap');

  .mm-root {
    --road-h: 80px;
    --fleet-h: 130px;
    --ink: #0f172a;
    --ink3: #64748b;
    --ink4: #94a3b8;
    --surf: #fff;
    --surf2: #f8fafc;
    --bg: #eef3ff;
    --blue: #2563eb;
    --blue2: #3b82f6;
    --blue-l: #eff6ff;
    --blue-b: #bfdbfe;
    --blue-d: #1d4ed8;
    --indigo: #4f46e5;
    --indigo-l: #eef2ff;
    --green: #16a34a;
    --green-l: #f0fdf4;
    --green-b: #bbf7d0;
    --bdr: #e2e8f0;
    --bdr2: #cbd5e1;
    --sh: 0 1px 3px rgba(15,23,42,.07), 0 1px 2px rgba(15,23,42,.04);
    --shm: 0 4px 16px rgba(15,23,42,.08);

    min-height: 100vh;
    width: 100%;
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    overflow-x: hidden;
    position: relative;
  }

  /* ── Sky ── */
  .mm-sky {
    position: fixed;
    inset: 0;
    z-index: 0;
    background: linear-gradient(180deg, #c7d9ff 0%, #dbeafe 25%, #eff6ff 55%, #eef3ff 100%);
  }
  .mm-sky::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(37,99,235,.06) 1px, transparent 1px);
    background-size: 30px 30px;
  }

  /* ── Clouds ── */
  .mm-cloud {
    position: fixed;
    border-radius: 100px;
    background: rgba(255,255,255,.75);
    filter: blur(10px);
    z-index: 1;
    animation: cld linear infinite;
    left: -400px;
  }
  @keyframes cld { from { transform: translateX(0) } to { transform: translateX(120vw) } }

  /* ── Road ── */
  .mm-road {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--road-h);
    z-index: 2;
  }
  .mm-road-top  { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: #e2e8f0; }
  .mm-road-body { position: absolute; top: 4px; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, #94a3b8, #64748b); }
  .mm-road-dash { position: absolute; top: 36px; left: 0; right: 0; height: 5px; overflow: hidden; }
  .mm-road-dash::before {
    content: '';
    display: block;
    height: 5px;
    width: 300%;
    background: repeating-linear-gradient(90deg, rgba(255,255,255,.7) 0, rgba(255,255,255,.7) 48px, transparent 48px, transparent 96px);
    animation: dash .9s linear infinite;
  }
  @keyframes dash { from { transform: translateX(0) } to { transform: translateX(-96px) } }


  /* ── Page ── */
  .mm-page {
    position: relative;
    z-index: 10;
    padding-top: 16px;
    padding-bottom: calc(var(--fleet-h) + 48px);
    min-height: 100vh;
  }
  .mm-wrap { max-width: 740px; margin: 0 auto; padding: 0 22px; }

  /* ── Hero ── */
  .mm-hero { text-align: center; padding: 32px 0 36px; }
  .mm-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: var(--blue-l);
    border: 1px solid var(--blue-b);
    color: var(--blue);
    font-family: 'Fraunces', Georgia, serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .15em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 100px;
    margin-bottom: 18px;
  }
  .mm-chip-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--blue2);
    animation: pulse 2.2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:.35; transform:scale(.55) } }
  .mm-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 50px;
    font-weight: 800;
    line-height: 1.0;
    letter-spacing: -.04em;
    color: var(--ink);
    margin-bottom: 12px;
  }
  .mm-title em { font-style: normal; color: var(--blue); }
  .mm-sub { font-size: 15px; color: var(--ink3); max-width: 460px; margin: 0 auto; line-height: 1.65; }

  /* ── Trust bar ── */
  .mm-trust {
    display: flex;
    gap: 9px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 34px;
  }
  .mm-tp {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--surf);
    border: 1px solid var(--bdr);
    border-radius: 100px;
    padding: 7px 14px;
    font-size: 12px;
    color: var(--ink3);
    box-shadow: var(--sh);
  }
  .mm-tp b { color: var(--ink); font-weight: 700; }

  /* ── Section label ── */
  .mm-sl {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--ink4);
    margin-bottom: 11px;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .mm-sl::after { content: ''; flex: 1; height: 1px; background: var(--bdr); }

  /* ── Cards ── */
  .mm-card {
    background: var(--surf);
    border: 1px solid var(--bdr);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 14px;
    box-shadow: var(--sh);
    transition: box-shadow .2s, border-color .2s;
  }
  .mm-card:hover { box-shadow: var(--shm); border-color: var(--bdr2); }
  .mm-ch {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 17px 22px;
    border-bottom: 1px solid var(--bdr);
    background: var(--surf2);
  }
  .mm-ci {
    font-size: 17px;
    width: 42px; height: 42px;
    background: var(--blue-l);
    border: 1px solid var(--blue-b);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .mm-ct { font-family: 'Fraunces', Georgia, serif; font-size: 14px; font-weight: 700; color: var(--ink); margin: 0 0 2px; }
  .mm-cs { font-size: 12px; color: var(--ink4); margin: 0; }
  .mm-sb {
    margin-left: auto;
    display: flex; align-items: center; gap: 6px;
    background: var(--green-l);
    border: 1px solid var(--green-b);
    color: var(--green);
    font-size: 11px; font-weight: 600;
    padding: 5px 12px;
    border-radius: 100px;
    white-space: nowrap;
  }
  .mm-sbd { width: 5px; height: 5px; border-radius: 50%; background: var(--green); }

  /* ── Vehicle grid ── */
  .mm-vg {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    background: var(--bdr);
    gap: 1px;
  }
  .mm-vc {
    background: var(--surf);
    border: none;
    padding: 17px 14px;
    cursor: pointer;
    text-align: left;
    transition: background .12s;
    position: relative;
    outline: none;
    animation: fu .42s cubic-bezier(.22,1,.36,1) both;
  }
  .mm-vc:hover { background: #fafbff; }
  .mm-vc--s { background: var(--blue-l) !important; }
  .mm-vc--s::after {
    content: '';
    position: absolute; inset: 0;
    box-shadow: inset 0 0 0 2px var(--blue-b);
    pointer-events: none;
  }
  .mm-vt { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .mm-vi {
    font-size: 20px;
    width: 43px; height: 43px;
    background: var(--surf2);
    border: 1px solid var(--bdr);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    transition: all .18s;
  }
  .mm-vi--s { background: var(--blue-l); border-color: var(--blue-b); transform: scale(1.05); }
  .mm-vr {
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 1.5px solid var(--bdr2);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
    transition: all .15s;
  }
  .mm-vr--s { border-color: var(--blue); background: var(--blue); }
  .mm-vrd {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #fff;
    animation: pop .18s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes pop { from { transform: scale(0) } to { transform: scale(1) } }
  .mm-vn { font-family: 'Fraunces', Georgia, serif; font-size: 12px; font-weight: 700; color: var(--ink3); margin: 0 0 2px; }
  .mm-vn--s { color: var(--blue); }
  .mm-vcp { font-size: 11px; color: var(--ink4); margin: 0 0 9px; }
  .mm-vd { display: flex; flex-wrap: wrap; gap: 3px; }
  .mm-dt {
    font-size: 10px; padding: 2px 6px;
    border-radius: 5px;
    background: var(--surf2); color: var(--ink4);
    border: 1px solid var(--bdr);
    display: inline-flex; align-items: center; gap: 2px;
  }
  .mm-dt--s { background: var(--blue-l); color: var(--blue); border-color: var(--blue-b); }
  .mm-dl { opacity: .5; font-size: 9px; }

  /* ── Route ── */
  .mm-rb { padding: 22px; }
  .mm-rr { display: grid; grid-template-columns: 20px 1fr; gap: 0 16px; }
  .mm-tlc { display: flex; flex-direction: column; align-items: center; padding-top: 34px; }
  .mm-tld { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .mm-tlf { background: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.15); }
  .mm-tlo { border: 2px solid var(--blue2); background: #fff; }
  .mm-tll { width: 2px; height: 30px; background: var(--bdr); border-radius: 2px; overflow: hidden; margin: 5px 0; }
  .mm-tlli {
    width: 100%; height: 40%;
    background: linear-gradient(to bottom, var(--blue2), transparent);
    animation: fl 2s ease-in-out infinite;
  }
  @keyframes fl { 0% { transform: translateY(-100%) } 100% { transform: translateY(300%) } }
  .mm-fc { display: flex; flex-direction: column; gap: 15px; }

  /* ── Fields ── */
  .mm-f { display: flex; flex-direction: column; gap: 7px; }
  .mm-lb {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 10px; font-weight: 700;
    letter-spacing: .14em; text-transform: uppercase;
    color: var(--ink3);
  }
  .mm-iw { position: relative; display: flex; align-items: center; }
  .mm-ic { position: absolute; left: 13px; font-size: 14px; pointer-events: none; z-index: 1; line-height: 1; width: 18px; text-align: center; }
  .mm-inp {
    width: 100%;
    padding: 12px 14px 12px 42px;
    background: var(--surf);
    border: 1.5px solid var(--bdr2);
    border-radius: 12px;
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    -webkit-appearance: none;
  }
  .mm-inp--pl { padding-left: 14px; }
  .mm-inp::placeholder { color: var(--ink4); }
  .mm-inp:focus { border-color: var(--blue); box-shadow: 0 0 0 4px rgba(37,99,235,.09); }

  /* ── Schedule ── */
  .mm-sg { display: grid; grid-template-columns: 1fr 1fr; gap: 17px; padding: 22px; }
  @media (max-width: 500px) { .mm-sg { grid-template-columns: 1fr } }

  /* ── AI notice ── */
  .mm-ai {
    display: flex; align-items: flex-start; gap: 13px;
    background: var(--indigo-l);
    border: 1.5px solid #c7d2fe;
    border-radius: 16px;
    padding: 15px 20px;
    margin-bottom: 14px;
  }
  .mm-aib {
    width: 36px; height: 36px; flex-shrink: 0;
    background: rgba(79,70,229,.1);
    border: 1px solid rgba(79,70,229,.2);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    animation: spin 5s linear infinite;
  }
  @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
  .mm-ait { font-family: 'Fraunces', Georgia, serif; font-size: 13px; font-weight: 700; color: var(--ink); margin: 0 0 3px; }
  .mm-ais { font-size: 13px; color: var(--ink3); margin: 0; line-height: 1.6; }

  /* ── Submit ── */
  .mm-btn {
    width: 100%;
    padding: 16px 28px;
    background: linear-gradient(135deg, #1d4ed8, #4f46e5);
    border: none;
    border-radius: 16px;
    color: #fff;
    font-family: 'Fraunces', Georgia, serif;
    font-size: 15px; font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all .22s cubic-bezier(.22,1,.36,1);
    box-shadow: 0 4px 20px rgba(37,99,235,.27), inset 0 1px 0 rgba(255,255,255,.18);
  }
  .mm-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(37,99,235,.35); }
  .mm-btn:active:not(:disabled) { transform: translateY(0); }
  .mm-btn--ld { background: #e2e8f0 !important; color: var(--ink4) !important; cursor: not-allowed; box-shadow: none !important; transform: none !important; }
  .mm-ba { transition: transform .2s; display: inline-block; }
  .mm-btn:hover .mm-ba { transform: translateX(5px); }
  .mm-bf { text-align: center; font-size: 12px; color: var(--ink4); margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 5px; }
  .mm-sp { width: 15px; height: 15px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,.25); border-top-color: #fff; animation: spin .7s linear infinite; flex-shrink: 0; }

  /* ── Fade-up entrance animations ── */
  .mm-fd {
    opacity: 0;
    transform: translateY(20px);
    animation: fu .5s cubic-bezier(.22,1,.36,1) forwards;
  }
  @keyframes fu { to { opacity: 1; transform: translateY(0) } }
  .mm-d0 { animation-delay: .05s }
  .mm-d1 { animation-delay: .12s }
  .mm-d2 { animation-delay: .2s  }
  .mm-d3 { animation-delay: .28s }
  .mm-d4 { animation-delay: .35s }
  .mm-d5 { animation-delay: .42s }
  .mm-d6 { animation-delay: .5s  }

  /* ── Auth wall ── */
  .mm-auth-wall {
    position: fixed; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 14px; font-size: 15px; color: var(--ink3);
  }
`;