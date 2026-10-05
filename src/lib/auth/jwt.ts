import type { AuthUser, Role } from "./types";

/**
 * Décode le payload d'un access token pour lire l'id et le rôle de l'utilisateur — sans
 * vérifier la signature. C'est uniquement pour piloter l'affichage (afficher/masquer un lien
 * "Connexion", montrer le rôle) : la vraie application des droits reste côté backend.
 */
export function decodeAccessToken(token: string): AuthUser | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64)) as { sub?: string; role?: string; name?: string };
    if (!json.sub || !json.role) return null;
    return { id: json.sub, role: json.role as Role, name: json.name };
  } catch {
    return null;
  }
}
