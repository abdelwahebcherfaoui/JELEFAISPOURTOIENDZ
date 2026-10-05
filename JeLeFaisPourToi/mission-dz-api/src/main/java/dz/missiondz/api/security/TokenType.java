package dz.missiondz.api.security;

/**
 * Seul l'access token est un JWT (le refresh token est un jeton opaque stocké en base, voir
 * {@link dz.missiondz.api.auth.service.RefreshTokenService}). Ce claim reste présent par sécurité
 * pour qu'un jeton qui ne serait pas explicitement de type ACCESS ne puisse pas authentifier une
 * requête.
 */
public enum TokenType {
    ACCESS
}
