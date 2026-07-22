"use client";

import { useId } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * The console's form primitives.
 *
 * They follow the customer app's `AuthField`: a `bg-fill` rounded-2xl well with
 * the label sitting above the value, never floating inside it. What they add is
 * for the people who use this all day — every limit the API enforces is written
 * on the field that carries it, and the counter turns red *before* the save
 * does. A 422 should be the surprise, not the way you learn the rule.
 */

function Shell({
  id,
  label,
  hint,
  error,
  optional,
  count,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  count?: { value: number; max: number };
  children: React.ReactNode;
}) {
  const over = count ? count.value > count.max : false;

  return (
    <div>
      <div className="flex items-baseline gap-2 px-1">
        <label htmlFor={id} className="caption font-semibold text-ink">
          {label}
        </label>
        {optional ? <span className="caption text-faint">Optional</span> : null}
        {count ? (
          <span
            className={`figure ml-auto text-xs ${over ? "text-danger" : "text-faint"}`}
          >
            {count.value}/{count.max}
          </span>
        ) : null}
      </div>

      {children}

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

const WELL =
  "mt-1.5 w-full rounded-2xl bg-fill px-4 py-3 text-[1.0625rem] text-ink placeholder:text-faint disabled:opacity-60";

interface BaseProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  optional?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
  optional,
  disabled,
  maxLength,
  type = "text",
  inputMode,
  prefix,
}: BaseProps & {
  type?: "text" | "email" | "tel" | "number" | "url";
  inputMode?: "text" | "email" | "tel" | "numeric" | "url";
  /** A fixed, unwritable head to the value — the "+234" on a phone number. */
  prefix?: string;
}) {
  const id = useId();

  return (
    <Shell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      count={maxLength ? { value: value.length, max: maxLength } : undefined}
    >
      <div className="relative">
        {prefix ? (
          <span
            aria-hidden
            className="figure pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 pt-0.5 text-[1.0625rem] text-sub"
          >
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={`${WELL} ${error ? "ring-1 ring-danger" : ""} ${
            prefix ? "pl-15" : ""
          }`}
        />
      </div>
    </Shell>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
  optional,
  disabled,
  maxLength,
  rows = 3,
}: BaseProps & { rows?: number }) {
  const id = useId();

  return (
    <Shell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      count={maxLength ? { value: value.length, max: maxLength } : undefined}
    >
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${WELL} resize-y leading-relaxed ${
          error ? "ring-1 ring-danger" : ""
        }`}
      />
    </Shell>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
  error,
  disabled,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  hint?: string;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <Shell id={id} label={label} hint={hint} error={error}>
      <div className="relative mt-1.5">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={`w-full appearance-none rounded-2xl bg-fill py-3 pl-4 pr-10 text-[1.0625rem] text-ink disabled:opacity-60 ${
            error ? "ring-1 ring-danger" : ""
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2.2}
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sub"
        />
      </div>
    </Shell>
  );
}

/**
 * A list the team types one entry at a time — services, mostly.
 *
 * Enter commits, and so does a comma: people paste "Floor tiling, Marble" out
 * of a note and expect two entries, not one long one.
 */
export function TagField({
  label,
  values,
  onChange,
  placeholder,
  hint,
  max,
  maxLength,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
  max: number;
  maxLength: number;
}) {
  const id = useId();
  const full = values.length >= max;

  const commit = (raw: string) => {
    const parts = raw
      .split(",")
      .map((part) => part.trim().slice(0, maxLength))
      .filter(Boolean)
      .filter((part) => !values.includes(part));

    if (parts.length > 0) onChange([...values, ...parts].slice(0, max));
  };

  return (
    <Shell
      id={id}
      label={label}
      hint={hint}
      optional
      count={{ value: values.length, max }}
    >
      <input
        id={id}
        type="text"
        placeholder={full ? `That's all ${max}` : placeholder}
        disabled={full}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== ",") return;
          // Enter inside a form would submit it; this key belongs to the field.
          event.preventDefault();
          commit(event.currentTarget.value);
          event.currentTarget.value = "";
        }}
        onBlur={(event) => {
          commit(event.currentTarget.value);
          event.currentTarget.value = "";
        }}
        className={WELL}
      />

      {values.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {values.map((entry) => (
            <li key={entry}>
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== entry))}
                className="pressable rounded-full bg-fill px-3 py-1.5 text-sm font-medium text-ink"
              >
                {entry}
                <span aria-hidden className="ml-1.5 text-faint">
                  ×
                </span>
                <span className="sr-only">Remove {entry}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </Shell>
  );
}

/**
 * A switch with its consequence written next to it. `featured` and `isActive`
 * both change what customers see, so neither is a bare toggle with a noun.
 */
export function ToggleField({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="pressable flex w-full items-start gap-3 rounded-2xl bg-fill p-4 text-left disabled:opacity-60"
    >
      <span
        aria-hidden
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md transition-colors duration-200 ease-out ${
          checked ? "bg-accent text-white" : "bg-card ring-1 ring-line"
        }`}
      >
        {checked ? <Check size={13} strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.9375rem] font-semibold text-ink">
          {label}
        </span>
        <span className="caption block">{description}</span>
      </span>
    </button>
  );
}

/** Groups a form into the passes an editor actually makes through it. */
export function FormSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card p-5 sm:p-6">
      <h2 className="title text-ink">{title}</h2>
      {note ? <p className="caption mt-1">{note}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
