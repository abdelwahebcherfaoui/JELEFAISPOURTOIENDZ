package dz.missiondz.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

/**
 * Émission et lecture de l'access token (JWT). Ne va jamais chercher l'utilisateur en base : le
 * rôle et l'identifiant voyagent dans les claims du jeton (authentification stateless). Le refresh
 * token, lui, n'est pas géré ici : voir {@link dz.missiondz.api.auth.service.RefreshTokenService}.
 */
@Service
public class JwtService {

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TOKEN_TYPE = "tokenType";
    private static final String CLAIM_NAME = "name";

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UUID userId, String role) {
        return generateAccessToken(userId, role, null);
    }

    /**
     * Le nom voyage dans le claim {@value #CLAIM_NAME} — ça évite un aller-retour vers
     * {@code GET /api/users/me} juste pour afficher "Bonjour {nom}" côté front.
     */
    public String generateAccessToken(UUID userId, String role, String name) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_ROLE, role)
                .claim(CLAIM_TOKEN_TYPE, TokenType.ACCESS.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(properties.accessTokenTtl())));
        if (name != null) {
            builder.claim(CLAIM_NAME, name);
        }
        return builder.signWith(signingKey).compact();
    }

    /**
     * Décode et valide un jeton (signature + expiration). Lève {@link io.jsonwebtoken.JwtException}
     * si le jeton est expiré, malformé, ou signé avec une autre clé — à charge de l'appelant de
     * traiter cette exception (voir {@link JwtAuthenticationFilter}).
     */
    public DecodedToken parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        UUID userId = UUID.fromString(claims.getSubject());
        String role = claims.get(CLAIM_ROLE, String.class);
        TokenType tokenType = TokenType.valueOf(claims.get(CLAIM_TOKEN_TYPE, String.class));
        return new DecodedToken(userId, role, tokenType);
    }

    public record DecodedToken(UUID userId, String role, TokenType tokenType) {
    }
}
