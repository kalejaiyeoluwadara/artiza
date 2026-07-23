import type { BannerType, Trade } from "../artisans";

/**
 * The envelope every Artiza endpoint answers in. The client unwraps it, so
 * nothing above `lib/api` ever sees `success` or `data` — callers get the
 * payload or an ApiError.
 */
export interface ApiEnvelope<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PageMeta;
  timestamp: string;
  path: string;
  requestId: string;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  /** Field-level validation detail, keyed by field name. */
  details?: Record<string, string[]>;
  timestamp: string;
  path: string;
  requestId: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** A list plus its counters, for the endpoints that paginate. */
export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export type UserRole = "customer" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  credits: number;
  createdAt: string;
}

export interface AuthResult {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  /** Access-token lifetime in seconds. */
  expiresIn: number;
}

// ── Artisans ───────────────────────────────────────────────────────────────

/**
 * The public half of a profile. Deliberately missing `phone` and `contact` —
 * those live behind `artisans.contact()` and only open after an unlock.
 */
export interface ArtisanSummary {
  id: string;
  name: string;
  trade: Trade;
  location: string;
  yearsExperience: number;
  jobsCompleted: number;
  recentUnlocks: number;
  rating: number;
  reviewCount: number;
  photo: string;
  work: string[];
  featured: boolean;
  verifiedSince: string;
  note: string;
  services: string[];
  /** Public: deciding whether to pay needs to know when they work. */
  respondsIn: string;
  availability: string;
}

/** Everything the ₦500 buys. */
export interface ArtisanContact {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  altPhone?: string;
  respondsIn: string;
  availability: string;
}

export interface BannerItem {
  id: string;
  /** The eyebrow label over the title. Offer is the historical default. */
  type: BannerType;
  title: string;
  body: string;
  cta: string;
  href: string;
  image: string;
}

/**
 * `GET /home` — the register and the promo rail in one envelope, so the
 * landing page costs one round trip instead of two. The API composes it from
 * the same cached reads `/artisans` and `/banners` serve.
 */
export interface HomePayload {
  artisans: ArtisanSummary[];
  banners: BannerItem[];
}

// ── Unlocks, payments, receipts ────────────────────────────────────────────

export interface PaymentInitialization {
  /** Send the customer here to pay. */
  authorizationUrl: string;
  reference: string;
  amount: number;
  purpose: "unlock" | "bundle";
}

export interface TransactionItem {
  id: string;
  type: "unlock" | "bundle";
  artisanName?: string;
  artisanTrade?: string;
  amount: number;
  date: string;
  reference: string;
}

/**
 * Two outcomes in one shape. `unlocked: true` means a credit covered it and
 * the contact is open now; `unlocked: false` means `payment` carries a
 * Paystack link and the unlock lands when the webhook confirms it.
 */
export interface UnlockResult {
  unlocked: boolean;
  creditsRemaining: number;
  transaction?: TransactionItem;
  payment?: PaymentInitialization;
  alreadyUnlocked?: boolean;
}

export interface BundleResult {
  payment: PaymentInitialization;
  credits: number;
}

export interface UnlockedIds {
  artisanIds: string[];
  count: number;
}

export interface PaymentStatus {
  reference: string;
  status: "pending" | "success" | "failed" | "abandoned";
  purpose: "unlock" | "bundle";
  amount: number;
  channel?: string;
  paidAt?: string;
  /** True once the unlock or the credits have actually been applied. */
  fulfilled: boolean;
}

// ── Reviews ────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  /** Pre-rendered relative time, e.g. "2 weeks ago". */
  when: string;
  text: string;
  createdAt: string;
}

export interface PendingReview {
  artisanId: string;
  unlockedAt: string;
  unlockedWhen: string;
}

export interface PendingReviews {
  pending: PendingReview[];
  count: number;
}

// ── Applications ─────────────────────────────────────────────────────────────

