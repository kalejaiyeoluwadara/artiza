"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

/**
 * "Continue with Google" — renders nothing until it knows Google is actually
 * configured.
 *
 * The check is a `getProviders()` call rather than a `NEXT_PUBLIC_` flag
 * because the provider list is already the truth: it is derived from the same
 * credentials the sign-in route uses, so the button cannot outlive them and
 * offer a flow that 500s.
 */
export function GoogleButton({
  callbackUrl,
  label = "Continue with Google",
  disabled,
}: {
  callbackUrl: string;
  label?: string;
  disabled?: boolean;
}) {
  const [available, setAvailable] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getProviders().then((providers) => {
      if (!cancelled) setAvailable(Boolean(providers?.google));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!available) return null;

  return (
    <>
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => {
          setPending(true);
          // A full redirect, unlike the credentials form — the OAuth round
          // trip leaves the site, so there is no state here worth preserving.
          void signIn("google", { callbackUrl });
        }}
        className="pressable hover-dim mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-line bg-card py-3.5 text-[1.0625rem] font-semibold text-ink disabled:opacity-50"
      >
        <GoogleMark />
        {pending ? "Taking you to Google…" : label}
      </button>

      {/* Sits below the button, so the divider separates it from the form that
          follows. The form keeps its own top margin, which is what spaces the
          two apart when this whole block is absent. */}
      <div className="mt-6 flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        <span className="caption text-faint">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}

/** Google's four-colour mark. Fixed brand colours — not themeable by design. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
