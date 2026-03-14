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
      
      // Grab the new token from the response and update the context & localStorage
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 flex justify-center">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-5xl p-10">

        <h1 className="text-3xl font-bold mb-10 text-black">Profile Settings</h1>

        <div className="grid md:grid-cols-2 gap-12">

          {/* LEFT SIDE - DETAILS */}
          <div className="space-y-6">

            {/* Name */}
            <div>
              <label className="text-lg font-bold text-gray-600">
                Full Name
              </label>

              <input
                type="text"
                value={name.toUpperCase()}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                className="text-black font-semibold mt-2 w-full border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-lg font-semibold text-gray-600">
                Phone Number
              </label>

              <input
                value={userPhone ? `+91 ${userPhone.slice(3)}` : ""}
                disabled
                className="font-semibold mt-2 w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-900"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="text-lg font-semibold text-gray-600">
                Profile Image URL
              </label>

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="text-black mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={updateUserProfile}
              disabled={!hasChanges || loading}
              className={`w-full py-3 rounded-lg text-lg font-semibold transition
              ${hasChanges
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* RIGHT SIDE - PROFILE IMAGE */}
          <div className="flex flex-col items-center justify-center">

            <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-lg">
                  No Image
                </div>
              )}
            </div>

            <p className="mt-6 text-gray-500 text-sm text-center max-w-xs">
              Add a profile image URL to update your avatar
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}