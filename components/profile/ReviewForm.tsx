"use client";

import React, { useState } from "react";
import { Star, ShieldAlert, Sparkles, Send } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../hooks/useToast";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface ReviewFormProps {
  workerId: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ workerId }) => {
  const { currentRole, currentUser, reviews, addReview } = useApp();
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingReview = reviews.find(
    (r) => r.workerId === workerId && r.reviewerId === currentUser.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      toast.error("Please write a review before submitting.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const success = addReview(workerId, {
        rating,
        text: reviewText.trim()
      });
      if (success) {
        setReviewText("");
        setRating(5);
      }
      setIsSubmitting(false);
    }, 600);
  };

  if (currentRole !== "seeker") {
    return (
      <Card variant="flat" className="p-6 border border-amber-200/50 bg-amber-50/20 rounded-2xl">
        <div className="flex gap-3 items-start text-amber-800">
          <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-black tracking-tight text-amber-900">
              Review Form Locked
            </h4>
            <p className="text-xs font-semibold leading-relaxed mt-1 text-amber-800/80">
              Only client Seekers can write worker reviews. Switch your role to{" "}
              <span className="font-black">Seeker</span> in the top navigation to leave feedback.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (existingReview) {
    return (
      <Card variant="flat" className="p-6 border border-emerald-200/50 bg-emerald-50/20 rounded-2xl">
        <div className="flex gap-3 items-start text-emerald-800">
          <ShieldAlert className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-black tracking-tight text-emerald-900">
              Review Already Submitted
            </h4>
            <p className="text-xs font-semibold leading-relaxed mt-1 text-emerald-800/80">
              You rated this worker {existingReview.rating} stars on{" "}
              {new Date(existingReview.date).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              . Thank you for your feedback!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const ratingLabels: Record<number, string> = {
    5: "Excellent",
    4: "Very Good",
    3: "Good",
    2: "Fair",
    1: "Poor",
  };

  return (
    <Card variant="default" className="p-6 border border-zinc-200/80 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-extrabold text-zinc-800 uppercase tracking-wider pl-0.5">
          Write a Review
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 pl-0.5">
          <span id="rating-label" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Rating
          </span>
          <div
            className="flex items-center gap-1.5 mt-1"
            role="radiogroup"
            aria-labelledby="rating-label"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`Rate ${star} out of 5 stars — ${ratingLabels[star]}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
              >
                <Star
                  className={`h-7 w-7 transition-all ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-500 text-amber-500 scale-105"
                      : "text-zinc-200"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-black text-zinc-500 ml-2 uppercase tracking-wide">
              {ratingLabels[rating]}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pl-0.5">
          <label htmlFor="review-text" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Your Review
          </label>
          <textarea
            id="review-text"
            rows={4}
            required
            placeholder="Share details of your experience with this artisan..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-semibold"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="font-bold cursor-pointer mt-2"
          rightIcon={<Send className="h-4 w-4" />}
        >
          Publish Review
        </Button>
      </form>
    </Card>
  );
};
export default ReviewForm;
