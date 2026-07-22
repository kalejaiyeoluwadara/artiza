import { request, requestPaginated } from "../client";
import type {
  BundleResult,
  Paginated,
  PaymentStatus,
  TransactionItem,
  UnlockedIds,
  UnlockResult,
} from "../types";

export const unlocksResource = (token?: string) => ({
  /** Artisan ids this customer has already paid for. */
  list(signal?: AbortSignal): Promise<UnlockedIds> {
    return request<UnlockedIds>("/unlocks", { token, cache: "no-store", signal });
  },

  /**
   * The ₦500 action. Returns `unlocked: true` when a bundle credit covered it,
   * or a `payment.authorizationUrl` to send the customer to Paystack. The
   * unlock is only granted on the webhook — never assume it from a redirect.
   */
  unlock(artisanId: string): Promise<UnlockResult> {
    return request<UnlockResult>("/unlocks", {
      method: "POST",
      body: { artisanId },
      token,
    });
  },

  /** Buys credits. Always goes through Paystack — there is no free path. */
  buyBundle(bundleCode = "3-pack"): Promise<BundleResult> {
    return request<BundleResult>("/bundles", {
      method: "POST",
      body: { bundleCode },
      token,
    });
  },

  transactions(
    page = 1,
    limit = 20,
    signal?: AbortSignal,
  ): Promise<Paginated<TransactionItem>> {
    return requestPaginated<TransactionItem>("/transactions", {
      query: { page, limit },
      token,
      cache: "no-store",
      signal,
    });
  },

  /**
   * For the screen the customer lands on after checkout. Safe to poll — the
   * API settles idempotently, so calling it twice cannot double-credit.
   */
  verifyPayment(reference: string): Promise<PaymentStatus> {
    return request<PaymentStatus>(`/payments/verify/${reference}`, {
      token,
      cache: "no-store",
    });
  },
});
