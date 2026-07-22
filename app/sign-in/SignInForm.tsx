"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthField } from "../../components/AuthField";
import { GoogleButton } from "../../components/GoogleButton";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() => {
    // The session watcher signs an expired session out and lands here.
    if (params.get("expired")) return "Your session expired. Sign in to carry on.";
    // The Google exchange with the API failed, so no session was created.
    if (params.get("error")) return "We couldn't complete that sign-in. Please try again.";
    return null;
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    // `redirect: false` so a failure re-renders this form with its message
    // instead of bouncing through NextAuth's own error page.
    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Email or password is incorrect."
          : result.error,
      );
      setSubmitting(false);
      return;
    }

    // Replace, not push: the back button should not return to a form that has
    // already been submitted.
    router.replace(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-28 pt-10 md:px-6 md:pb-16 md:pt-16">
      <h1 className="title-lg text-ink">Sign in</h1>
      <p className="mt-2 text-[0.9375rem] text-sub">
        Unlocked contacts and credits stay on your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <AuthField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          required
          disabled={submitting}
        />

        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          required
          disabled={submitting}
        />

        {error ? (
          <p role="alert" className="caption px-1 text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="pressable mt-2 w-full rounded-full bg-accent py-3.5 text-[1.0625rem] font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <GoogleButton callbackUrl={callbackUrl} disabled={submitting} />

      <p className="mt-6 text-center text-[0.9375rem] text-sub">
        New to Artiza?{" "}
        <Link
          href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-accent"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
