export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type Role = "CLIENT" | "AGENT" | "PARTNER" | "ADMIN";

export interface AuthUser {
  id: string;
  role: Role;
  /** Présent sur les jetons émis après ce changement ; absent sur d'anciens jetons déjà en cache. */
  name?: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
