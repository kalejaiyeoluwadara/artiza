import { BASE_URL } from "./api";
import { ApiError } from "./api/error";
import type { ApiEnvelope, UploadResult } from "./api/types";

/**
 * Getting a photo of somebody's work onto Artiza, from a phone, on a bad line.
 *
 * The old path sent the camera's original file to our API, which sent it on to
 * Cloudinary, and showed a spinner until both legs finished. Three things were
 * wrong with that, and this module fixes all three:
 *
 *  1. **The bytes were mostly wasted.** A phone photo is 3–6 MB at 4000×3000
 *     and Cloudinary immediately crops it to 1600×1067 — so nine tenths of what
 *     an artisan uploaded on mobile data was thrown away on arrival. The resize
 *     now happens before the upload, where it costs nothing.
 *  2. **The file crossed the network twice.** It now goes straight to
 *     Cloudinary under a signature our API issues in a few hundred bytes.
 *  3. **`fetch` cannot report upload progress**, so a slow upload looked
 *     frozen rather than slow. `XMLHttpRequest` can, so this uses it.
 *
 * Uplink is the scarce resource here — mobile connections are far slower going
 * up than coming down, which is exactly the direction a photo travels.
 */

/**
 * The longest edge we send.
 *
 * Above the 1600px box `work` photos land in, deliberately: that box is a fit
 * rather than a crop, so the longest edge survives at 1600 whichever way the
 * photo was taken. 2048 leaves headroom for the square portrait crop as well,
 * while still cutting a 12-megapixel photo by roughly 90%.
 */
const MAX_EDGE = 2048;

/** Enough to keep a finished tiling job readable; low enough to stay small. */
const QUALITY = 0.82;

/** Below this a re-encode usually makes the file bigger, not smaller. */
const ALREADY_SMALL = 400 * 1024;

/**
 * Shrinks a camera photo to something worth uploading.
 *
 * Returns the original file untouched whenever it can't do better — a format
 * the browser can't decode (Android has no HEIC decoder, and iPhones shoot
 * HEIC), a canvas that comes back empty, a re-encode that grew. Every one of
 * those is a photo that still uploads; none of them is worth failing over,
 * because the alternative to a big upload is no listing photo at all.
 */
export async function shrinkImage(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function") return file;
  if (file.size <= ALREADY_SMALL) return file;

  let bitmap: ImageBitmap;
  try {
    // `from-image` applies the EXIF rotation the camera recorded. Without it a
    // photo taken sideways uploads sideways, and Cloudinary's crop then takes
    // the wrong half of it.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= ALREADY_SMALL) return file;

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);

    // WebP first: same quality at roughly two thirds the bytes, and it keeps
    // transparency where JPEG would flatten it onto black. Safari before 14
    // hands back a PNG instead, which the check below catches.
    const blob =
      (await toBlob(canvas, "image/webp", QUALITY)) ??
      (await toBlob(canvas, "image/jpeg", QUALITY));

    if (!blob || blob.size >= file.size) return file;

    const extension = blob.type === "image/webp" ? "webp" : "jpg";
    return new File([blob], `${baseName(file.name)}.${extension}`, {
      type: blob.type,
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(
      // A browser that doesn't support the type silently encodes PNG instead,
      // which is larger than the original and would defeat the whole exercise.
      (blob) => resolve(blob?.type === type ? blob : null),
      type,
      quality,
    ),
  );
}

function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, "") || "photo";
}

// ── The upload itself ────────────────────────────────────────────────────────

interface Signature {
  url: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  transformation: string;
  allowedFormats: string;
}

/** Cloudinary's answer, narrowed to the parts an Artiza asset is made of. */
interface CloudinaryAsset {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * One file, straight to Cloudinary, reporting progress as it goes.
 *
 * `XMLHttpRequest` rather than `fetch` for the single reason that it has an
 * upload progress event and `fetch` still doesn't. On the connection this is
 * built for, an upload can run for half a minute — and half a minute of a
 * motionless spinner is indistinguishable from a broken app.
 */
function putDirect(
  file: File,
  signature: Signature,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signature.apiKey);
    form.append("timestamp", String(signature.timestamp));
    form.append("signature", signature.signature);
    // Signed, so these have to go back exactly as they were issued. Changing
    // one produces a request Cloudinary refuses, which is the point of them.
    form.append("folder", signature.folder);
    form.append("transformation", signature.transformation);
    form.append("allowed_formats", signature.allowedFormats);

