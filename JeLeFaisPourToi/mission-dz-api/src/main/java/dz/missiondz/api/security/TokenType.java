package dz.missiondz.api.security;

/**
 * Distingue un access token d'un refresh token dans les claims JWT, pour qu'un refresh token
 * présenté sur un endpoint protégé ne puisse pas servir à s'authentifier.
 */
public enum TokenType {
    ACCESS,
    REFRESH
}
