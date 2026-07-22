"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthField } from "../../components/AuthField";
import { GoogleButton } from "../../components/GoogleButton";
import { publicApi } from "../../lib/api";
import { ApiError } from "../../lib/api/error";

/** Matches the backend's rule, so the message arrives before the round trip. */
const NIGERIAN_MSISDN = /^234\d{10}$/;

export function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (name.trim().length < 2) errors.name = "Tell us your name.";
    if (!email.includes("@")) errors.email = "Enter a valid email address.";
    if (password.length < 8) errors.password = "Use at least 8 characters.";
    if (phone && !NIGERIAN_MSISDN.test(phone)) {
      errors.phone = "Use the 234 format, e.g. 2348031234567.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!validate()) return;
    setSubmitting(true);

    try {
      // Register against the API, then sign in through NextAuth. The tokens
      // registration returns are deliberately dropped: letting the credentials
      // provider fetch its own keeps one path into a session, rather than two
      // that could drift apart.
      await publicApi.auth.register({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(phone ? { phone } : {}),
      });

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created, but sign-in failed. Try signing in.");
        setSubmitting(false);
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.firstDetail() ?? cause.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-28 pt-10 md:px-6 md:pb-16 md:pt-16">
      <h1 className="title-lg text-ink">Create an account</h1>
      <p className="mt-2 text-[0.9375rem] text-sub">
        Browsing is free. An account is only needed to unlock a contact.
      </p>

      <GoogleButton
        callbackUrl={callbackUrl}
        label="Sign up with Google"
        disabled={submitting}
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <AuthField
          label="Name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={setName}
          placeholder="Boluwatife Adeyemi"
          error={fieldErrors.name}
          required
          disabled={submitting}
        />

        <AuthField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={fieldErrors.email}
          required
          disabled={submitting}
        />

        <AuthField
          label="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={setPhone}
          placeholder="2348031234567"
          hint="Optional. Used if we need to reach you about a job."
          error={fieldErrors.phone}
          disabled={submitting}
        />

        <AuthField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          hint="At least 8 characters."
          error={fieldErrors.password}
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
          disabled={submitting}
          className="pressable mt-2 w-full rounded-full bg-accent py-3.5 text-[1.0625rem] font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-[0.9375rem] text-sub">
        Already have an account?{" "}
        <Link
          href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-accent"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
