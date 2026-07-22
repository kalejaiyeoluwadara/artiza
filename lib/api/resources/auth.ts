import { request } from "../client";
import type { AuthResult, UserProfile } from "../types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
  /** MSISDN, no + or spaces — e.g. 2348031234567. */
  phone?: string;
}

/**
 * These are called from the NextAuth credentials provider and from the sign-up
 * form, not from screens. Everything else reads the session instead.
 */
export const authResource = (token?: string) => ({
  login(input: LoginInput): Promise<AuthResult> {
    return request<AuthResult>("/auth/login", { method: "POST", body: input });
  },

  register(input: RegisterInput): Promise<AuthResult> {
    return request<AuthResult>("/auth/register", { method: "POST", body: input });
  },

  /** Exchanges a refresh token for a new pair. The old one stops working. */
  refresh(refreshToken: string): Promise<AuthResult> {
    return request<AuthResult>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  },

  /** The live profile — credits included, which the session copy can lag on. */
  me(): Promise<UserProfile> {
    return request<UserProfile>("/auth/me", { token });
  },

  logout(): Promise<{ loggedOut: true }> {
    return request<{ loggedOut: true }>("/auth/logout", { method: "POST", token });
  },
});
