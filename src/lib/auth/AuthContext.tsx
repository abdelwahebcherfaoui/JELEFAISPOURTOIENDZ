import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import { logoutRequest } from "./api";
import * as tokenStore from "./tokenStore";
import type { AuthTokens, AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  setSession: (tokens: AuthTokens) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const accessToken = useSyncExternalStore(tokenStore.subscribe, tokenStore.getAccessToken);
  const user = useSyncExternalStore(tokenStore.subscribe, tokenStore.getUser);

  const setSession = useCallback((tokens: AuthTokens) => {
    tokenStore.setTokens(tokens);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = tokenStore.getRefreshToken();
    // On efface la session localement tout de suite (l'utilisateur ne doit jamais rester bloqué
    // par un appel réseau) ; la révocation côté serveur est un best-effort en tâche de fond.
    tokenStore.clearTokens();
    if (refreshToken) {
      logoutRequest(refreshToken).catch(() => {});
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé sous AuthProvider");
  return context;
}