export type ApplicationStatus = "pending" | "approved" | "declined";

/**
 * What an artisan submits to apply for a listing. Lighter than `ArtisanInput`:
 * the team-only fields (portrait, reply window, verification month) are filled
 * in at approval, not by the applicant.
 */
export interface ApplicationInput {
  name: string;
  trade: Trade;
  location: string;
  yearsExperience: number;
  /** MSISDN, no + or spaces: 2348031234567. */
  phone: string;
  whatsapp?: string;
  note: string;
  services?: string[];
  /** Cloudinary URLs from `POST /applications/photos`. */
  work?: string[];
}

/** What the applicant reads back — enough to show a pending state on the CTA. */
export interface ApplicationItem {
  id: string;
  status: ApplicationStatus;
  name: string;
  trade: Trade;
  createdAt: string;
}

/** The whole record, as the console triages it. */
export interface AdminApplication {
  id: string;
  name: string;
  trade: Trade;
  location: string;
  yearsExperience: number;
  phone: string;
  whatsapp?: string;
  note: string;
  services: string[];
  work: string[];
  status: ApplicationStatus;
  /** The live artisan an approved application became. */
  artisanId?: string;
  createdAt: string;
}

/** Which slice of the triage queue to read. */
export type ApplicationFilter = "pending" | "approved" | "declined" | "all";

// ── Admin ──────────────────────────────────────────────────────────────────

/**
 * The whole record, as only `/admin/artisans` returns it. The public shape
 * plus the sealed half, the soft-delete flag and the timestamps — everything
 * the console needs to correct a wrong number or bring a listing back.
 */
export interface AdminArtisan extends ArtisanSummary {
  phone: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  altPhone?: string;
  /** False once retired: the record survives, the listing does not. */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Which half of the register to read. Retired artisans are opt-in. */
export type RegisterStatus = "active" | "retired" | "all";

/**
 * The sealed half as the admin writes it. Customers read this shape through
 * `ArtisanContact`, which flattens it — here it stays nested, because that is
 * how `POST /admin/artisans` takes it.
 */
export interface ContactInput {
  whatsapp?: string;
  instagram?: string;
  email?: string;
  altPhone?: string;
  respondsIn: string;
  availability: string;
}

/**
 * Everything the team fills in for a new listing. Mirrors `CreateArtisanDto`
 * on the API, limits included — the form validates against the same numbers so
 * a 422 is the exception rather than the way you find out.
 */
export interface ArtisanInput {
  name: string;
  trade: Trade;
  location: string;
  yearsExperience: number;
  /** MSISDN, no + or spaces: 2348031234567. */
  phone: string;
  contact: ContactInput;
  /** Cloudinary URL from `POST /uploads`. Upload first, create second. */
  photo: string;
  work?: string[];
  featured?: boolean;
  /** `Mmm YYYY`, e.g. "Mar 2026". */
  verifiedSince: string;
  note: string;
  services?: string[];
  /** Imports only — an ordinary listing starts at zero and earns the number. */
  jobsCompleted?: number;
}

/** A partial write. `isActive: true` is how a retired artisan comes back. */
export type ArtisanPatch = Partial<ArtisanInput> & { isActive?: boolean };

/** The banner as admin sees it — ordering and the active flag included. */
export interface AdminBannerItem extends BannerItem {
  position: number;
  isActive: boolean;
}

export interface BannerInput {
  /** The eyebrow label over the title. Omitted, the API defaults it to offer. */
  type?: BannerType;
  title: string;
  body: string;
  cta: string;
  /** A path beginning with "/", never an absolute URL. */
  href: string;
  image: string;
  position?: number;
  isActive?: boolean;
}

/** Where an upload landed, and the crop it was given. */
export interface UploadResult {
  url: string;
  /** Contains slashes — URL-encode it before a DELETE. */
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/** The crop the API applies. Pick the one that matches the slot. */
export type UploadFolder = "portraits" | "work" | "banners";
