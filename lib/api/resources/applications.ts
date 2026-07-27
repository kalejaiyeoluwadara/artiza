import { request, upload } from "../client";
import type {
  ApplicationInput,
  ApplicationItem,
  JoinInput,
  JoinResult,
  UploadResult,
} from "../types";

/**
 * The self-application surface. Most routes here need a session — an applicant
 * who found Artiza on their own has to be signed in so the team can reach them
 * — but none needs an admin token, so they live outside `admin`.
 *
 * The two `join` routes are the exception: they back the public `/join` claim
 * link, and deliberately send no token at all. A founding artisan opening a
 * link from WhatsApp has no account, and asking them to make one is the
 * friction the page exists to remove.
 */
export const applicationsResource = (token?: string) => ({
  /** File an application. A second one while the first is pending comes back 409. */
  submit(input: ApplicationInput): Promise<ApplicationItem> {
    return request<ApplicationItem>("/applications", {
      method: "POST",
      body: input,
      token,
    });
  },

  /**
   * Claim a listing from `/join`. Anonymous, and deduped by phone: a number
   * already on Artiza comes back 409.
   */
  join(input: JoinInput): Promise<JoinResult> {
    return request<JoinResult>("/applications/join", {
      method: "POST",
      body: input,
    });
  },

  /** The `/join` page's photo upload. Anonymous twin of `uploadPhotos`. */
  joinPhotos(files: File[], signal?: AbortSignal): Promise<UploadResult[]> {
    const form = new FormData();
    for (const file of files) form.append("files", file);
    return upload<UploadResult[]>("/applications/join/photos", form, { signal });
  },

  /** The caller's latest application, or null — what the CTA reads for its state. */
  mine(signal?: AbortSignal): Promise<ApplicationItem | null> {
    return request<ApplicationItem | null>("/applications/mine", {
      token,
      cache: "no-store",
      signal,
    });
  },

  /** Up to four optional work photos, uploaded before the application is filed. */
  uploadPhotos(files: File[], signal?: AbortSignal): Promise<UploadResult[]> {
    const form = new FormData();
    for (const file of files) form.append("files", file);
    return upload<UploadResult[]>("/applications/photos", form, {
      token,
      signal,
    });
  },
});
