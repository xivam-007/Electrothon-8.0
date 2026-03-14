"use client";

import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
// import CheckoutForm from "@/components/CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import { useParams } from "next/navigation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function PaymentPage() {

  // const params = useParams();
  // const moveId = params.moveId as string;

  const moveId  = "69b5a17ab37b5a41929b52ef";

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm moveId={moveId} />
    </Elements>
  );
}





