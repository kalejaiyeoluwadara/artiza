import type { Trade } from "../artisans";

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
  title: string;
  body: string;
  cta: string;
  href: string;
  image: string;
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
