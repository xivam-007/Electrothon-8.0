"use client";

import { useAuth } from "@/context/AuthContext";
import { connectToBackendServices } from "@/services/connectToBackend";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

// ── Vehicle definitions ──────────────────────────────────────────────────────
export const VEHICLES = [
  {
    id: "mini-3w",
    name: "Mini 3W",
    capacity: "50",
    dimensions: { L: "4.7 ft", W: "3.8 ft", H: "3.6 ft" },
    icon: "🛺",
  },
  {
    id: "3-wheeler",
    name: "3 Wheeler",
    capacity: "500",
    dimensions: { L: "6 ft", W: "5 ft", H: "4.6 ft" },
    icon: "🚜",
  },
  {
    id: "tata-ace",
    name: "Tata Ace",
    capacity: "750",
    dimensions: { L: "7 ft", W: "5.5 ft", H: "5 ft" },
    icon: "🚐",
  },
  {
    id: "pickup-8ft",
    name: "Pickup 8ft",
    capacity: "1200",
    dimensions: { L: "8 ft", W: "6 ft", H: "5.5 ft" },
    icon: "🚚",
  },
  {
    id: "pickup-1-7ton",
    name: "Pickup 1.7 Ton",
    capacity: "1700",
    dimensions: { L: "10 ft", W: "6.5 ft", H: "6 ft" },
    icon: "🚛",
  },
  {
    id: "14ft-open",
    name: "14ft (Open)",
    capacity: "3500",
    dimensions: { L: "14 ft", W: "7 ft", H: "—" },
    icon: "🚛",
  },
  {
    id: "14ft-closed",
    name: "14ft (Closed)",
    capacity: "3500",
    dimensions: { L: "14 ft", W: "7 ft", H: "7 ft" },
    icon: "🚛",
  },
  {
    id: "tata-17ft",
    name: "Tata 17ft",
    capacity: "4000",
    dimensions: { L: "17 ft", W: "7.5 ft", H: "7.5 ft" },
    icon: "🚛",
  },
]

type VehicleId = (typeof VEHICLES)[number]["id"];

// ── Form state ───────────────────────────────────────────────────────────────
interface FormData {
  vehicleId: VehicleId | "";
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function NewMovePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    vehicleId: "",
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: "",
    pickupTime: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVehicleSelect = (id: VehicleId) => {
    setFormData((prev) => ({ ...prev, vehicleId: id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (!formData.vehicleId) throw new Error("Please select a vehicle");
      if (!formData.pickupLocation || !formData.dropoffLocation)
        throw new Error("Please fill all required fields");

      const vehicle = VEHICLES.find((v) => v.id === formData.vehicleId)!;

      const payload = {
        vehicleId: formData.vehicleId,
        weight: vehicle.capacity,
        pickupLocation: formData.pickupLocation.trim(),
        dropoffLocation: formData.dropoffLocation.trim(),
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
      };

      const response = await connectToBackendServices.createOrder(payload);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to create move request");
      }

      toast.success("Move created successfully");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Create order error:", error);
      alert(error.message || "Something went wrong while creating the move");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center">
        <p className="text-slate-500 font-medium">Not authorized.</p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition";

  const labelClass =
    "block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen bg-[#f5f5f3] font-sans">
      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* ── PAGE TITLE ── */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            New Shipment
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Create Pickup</h1>
          <p className="text-sm text-slate-400 mt-1">
            Fill in the details below to schedule a new pickup.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── VEHICLE SELECTOR ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900">Select Vehicle</p>
            </div>

            <div className="divide-y divide-slate-50">
              {VEHICLES.map((vehicle) => {
                const isSelected = formData.vehicleId === vehicle.id;
                return (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => handleVehicleSelect(vehicle.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all ${
                      isSelected
                        ? "bg-violet-50 border-l-4 border-l-violet-600"
                        : "hover:bg-slate-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Vehicle icon */}
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                        isSelected ? "bg-violet-100" : "bg-slate-100"
                      }`}
                    >
                      {vehicle.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold ${
                          isSelected ? "text-violet-700" : "text-slate-900"
                        }`}
                      >
                        {vehicle.name}
                      </p>

                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {vehicle.capacity}
                      </p>

                      {/* Dimensions */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(
                          [
                            ["L", vehicle.dimensions.L],
                            ["W", vehicle.dimensions.W],
                            ["H", vehicle.dimensions.H],
                          ] as [string, string][]
                        ).map(([label, val]) => (
                          <span
                            key={label}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                              isSelected
                                ? "bg-violet-100 text-violet-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span className="opacity-60">{label}</span>
                            {val}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Radio indicator */}
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? "border-violet-600 bg-violet-600"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── ROUTE ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900">Route</p>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="flex gap-4 items-stretch">
                {/* Timeline dots */}
                <div className="flex flex-col items-center pt-9 gap-1 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                  <div className="w-px flex-1 bg-slate-200 min-h-[2.5rem]" />
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-900" />
                </div>

                <div className="flex flex-col gap-5 flex-1 min-w-0">
                  <div>
                    <label className={labelClass}>Pickup Location</label>
                    <input
                      type="text"
                      name="pickupLocation"
                      required
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      placeholder="Address or landmark"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Dropoff Location</label>
                    <input
                      type="text"
                      name="dropoffLocation"
                      required
                      value={formData.dropoffLocation}
                      onChange={handleChange}
                      placeholder="Address or landmark"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SCHEDULE ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900">Schedule</p>
            </div>

            <div className="px-6 py-5 grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Pickup Date</label>
                <input
                  type="date"
                  name="pickupDate"
                  required
                  value={formData.pickupDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Pickup Time</label>
                <input
                  type="time"
                  name="pickupTime"
                  required
                  value={formData.pickupTime}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all flex justify-center items-center gap-2 ${
              isLoading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Pickup
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}