    const request = new XMLHttpRequest();
    request.open("POST", signature.url);

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    });

    request.addEventListener("load", () => {
      let payload: unknown = null;
      try {
        payload = JSON.parse(request.responseText);
      } catch {
        /* handled below — an unparseable body is a failed upload */
      }

      if (request.status >= 200 && request.status < 300 && payload) {
        const asset = payload as CloudinaryAsset;
        // The last tick never arrives for a request that finished, so the tile
        // would sit at 98% until the whole batch resolved.
        onProgress(1);
        resolve({
          url: asset.secure_url,
          publicId: asset.public_id,
          width: asset.width,
          height: asset.height,
          format: asset.format,
          bytes: asset.bytes,
        });
        return;
      }

      reject(
        new ApiError(
          "The upload didn't go through. Try that photo again.",
          request.status,
          "UploadFailed",
        ),
      );
    });

    request.addEventListener("error", () =>
      reject(
        new ApiError(
          "The upload didn't reach Artiza. Check your connection and try again.",
          0,
          "NetworkError",
        ),
      ),
    );

    request.addEventListener("abort", () =>
      reject(new ApiError("Upload cancelled.", 0, "Aborted")),
    );

    signal?.addEventListener("abort", () => request.abort(), { once: true });

    request.send(form);
  });
}

/** The signing call. Small enough that its own latency is not worth caching. */
async function sign(signal?: AbortSignal): Promise<Signature> {
  const response = await fetch(`${BASE_URL}/uploads/signature`, {
    method: "POST",
    headers: { Accept: "application/json" },
    ...(signal ? { signal } : {}),
  });

  if (!response.ok) throw new Error(`Signing failed (${response.status}).`);

  const body = (await response.json()) as ApiEnvelope<Signature>;
  return body.data;
}

export interface UploadProgress {
  /** 0–1 across the whole batch, weighted by how big each file is. */
  fraction: number;
  /**
   * 0–1 per file, in the order they were picked.
   *
   * Reported separately from the batch total because the uploads run
   * concurrently: three photos are in flight at once, so a single number
   * cannot say how far along any one of them is, and a tile that guesses from
   * the batch average fills in the wrong order.
   */
  files: number[];
  /** How many have finished, for the "2 of 4" line. */
  done: number;
  total: number;
}

/**
 * Upload a set of work photos and hand back their Artiza URLs.
 *
 * Files go up **in parallel** — the connection is the bottleneck, not the
 * server, and three simultaneous uploads saturate it far better than one at a
 * time without swamping a phone's radio.
 *
 * If the signing call fails the whole batch falls back to the old relay route,
 * which still works and is simply slower. That is the only failure worth
 * catching here: a signature that can't be issued means the direct path is
 * unavailable (an outage, a proxy eating the route), and losing the photos over
 * an optimisation would be a poor trade.
 */
export async function uploadWorkPhotos(
  files: File[],
  {
    onProgress,
    signal,
    relay,
  }: {
    onProgress?: (progress: UploadProgress) => void;
    signal?: AbortSignal;
    /** The old path: one multipart request through the API. */
    relay: (files: File[], signal?: AbortSignal) => Promise<UploadResult[]>;
  },
): Promise<UploadResult[]> {
  // Resizing is CPU-bound and independent per file, so it happens for the whole
  // batch before a byte is sent — by the time the first upload starts, every
  // file's real size is known and the progress bar can be honest.
  const prepared = await Promise.all(files.map(shrinkImage));

  let signature: Signature;
  try {
    signature = await sign(signal);
  } catch {
    return relay(prepared, signal);
  }

  const sizes = prepared.map((file) => file.size);
  const totalBytes = sizes.reduce((sum, size) => sum + size, 0) || 1;
  const sent = new Array<number>(prepared.length).fill(0);
  let done = 0;

  const report = () =>
    onProgress?.({
      fraction: sent.reduce((sum, bytes) => sum + bytes, 0) / totalBytes,
      files: sent.map((bytes, index) => bytes / (sizes[index] || 1)),
      done,
      total: prepared.length,
    });

  report();

  const results = new Array<UploadResult>(prepared.length);
  let next = 0;

  // Three workers pulling from a shared index: a fixed concurrency without a
  // dependency, and it keeps the order of the results matching the order the
  // photos were picked in.
  async function worker() {
    for (let index = next++; index < prepared.length; index = next++) {
      results[index] = await putDirect(
        prepared[index],
        signature,
        (fraction) => {
          sent[index] = fraction * sizes[index];
          report();
        },
        signal,
      );
      done += 1;
      report();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(3, prepared.length) }, worker),
  );

  return results;
}
