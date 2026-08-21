package dz.missiondz.api.security;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * {@code secret} n'a volontairement aucune valeur par défaut ici : il doit toujours être fourni
 * via la variable d'environnement {@code JWT_SECRET} (jamais commité), y compris en dev.
 */
@ConfigurationProperties(prefix = "security.jwt")
public record JwtProperties(String secret, Duration accessTokenTtl, Duration refreshTokenTtl) {
}
