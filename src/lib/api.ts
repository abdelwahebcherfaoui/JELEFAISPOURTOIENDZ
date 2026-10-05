import * as tokenStore from "./auth/tokenStore";
import type { AuthTokens } from "./auth/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
}

/** Réponse d'erreur renvoyée par GlobalExceptionHandler côté backend. */
interface BackendApiError {
  message?: string;
}

async function rawFetch(path: string, options: ApiFetchOptions): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

async function toResult<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data: BackendApiError | null = await response.json().catch(() => null);
    throw new ApiError(response.status, data?.message ?? "Une erreur est survenue. Réessayez.");
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// Rafraîchissement silencieux : au moins un appel en 401 déclenche un seul POST /api/auth/refresh
// partagé (le refresh token est à usage unique côté backend — en lancer plusieurs en parallèle
// invaliderait celui des autres). Les appels suivants attendent cette même promesse.
let refreshInFlight: Promise<AuthTokens | null> | null = null;

function refreshSession(): Promise<AuthTokens | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function doRefresh(): Promise<AuthTokens | null> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await rawFetch("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
    if (!response.ok) {
      tokenStore.clearTokens();
      return null;
    }
    const tokens = (await response.json()) as AuthTokens;
    tokenStore.setTokens(tokens);
    return tokens;
  } catch {
    // Erreur réseau : on ne déconnecte pas (la connexion peut revenir), l'appel d'origine échouera.
    return null;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}, isRetry = false): Promise<T> {
  let response: Response;
  try {
    response = await rawFetch(path, options);
  } catch {
    // fetch() a levé (serveur injoignable, pas juste une réponse d'erreur) : on transforme ça en
    // ApiError pour que le message clair remonte partout où les pages font déjà
    // `err instanceof ApiError ? err.message : "..."`, sans devoir toucher chaque page.
    throw new ApiError(0, "Le site est temporairement indisponible. Réessayez dans quelques instants.");
  }

  if (response.status === 401 && options.token && !isRetry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, token: refreshed.accessToken }, true);
    }
  }

  return toResult<T>(response);
}
