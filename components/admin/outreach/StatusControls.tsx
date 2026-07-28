"use client";

import {
  APPROVAL_LABELS,
  APPROVAL_STATUSES,
  APPROVAL_TONE,
  OUTREACH_LABELS,
  OUTREACH_STATUSES,
  OUTREACH_TONE,
  type ApprovalStatus,
  type OutreachStatus,
} from "../../../lib/outreach";

/**
 * How a lead's two states are shown, and how they are changed.
 *
 * Both live in one file because they are one idea: the tag a row wears and the
 * button that sets it are the same words in the same colour, so marking a
 * result is recognising the thing you were already looking at rather than
 * translating it into a dropdown's vocabulary.
 */

type Tone = "accent" | "quiet" | "danger";

const TONE_CLASS: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent",
  quiet: "bg-fill text-sub",
  // Amber, not red — the palette keeps red for actions and money, so a red
  // "Declined" beside a red button would read as a third thing to press.
  danger: "bg-danger/15 text-danger",
};

export function StatusTag({
  label,
  tone,
}: {
  label: string;
  tone: Tone;
}) {
  return (
    <span
      className={`caption inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-semibold ${TONE_CLASS[tone]}`}
    >
      {label}
    </span>
  );
}

export function OutreachTag({ status }: { status: OutreachStatus }) {
  return (
    <StatusTag label={OUTREACH_LABELS[status]} tone={OUTREACH_TONE[status]} />
  );
}

export function ApprovalTag({ status }: { status: ApprovalStatus }) {
  return (
    <StatusTag label={APPROVAL_LABELS[status]} tone={APPROVAL_TONE[status]} />
  );
}

/**
 * The whole set of answers, laid out at once.
 *
 * A `<select>` hides every option but the current one behind a tap, and this is
 * the control the campaign is actually operated with — someone coming back from
 * WhatsApp knows which word they want before they look at the screen. Showing
 * all four means the answer is one press away instead of three.
 */
function Choices<T extends string>({
  legend,
  value,
  options,
  labels,
  disabled,
  onChange,
}: {
  legend: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  disabled?: boolean;
  onChange: (next: T) => void;
}) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="caption font-semibold uppercase tracking-wider text-faint">
        {legend}
      </legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={`pressable rounded-full px-3 py-1.5 text-sm font-semibold transition-colors duration-200 ease-out disabled:opacity-50 ${
                active ? "bg-ink text-canvas" : "bg-fill text-sub"
              }`}
            >
              {labels[option]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function OutreachChoices({
  value,
  disabled,
  onChange,
}: {
  value: OutreachStatus;
  disabled?: boolean;
  onChange: (next: OutreachStatus) => void;
}) {
  return (
    <Choices
      legend="Outreach"
      value={value}
      options={OUTREACH_STATUSES}
      labels={OUTREACH_LABELS}
      disabled={disabled}
      onChange={onChange}
    />
  );
}

export function ApprovalChoices({
  value,
  disabled,
  onChange,
}: {
  value: ApprovalStatus;
  disabled?: boolean;
  onChange: (next: ApprovalStatus) => void;
}) {
  return (
    <Choices
      legend="Their answer"
      value={value}
      options={APPROVAL_STATUSES}
      labels={APPROVAL_LABELS}
      disabled={disabled}
      onChange={onChange}
    />
  );
}
