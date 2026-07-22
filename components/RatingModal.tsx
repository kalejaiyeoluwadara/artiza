"use client";

import { useRef, useState } from "react";
import { Star } from "lucide-react";
import { Artisan, TRADE_LABELS } from "../lib/artisans";
import { ApiError } from "../lib/api/error";
import { Dialog } from "./Dialog";

/**
 * The post-job follow-up. One rating per artisan, ever, so this is a decision
 * surface rather than a form you can wander away from — hence the dialog.
 *
 * There is no "submitted!" screen with a timer any more: the toast raised by
 * the caller says it landed, and the dialog simply closes. A modal that hangs
 * around for 1.2 seconds after its job is done is 1.2 seconds of the customer
 * waiting on an animation.
 */
export function RatingModal({
  artisan,
  onClose,
  onSubmit,
}: {
  artisan: Artisan | null;
  onClose: () => void;
  onSubmit: (artisanId: string, rating: number, text: string) => Promise<void>;
}) {
  if (!artisan) return null;

  return (
    <Dialog open onClose={onClose} label={`Rate ${artisan.name}`}>
      <RatingForm
        key={artisan.id}
        artisan={artisan}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Dialog>
  );
}

/** Keyed on the artisan, so opening a second one starts from a clean form. */
function RatingForm({
  artisan,
  onClose,
  onSubmit,
}: {
  artisan: Artisan;
  onClose: () => void;
  onSubmit: (artisanId: string, rating: number, text: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // The API wants a few words; saying so up front beats a 422 afterwards.
  const tooShort = text.trim().length > 0 && text.trim().length < 4;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(artisan.id, rating, text.trim());
      onClose();
    } catch (cause) {
      setSubmitting(false);
      setError(
        cause instanceof ApiError
          ? cause.firstDetail() ?? cause.message
          : "Couldn't send your rating. Please try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="caption font-semibold uppercase tracking-wider text-accent">
          Post-job follow up
        </span>
        <h2 className="title mt-1 text-ink">Rate {artisan.name}</h2>
        <p className="caption mt-0.5">
          How did the {TRADE_LABELS[artisan.trade].toLowerCase()} job go?
        </p>
      </div>

      <div
        className="flex items-center justify-center gap-2 py-2"
        role="radiogroup"
        aria-label="Rating out of 5"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === rating}
            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="pressable p-1"
          >
            <Star
              size={32}
              strokeWidth={2}
              aria-hidden
              className={
                star <= (hovered || rating) ? "fill-accent text-accent" : "text-line"
              }
            />
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="review-note" className="caption mb-1.5 block font-semibold text-ink">
          What happened? <span className="font-normal text-sub">Optional</span>
        </label>
        <textarea
          id="review-note"
          rows={3}
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={600}
          disabled={submitting}
          placeholder="Arrived on time, neat tiling, fair price…"
          className="w-full rounded-2xl bg-fill p-3 text-[0.9375rem] text-ink placeholder:text-faint disabled:opacity-60"
        />
        {tooShort ? (
          <p className="caption mt-1.5 text-danger">
            A few more words, or leave it empty.
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="caption text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2.5 pt-1">
        <button
          ref={cancelRef}
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="pressable flex-1 rounded-full bg-fill py-3 text-[0.9375rem] font-semibold text-ink disabled:opacity-50"
        >
          Not now
        </button>
        <button
          type="submit"
          disabled={submitting || tooShort}
          className="pressable flex-1 rounded-full bg-accent py-3 text-[0.9375rem] font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Submit rating"}
        </button>
      </div>
    </form>
  );
}
