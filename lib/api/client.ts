import { ApiError } from "./error";
import type { ApiEnvelope, ApiErrorBody, Paginated } from "./types";

/**
 * Where the Nest API lives. Public because the browser calls it directly —
 * there is no BFF hop, so this has to be readable on both sides.
 */
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1"
).replace(/\/$/, "");

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Backend access token. Omitted for public reads. */
  token?: string;
  query?: Record<string, string | number | boolean | undefined>;
  /** Next's fetch cache controls — only meaningful on the server. */
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

/**
 * The single trip to the API: sends the request, and returns the envelope or
 * throws an ApiError. Everything else in this folder is built on it, so the
 * API's wire format is known in exactly one place.
 */
async function send<T>(path: string, options: RequestOptions): Promise<ApiEnvelope<T>> {
  const { method = "GET", body, token, query, next, cache, signal } = options;

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      ...(next ? { next } : {}),
      ...(cache ? { cache } : {}),
      ...(signal ? { signal } : {}),
    });
  } catch (cause) {
    // A cancelled request is not a failure — the component moved on. It gets
    // its own code so callers can drop it instead of showing an error a user
    // never caused and can do nothing about.
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw new ApiError("Request cancelled.", 0, "Aborted");
    }

    // Nothing came back at all — the API is down, or the device is offline.
    throw new ApiError(
      "Can't reach Artiza right now. Check your connection and try again.",
      0,
      "NetworkError",
    );
  }

  // 204 and friends: nothing to parse.
  if (response.status === 204) {
    return { data: undefined as T } as ApiEnvelope<T>;
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (payload && typeof payload === "object" && "message" in payload) {
      throw ApiError.fromBody(payload as ApiErrorBody, response.status);
    }
    throw new ApiError(
      `Request failed (${response.status}).`,
      response.status,
      response.statusText || "Error",
    );
  }

  return payload as ApiEnvelope<T>;
}

/** The common case: give me the payload, throw if anything went wrong. */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  return (await send<T>(path, options)).data;
}

/**
 * The paginated variant. The API puts the list in `data` and the counters in
 * `meta`, so those are stitched back together here rather than at each call.
 */
export async function requestPaginated<T>(
  path: string,
  options: RequestOptions = {},
): Promise<Paginated<T>> {
  const envelope = await send<T[]>(path, options);
  const items = envelope.data ?? [];

  return {
    items,
    meta: envelope.meta ?? {
      page: 1,
      limit: items.length,
      total: items.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

/**
 * The multipart variant, for `POST /uploads`.
 *
 * It goes around `send` rather than through it because the two disagree on one
 * thing: `Content-Type`. JSON requests set it; a multipart request must *not* —
 * only the browser knows the boundary it generated, and naming the type by hand
 * produces a body the server cannot split.
 */
export async function upload<T>(
  path: string,
  form: FormData,
  options: Pick<RequestOptions, "token" | "query" | "signal"> = {},
): Promise<T> {
  const { token, query, signal } = options;

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
      ...(signal ? { signal } : {}),
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw new ApiError("Upload cancelled.", 0, "Aborted");
    }
    throw new ApiError(
      "The upload didn't reach Artiza. Check your connection and try again.",
      0,
      "NetworkError",
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (payload && typeof payload === "object" && "message" in payload) {
      throw ApiError.fromBody(payload as ApiErrorBody, response.status);
    }
    throw new ApiError(
      `Upload failed (${response.status}).`,
      response.status,
      response.statusText || "Error",
    );
  }

  return (payload as ApiEnvelope<T>).data;
}

export { BASE_URL };
