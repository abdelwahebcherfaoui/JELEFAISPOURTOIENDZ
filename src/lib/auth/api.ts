import { apiFetch } from "../api";
import type { AuthTokens, LoginPayload, SignupPayload } from "./types";

export function signup(payload: SignupPayload) {
  return apiFetch<AuthTokens>("/api/auth/signup", { method: "POST", body: payload });
}

export function login(payload: LoginPayload) {
  return apiFetch<AuthTokens>("/api/auth/login", { method: "POST", body: payload });
}

/**
 * Révoque le refresh token côté serveur. Le rafraîchissement silencieux (voir lib/api.ts) a sa
 * propre logique interne pour /refresh — cette fonction ne sert qu'à la déconnexion explicite.
 */
export function logoutRequest(refreshToken: string) {
  return apiFetch<void>("/api/auth/logout", { method: "POST", body: { refreshToken } });
}
