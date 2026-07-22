import type { ApiErrorBody } from "./types";

/**
 * Every failure from the API arrives as one of these, so a caller can branch
 * on `status` or show `message` without knowing whether the request died at
 * the network, at validation, or at the paywall.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string[]>;
  /** Correlation id — quote it when reporting a bug. */
  readonly requestId?: string;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: Record<string, string[]>,
    requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }

  static fromBody(body: ApiErrorBody, fallbackStatus: number): ApiError {
    return new ApiError(
      body.message,
      body.statusCode ?? fallbackStatus,
      body.error ?? "Error",
      body.details,
      body.requestId,
    );
  }

  /** The caller cancelled it. Not a failure — never report one to the user. */
  get isAborted(): boolean {
    return this.code === "Aborted";
  }

  /** The device is offline or the API is unreachable. Worth a retry. */
  get isOffline(): boolean {
    return this.code === "NetworkError";
  }

  /** The session is gone or expired — the caller should send them to sign in. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Signed in, but hasn't paid for this — the unlock prompt belongs here. */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** The first field-level message, for putting under an input. */
  firstDetail(): string | undefined {
    if (!this.details) return undefined;
    return Object.values(this.details)[0]?.[0];
  }
}
