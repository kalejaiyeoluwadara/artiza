"use client";

import { useState } from "react";
import { Star, X, Check } from "lucide-react";
import { Artisan } from "../lib/artisans";

export function RatingModal({
  artisan,
  onClose,
  onSubmit,
}: {
  artisan: Artisan | null;
  onClose: () => void;
  onSubmit: (artisanId: string, rating: number, text: string) => void;
}) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [text, setText] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  if (!artisan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(artisan.id, rating, text);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-xs sm:items-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="pressable absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-fill text-sub hover:text-ink"
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Check size={28} strokeWidth={2.5} />
            </div>
            <h3 className="title mt-4 text-ink">Rating Submitted</h3>
            <p className="caption mt-1 text-sub">
              Thank you for helping build trust in Ilisan!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="caption uppercase tracking-wider text-accent font-semibold">
                Post-Job Follow up
              </span>
              <h2 className="title mt-1 text-ink">Rate {artisan.name}</h2>
              <p className="caption text-sub">
                How did the {artisan.trade.replace("-", " ")} job go?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="pressable p-1 transition-transform"
                >
                  <Star
                    size={32}
                    strokeWidth={2}
                    className={`${
                      star <= (hoverRating || rating)
                        ? "fill-accent text-accent"
                        : "text-line"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="review-note" className="caption font-semibold text-ink block mb-1.5">
                Feedback (Optional)
              </label>
              <textarea
                id="review-note"
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Arrived on time, neat tiling job, fair pricing..."
                className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="pressable flex-1 rounded-full bg-fill py-2.5 text-sm font-semibold text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pressable flex-1 rounded-full bg-accent py-2.5 text-sm font-semibold text-white shadow-sm"
              >
                Submit Rating
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
