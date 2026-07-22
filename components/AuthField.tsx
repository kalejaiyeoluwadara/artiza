"use client";

import { useId } from "react";

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

  return (
    <div>
      <label htmlFor={id} className="caption block px-1 font-semibold">
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`mt-1.5 w-full rounded-2xl bg-fill px-4 py-3 text-[1.0625rem] text-ink placeholder:text-faint disabled:opacity-60 ${
          error ? "ring-1 ring-danger" : ""
        }`}
      />

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
