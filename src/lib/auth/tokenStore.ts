import { decodeAccessToken } from "./jwt";
import type { AuthTokens, AuthUser } from "./types";

const ACCESS_TOKEN_KEY = "jfpt_access_token";
const REFRESH_TOKEN_KEY = "jfpt_refresh_token";

/**
 * Source de vérité des tokens, en dehors de React : à la fois `apiFetch` (rafraîchissement
 * silencieux sur 401) et `AuthContext` (état affiché aux composants, via useSyncExternalStore)
 * lisent/écrivent ici, pour ne jamais désynchroniser le localStorage de l'état React.
 */
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// useSyncExternalStore exige une référence stable tant que rien n'a changé (sinon re-render en
// boucle) : on ne redécode le token que quand sa valeur diffère de la dernière lecture.
let cachedToken: string | null = null;
let cachedUser: AuthUser | null = null;

export function getUser(): AuthUser | null {
  const token = getAccessToken();
  if (token !== cachedToken) {
    cachedToken = token;
    cachedUser = token ? decodeAccessToken(token) : null;
  }
  return cachedUser;
}

export function setTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  notify();
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  notify();
}
