import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth/session";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create an account — Artiza",
  description: "Create an Artiza account to unlock artisan contacts in Ilisan.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getSession();
  if (session && !session.error) {
    const { callbackUrl } = await searchParams;
    redirect(callbackUrl ?? "/account");
  }

  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
