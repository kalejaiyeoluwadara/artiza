import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth/session";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in — Artiza",
  description: "Sign in to unlock artisan contacts and rate completed jobs.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // Already signed in — nothing here to do but send them on.
  const session = await getSession();
  if (session && !session.error) {
    const { callbackUrl } = await searchParams;
    redirect(callbackUrl ?? "/account");
  }

  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
