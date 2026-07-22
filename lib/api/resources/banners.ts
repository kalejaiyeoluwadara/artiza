import { request } from "../client";
import type { BannerItem } from "../types";

export const bannersResource = () => ({
  /** The promo rail, already ordered by the API. */
  list(): Promise<BannerItem[]> {
    return request<BannerItem[]>("/banners", {
      next: { revalidate: 300, tags: ["banners"] },
    });
  },
});
