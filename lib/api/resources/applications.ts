import { request, upload } from "../client";
import type {
  ApplicationInput,
  ApplicationItem,
  UploadResult,
} from "../types";

/**
 * The self-application surface. Every route here needs a session — an
 * applicant has to be signed in so the team can reach them — but none needs
 * an admin token, so they live outside `admin`.
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
