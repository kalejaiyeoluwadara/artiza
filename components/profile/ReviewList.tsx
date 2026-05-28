"use client";

import React from "react";
import { Star, MessageSquareDashed } from "lucide-react";
import { Review } from "../../context/AppContext";
import Card from "../ui/Card";

interface ReviewListProps {
  reviews: Review[];
}

// Generate colored background index based on name
const getAvatarColorClass = (name: string) => {
  const code = name.charCodeAt(0) % 5;
  switch (code) {
    case 0:
      return "bg-rose-100 text-rose-700 border-rose-200/50";
    case 1:
      return "bg-sky-100 text-sky-700 border-sky-200/50";
    case 2:
      return "bg-emerald-100 text-emerald-700 border-emerald-200/50";
    case 3:
      return "bg-indigo-100 text-indigo-700 border-indigo-200/50";
    case 4:
    default:
      return "bg-amber-100 text-amber-700 border-amber-200/50";
  }
};

export const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <Card variant="flat" className="p-8 text-center border border-zinc-200/40 rounded-3xl min-h-[160px] flex flex-col justify-center items-center">
        <MessageSquareDashed className="h-7 w-7 text-zinc-400 mb-2" />
        <h4 className="text-sm font-extrabold text-zinc-700">No Reviews Yet</h4>
        <p className="text-xs text-zinc-500 font-semibold max-w-xs mt-1 leading-relaxed">
          Be the first to share your experience with this artisan! Leave a rating below.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => {
        const initial = review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : "?";
        const colorClass = getAvatarColorClass(review.reviewerName || "Anonymous");

        return (
          <Card
            key={review.id}
            variant="default"
            className="p-5 border border-zinc-100 shadow-sm flex flex-col gap-3"
          >
            {/* Header: User Bubble + Name & Stars */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Initials Avatar */}
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs border ${colorClass} shadow-sm`}>
                  {initial}
                </div>
                {/* Reviewer Details */}
                <div>
                  <h4 className="text-xs font-black text-zinc-800 tracking-tight">
                    {review.reviewerName || "Anonymous"}
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {review.date}
                  </span>
                </div>
              </div>

              {/* Review Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= review.rating
                        ? "fill-amber-500 text-amber-500"
                        : "text-zinc-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Comment Body */}
            <p className="text-xs sm:text-sm text-zinc-600 font-semibold leading-relaxed pl-12">
              {review.text}
            </p>
          </Card>
        );
      })}
    </div>
  );
};
export default ReviewList;
