"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { connectToBackendServices } from "@/services/connectToBackend";
import PdfViewer, { PdfProps } from "../components/pdf"; // adjust path if necessary

export default function PdfPage() {
  const params = useParams();
  
  // NOTE: If your folder is named [id], change params.moveId to params.id
  const moveId = params.moveId as string; 

  const [pdfData, setPdfData] = useState<PdfProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moveId) {
      setLoading(false);
      setError("Invalid Move ID");
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data in parallel
        const [orderRes, moverRes] = await Promise.all([
          connectToBackendServices.getPdfDetails(moveId),
          connectToBackendServices.getMoverDetails(moveId)
        ]);

        // Adjust these to match your actual backend response structure
        const orderData = orderRes?.data || orderRes;
        const moverData = moverRes?.data || moverRes;

        setPdfData({
          moveID: moveId,
          deliveryDate: orderData?.deliveryDate || "—",
          deliveryTime: orderData?.deliveryTime || "—",
          dropoffLocation: orderData?.dropoffLocation || "—",
          pickupDate: orderData?.pickupDate || "—",
          pickupLocation: orderData?.pickupLocation || "—",
          pickupTime: orderData?.pickupTime || "—",
          distance: orderData?.distance || "—",
          price: orderData?.price || 0,
          weight: orderData?.weight || "—",
          vehicleId: orderData?.vehicleId || "—",
          // Mover Details
          name: moverData?.name || "—",
          phone: moverData?.phone || "—",
          address: moverData?.address || "—",
          website: moverData?.website || "#",
        });

      } catch (err) {
        console.error("Error fetching PDF data:", err);
        setError("Could not load document details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [moveId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !pdfData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-[#f0ede8]">
        <p>{error || "No data available."}</p>
      </div>
    );
  }

  return <PdfViewer {...pdfData} />;
}