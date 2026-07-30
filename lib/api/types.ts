import type { BannerType, Trade } from "../artisans";
import type { ApprovalStatus, OutreachStatus } from "../outreach";

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
  /** What they call it, when `trade` is `other`. */
  customTrade?: string;
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
  facebook?: string;
  snapchat?: string;
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
  /** Required when `trade` is `other`; omitted otherwise. */
  customTrade?: string;
  location: string;
  yearsExperience: number;
  /** MSISDN, no + or spaces: 2348031234567. */
  phone: string;
  whatsapp?: string;
  /** All bare — no @, no URL. */
  instagram?: string;
  facebook?: string;
  snapchat?: string;
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

/**
 * Which door an application came through: the in-app sheet, or the public
 * `/join` claim link the team sends to artisans it has already worked with.
 */
export type ApplicationSource = "app" | "join";

/** An `/join` submission: an application plus the consent that made it legal. */
export interface JoinInput extends ApplicationInput {
  /** Always true — the API rejects anything else. */
  consent: true;
}

/**
 * What `/join` gets back. `published` is the field the page acts on: it decides
 * between "you are live" and "we will be in touch", so the client never has to
 * infer that from a status it would then have to keep in step with the server's
 * auto-publish setting.
 */
export interface JoinResult {
  id: string;
  status: ApplicationStatus;
  name: string;
  trade: Trade;
  customTrade?: string;
  published: boolean;
  /**
   * The live listing this became. Only set when `published` — the id the
   * just-joined preview on home is keyed to, so tapping that card opens the
   * real profile rather than a stand-in. See `lib/applications/just-joined.ts`.
   */
  artisanId?: string;
  createdAt: string;
}

/** The whole record, as the console triages it. */
export interface AdminApplication {
  id: string;
  name: string;
  trade: Trade;
  customTrade?: string;
  location: string;
  yearsExperience: number;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  snapchat?: string;
  note: string;
  services: string[];
  work: string[];
  status: ApplicationStatus;
  source: ApplicationSource;
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
  facebook?: string;
  snapchat?: string;
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
  facebook?: string;
  snapchat?: string;
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
  /** Required when `trade` is `other`; omitted otherwise. */
  customTrade?: string;
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

// ── Founding-artisan outreach ──────────────────────────────────────────────

/**
 * One artisan on the team's own contact list. Admin-only and never customer
 * facing: this is the list Artiza's register is being built out of, held in
 * the console so nobody has to save forty numbers to a phone to message them.
 */
export interface OutreachLead {
  id: string;
  name: string;
  /** `2348031234567` when it could be read as one; the raw text otherwise. */
  phone: string;
  /** Whether `phone` is a number `wa.me` will open a chat for. */
  whatsappReady: boolean;
  trade: Trade;
  customTrade?: string;
  outreachStatus: OutreachStatus;
  approvalStatus: ApprovalStatus;
  notes: string;
  /** Stamped when a message was last opened for them, not when it was sent. */
  lastContactedAt?: string;
  followUpAt?: string;
  createdAt: string;
}

/** One parsed CSV row on its way to the import endpoint. */
export interface OutreachLeadInput {
  name: string;
  phone: string;
  trade?: Trade;
  customTrade?: string;
  outreachStatus?: OutreachStatus;
  approvalStatus?: ApprovalStatus;
  notes?: string;
  followUpAt?: string | null;
}

/** Everything the console is allowed to correct after the fact. */
export type OutreachLeadPatch = Partial<OutreachLeadInput>;

/** What an import answers with: what it did, and the list as it now stands. */
export interface OutreachImportResult {
  created: number;
  updated: number;
  skipped: number;
  leads: OutreachLead[];
}

// ── Requests: demand the register couldn't answer ──────────────────────────

/**
 * What the team has done about a request. The inverse of the outreach list:
 * that is supply being chased, this is a customer waiting on a call back.
 */
export type ArtisanRequestStatus = "open" | "sourcing" | "matched" | "closed";

/** Which dead end the customer hit before asking. */
export type ArtisanRequestSource = "home" | "search";

/** What the "can't find who you need?" form sends. */
export interface ArtisanRequestInput {
  /**
   * Who they need, in their own words — free text, not a `Trade`. The form
   * only opens when the register had nobody, so the answer worth having is
   * exactly the one the taxonomy doesn't cover yet.
   */
  need: string;
  details: string;
  /** MSISDN, no + or spaces: 2348031234567. */
  phone: string;
  source?: ArtisanRequestSource;
  /** The search that found nobody, verbatim — the most useful field on the row. */
  query?: string;
}

/**
 * The receipt. Deliberately thin — the route is anonymous, so it echoes back
 * only enough for the form to name the ask in its confirmation.
 */
export interface ArtisanRequestReceipt {
  id: string;
  need: string;
  createdAt: string;
}

/** The whole record, as the console works it. */
export interface AdminArtisanRequest {
  id: string;
  need: string;
  details: string;
  phone: string;
  source: ArtisanRequestSource;
  query?: string;
  status: ArtisanRequestStatus;
  notes: string;
  createdAt: string;
}

// ── Accounts (admin) ───────────────────────────────────────────────────────

/**
 * A customer as the console sees them. Wider than `UserProfile` — the phone
 * number, how they sign in, and what they have actually bought.
 */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  /** Unspent bundle unlocks. */
  credits: number;
  /** Artisans this customer has paid to reach. */
  unlocks: number;
  /** True when the account has a Google identity attached. */
  google: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export type UserRoleFilter = UserRole | "all";

/** `credits` puts the largest unspent balances first. */
export type UserSort = "recent" | "name" | "credits";

export interface AdminUserQuery {
  search?: string;
  role?: UserRoleFilter;
  sort?: UserSort;
  page?: number;
  limit?: number;
}

/**
 * One hand-made adjustment to a balance, as it sits on the audit trail.
 * Append-only: a mistake is corrected by granting the opposite, never by
 * editing the row.
 */
export interface CreditGrant {
  id: string;
  /** Signed. Negative is a revocation. */
  amount: number;
  /** The balance once this landed. */
  balanceAfter: number;
  reason: string;
  /** The admin who did it, as identified at the time. */
  grantedByName?: string;
  createdAt: string;
}

/** What an adjustment answers with: the account as it now stands, and the row. */
export interface AdjustCreditsResult {
  user: AdminUser;
  grant: CreditGrant;
}

export interface AdjustCreditsInput {
  /** Whole unlocks. Negative takes them back. Never zero, ±20 at a time. */
  amount: number;
  /** Why. Kept forever on the trail — the API requires it. */
  reason: string;
}
