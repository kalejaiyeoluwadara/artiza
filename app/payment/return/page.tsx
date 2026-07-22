import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentReturn } from "./PaymentReturn";

export const metadata: Metadata = {
  title: "Confirming payment — Artiza",
  robots: { index: false, follow: false },
};

/**
 * Where Paystack sends the customer back to. Set `PAYSTACK_CALLBACK_URL` on
 * the API to this path.
 */
export default function PaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaymentReturn />
    </Suspense>
  );
}
