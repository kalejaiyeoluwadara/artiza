import { request, upload } from "../client";
import type { ArtisanQuery } from "./artisans";
import type {
  AdminArtisan,
  AdminBannerItem,
  ArtisanInput,
  ArtisanPatch,
  ArtisanSummary,
  BannerInput,
  RegisterStatus,
  UploadFolder,
  UploadResult,
} from "../types";

export interface AdminArtisanQuery extends ArtisanQuery {
  /** Defaults to `active` — retired artisans have to be asked for. */
  status?: RegisterStatus;
}

/**
 * The management surface. Every route here is `role: "admin"` and answers 403
 * to anyone else, so nothing in this file is safe to call from a screen that a
 * customer can reach.
 *
 * Reads are `no-store` throughout. The customer register is cached for a minute
 * because it changes rarely; the console is the thing that changes it, and an
 * editor looking at a stale copy of the row they just saved is the one place
 * that cache would actively lie.
 */
export const adminResource = (token?: string) => ({
  artisans: {
    /**
     * The register for management: the public query parameters, plus `status`,
     * and the sealed half of every record in the response.
     */
    list(
      query: AdminArtisanQuery = {},
      signal?: AbortSignal,
    ): Promise<AdminArtisan[]> {
      return request<AdminArtisan[]>("/admin/artisans", {
        query: { ...query },
        token,
        cache: "no-store",
        signal,
      });
    },

    /** One full record for the edit screen. Finds retired artisans too. */
    get(id: string, signal?: AbortSignal): Promise<AdminArtisan> {
      return request<AdminArtisan>(`/admin/artisans/${id}`, {
        token,
        cache: "no-store",
        signal,
      });
    },

    create(input: ArtisanInput): Promise<ArtisanSummary> {
      return request<ArtisanSummary>("/admin/artisans", {
        method: "POST",
        body: input,
        token,
      });
    },

    /** Partial — send only what changed. */
    update(id: string, patch: ArtisanPatch): Promise<ArtisanSummary> {
      return request<ArtisanSummary>(`/admin/artisans/${id}`, {
        method: "PATCH",
        body: patch,
        token,
      });
    },

    /** Explicit rather than a flip: the caller already knows the current state. */
    setFeatured(id: string, featured: boolean): Promise<ArtisanSummary> {
      return request<ArtisanSummary>(`/admin/artisans/${id}/featured`, {
        method: "PATCH",
        body: { featured },
        token,
      });
    },

    /**
     * Retires, never deletes. Unlocks and receipts still point at this record,
     * and a customer who paid keeps the contact they bought.
     */
    retire(id: string): Promise<{ deactivated: true }> {
      return request<{ deactivated: true }>(`/admin/artisans/${id}`, {
        method: "DELETE",
        token,
      });
    },
  },

  banners: {
    /** Every banner, inactive ones included — the public rail hides those. */
    list(signal?: AbortSignal): Promise<AdminBannerItem[]> {
      return request<AdminBannerItem[]>("/admin/banners", {
        token,
        cache: "no-store",
        signal,
      });
    },

    create(input: BannerInput): Promise<AdminBannerItem> {
      return request<AdminBannerItem>("/admin/banners", {
        method: "POST",
        body: input,
        token,
      });
    },

    update(id: string, patch: Partial<BannerInput>): Promise<AdminBannerItem> {
      return request<AdminBannerItem>(`/admin/banners/${id}`, {
        method: "PATCH",
        body: patch,
        token,
      });
    },

    /** Hard delete — a banner carries no history worth keeping. */
    remove(id: string): Promise<{ deleted: true }> {
      return request<{ deleted: true }>(`/admin/banners/${id}`, {
        method: "DELETE",
        token,
      });
    },
  },

  uploads: {
    /**
     * One image to Cloudinary, cropped for the slot it is going into. The URL
     * that comes back is what gets stored on the artisan or banner — upload
     * first, save second.
     */
    one(
      file: File,
      folder: UploadFolder = "work",
      signal?: AbortSignal,
    ): Promise<UploadResult> {
      const form = new FormData();
      form.append("file", file);
      return upload<UploadResult>("/uploads", form, {
        token,
        query: { folder },
        signal,
      });
    },

    /** Up to eight at once — how a portfolio gets filled in one pass. */
    many(
      files: File[],
      folder: UploadFolder = "work",
      signal?: AbortSignal,
    ): Promise<UploadResult[]> {
      const form = new FormData();
      for (const file of files) form.append("files", file);
      return upload<UploadResult[]>("/uploads/batch", form, {
        token,
        query: { folder },
        signal,
      });
    },

    /**
     * For a photo that already lives somewhere else — a link the artisan sent
     * over WhatsApp, a shot on the team's Drive.
     *
     * Cloudinary fetches it and re-hosts it, so what comes back is an ordinary
     * asset with the folder's crop applied. The pasted URL is never stored:
     * a link that dies next month must not be able to blank an artisan's card.
     */
    fromUrl(
      url: string,
      folder: UploadFolder = "work",
      signal?: AbortSignal,
    ): Promise<UploadResult> {
      return request<UploadResult>("/uploads/from-url", {
        method: "POST",
        body: { url },
        query: { folder },
        token,
        signal,
      });
    },

    /** The public id contains slashes, so it has to go through the path encoded. */
    remove(publicId: string): Promise<unknown> {
      return request(`/uploads/${encodeURIComponent(publicId)}`, {
        method: "DELETE",
        token,
      });
    },
  },
});
