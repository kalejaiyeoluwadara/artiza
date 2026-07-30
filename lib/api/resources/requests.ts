import { request } from "../client";
import type { ArtisanRequestInput, ArtisanRequestReceipt } from "../types";

/**
 * Demand the register couldn't answer.
 *
 * One route, and it sends no token on purpose. The person filing this has just
 * failed to find what they came for — putting a sign-up in front of them is how
 * you lose the lead *and* the signal that the trade is missing. The number they
 * leave is the whole transaction.
 */
export const requestsResource = () => ({
  /**
   * Ask Artiza to find an artisan. Never conflicts: a repeat ask for the same
   * trade from the same number inside a day comes back as the original, so the
   * form can always show its confirmation.
   */
  submit(input: ArtisanRequestInput): Promise<ArtisanRequestReceipt> {
    return request<ArtisanRequestReceipt>("/requests", {
      method: "POST",
      body: input,
    });
  },
});
