import { request, upload } from "../client";
import type { ArtisanQuery } from "./artisans";
import type {
  AdminApplication,
  AdminArtisan,
  AdminArtisanRequest,
  AdminBannerItem,
  ApplicationFilter,
  ArtisanRequestStatus,
  ArtisanInput,
  ArtisanPatch,
  ArtisanSummary,
  BannerInput,
  OutreachImportResult,
  OutreachLead,
  OutreachLeadInput,
  OutreachLeadPatch,
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

  applications: {
    /** The triage queue. Defaults to pending; `status` widens or narrows it. */
    list(
      status: ApplicationFilter = "pending",
      signal?: AbortSignal,
    ): Promise<AdminApplication[]> {
      return request<AdminApplication[]>("/admin/applications", {
        query: { status },
        token,
        cache: "no-store",
        signal,
      });
    },

    /**
     * Promote a lead into the register. Creates a live artisan from the
     * submitted data — idempotent, so a double click is safe.
     */
    approve(id: string): Promise<AdminApplication> {
      return request<AdminApplication>(`/admin/applications/${id}/approve`, {
        method: "POST",
        token,
      });
    },

    decline(id: string): Promise<AdminApplication> {
      return request<AdminApplication>(`/admin/applications/${id}/decline`, {
        method: "POST",
        token,
      });
    },

    /** Hard delete — an application carries no receipts worth keeping. */
    remove(id: string): Promise<{ deleted: true }> {
      return request<{ deleted: true }>(`/admin/applications/${id}`, {
        method: "DELETE",
        token,
      });
    },
  },

  /**
   * The founding-artisan outreach list. The team's own contact book, and the
   * only management surface with no customer-facing counterpart at all.
   */
  outreach: {
    /** Every lead, oldest first. Unpaginated — the console works the lot. */
    list(signal?: AbortSignal): Promise<OutreachLead[]> {
      return request<OutreachLead[]>("/admin/outreach", {
        token,
        cache: "no-store",
        signal,
      });
    },

    /**
     * Merge a parsed CSV in. Matches on phone number and keeps the progress on
     * anyone already there, so re-importing a corrected file mid-campaign is
     * safe — the answer carries the whole list back so the table can swap
     * without a second read.
     */
    import(leads: OutreachLeadInput[]): Promise<OutreachImportResult> {
      return request<OutreachImportResult>("/admin/outreach/import", {
        method: "POST",
        body: { leads },
        token,
      });
    },

    /** Partial — a corrected name, a status, a follow-up date. */
    update(id: string, patch: OutreachLeadPatch): Promise<OutreachLead> {
      return request<OutreachLead>(`/admin/outreach/${id}`, {
        method: "PATCH",
        body: patch,
        token,
      });
    },

    /**
     * Records that the message was *opened* for this lead. Artiza never sends
     * one — the operator reads the draft in WhatsApp and sends it themselves.
     */
    markContacted(id: string): Promise<OutreachLead> {
      return request<OutreachLead>(`/admin/outreach/${id}/contacted`, {
        method: "POST",
        token,
      });
    },

    /** Gone for good. Nothing else in the app points at a lead. */
    remove(id: string): Promise<{ deleted: true }> {
      return request<{ deleted: true }>(`/admin/outreach/${id}`, {
        method: "DELETE",
        token,
      });
    },
  },

  /**
   * Demand the register couldn't answer. Filed anonymously from the customer
   * app's "can't find who you need?" form; worked from here.
   */
  requests: {
    /** Newest first. Omit `status` for everything, including what's been closed. */
    list(
      status?: ArtisanRequestStatus,
      signal?: AbortSignal,
    ): Promise<AdminArtisanRequest[]> {
      return request<AdminArtisanRequest[]>("/admin/requests", {
        query: { status },
        token,
        cache: "no-store",
        signal,
      });
    },

    /** Move it along, or write down who was called. */
    update(
      id: string,
      patch: { status?: ArtisanRequestStatus; notes?: string },
    ): Promise<AdminArtisanRequest> {
      return request<AdminArtisanRequest>(`/admin/requests/${id}`, {
        method: "PATCH",
        body: patch,
        token,
      });
    },

    /** For prank numbers and duplicates. Nothing else points at a request. */
    remove(id: string): Promise<{ deleted: true }> {
      return request<{ deleted: true }>(`/admin/requests/${id}`, {
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
