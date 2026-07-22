import { request } from "../client";
import type { PendingReviews, ReviewItem } from "../types";

export interface SubmitReviewInput {
  rating: number;
  text: string;
}

export const reviewsResource = (token?: string) => ({
  /**
   * Rate an artisan after a job. Only open to customers who unlocked them, and
   * only once — a repeat comes back 409.
   */
  submit(artisanId: string, input: SubmitReviewInput): Promise<ReviewItem> {
    return request<ReviewItem>(`/artisans/${artisanId}/reviews`, {
      method: "POST",
      body: input,
      token,
    });
  },

  /** Unlocked but not yet reviewed — what the rating prompts are built from. */
  pending(): Promise<PendingReviews> {
    return request<PendingReviews>("/reviews/pending", {
      token,
      cache: "no-store",
    });
  },
});
