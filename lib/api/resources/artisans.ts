import { request, requestPaginated } from "../client";
import type { Trade } from "../../artisans";
import type {
  ArtisanContact,
  ArtisanSummary,
  Paginated,
  ReviewItem,
} from "../types";

export interface ArtisanQuery {
  trade?: Trade;
  q?: string;
  minRating?: number;
  featured?: boolean;
  sort?: "featured" | "rating" | "trending" | "newest";
}

/** How long a browse response stays fresh. The register changes rarely. */
const REGISTER_REVALIDATE = 60;

export const artisansResource = (token?: string) => ({
  /**
   * The whole active register, public fields only. Filtering and the home
   * rails still happen client-side — Ilisan is one town, and a chip tap that
   * re-renders from memory beats one that drops back into skeletons.
   */
  list(query: ArtisanQuery = {}): Promise<ArtisanSummary[]> {
    return request<ArtisanSummary[]>("/artisans", {
      query: { ...query },
      next: { revalidate: REGISTER_REVALIDATE, tags: ["artisans"] },
    });
  },

  get(id: string): Promise<ArtisanSummary> {
    return request<ArtisanSummary>(`/artisans/${id}`, {
      next: { revalidate: REGISTER_REVALIDATE, tags: ["artisans", `artisan:${id}`] },
    });
  },

  /**
   * The sealed half. 403 until this customer has unlocked them — catch
   * `ApiError.isForbidden` and show the unlock prompt rather than an error.
   */
  contact(id: string): Promise<ArtisanContact> {
    return request<ArtisanContact>(`/artisans/${id}/contact`, {
      token,
      cache: "no-store",
    });
  },

  reviews(id: string, page = 1, limit = 20): Promise<Paginated<ReviewItem>> {
    return requestPaginated<ReviewItem>(`/artisans/${id}/reviews`, {
      query: { page, limit },
      next: { revalidate: REGISTER_REVALIDATE, tags: [`artisan:${id}:reviews`] },
    });
  },
});
