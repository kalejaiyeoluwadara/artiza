"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthFieldProps {
  label: string;
  type: "text" | "email" | "password" | "tel";
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  inputMode?: "text" | "email" | "tel" | "numeric";
}

/**
 * The one field used across sign-in and sign-up. A `bg-fill` rounded-2xl well
 * with the label sitting above the value rather than floating inside it —
 * a label that animates out of the way is a label you can't read while typing.
 */
export function AuthField({
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
  hint,
  error,
  required,
  disabled,
  inputMode,
}: AuthFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  // Only password fields get a reveal toggle, and revealing is never sticky —
  // the field re-seals itself on the next mount.
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="caption block px-1 font-semibold">
        {label}
      </label>

      <div className="relative mt-1.5">
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full rounded-2xl bg-fill py-3 pl-4 text-[1.0625rem] text-ink placeholder:text-faint disabled:opacity-60 ${
            isPassword ? "pr-12" : "pr-4"
          } ${error ? "ring-1 ring-danger" : ""}`}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            disabled={disabled}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="pressable absolute inset-y-0 right-0 grid w-12 place-items-center text-sub disabled:opacity-60"
          >
            {revealed ? (
              <EyeOff className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="caption mt-1.5 px-1 text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="caption mt-1.5 px-1">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
