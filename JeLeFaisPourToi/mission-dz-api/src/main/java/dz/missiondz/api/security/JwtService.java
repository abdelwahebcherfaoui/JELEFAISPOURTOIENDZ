package dz.missiondz.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

/**
 * Émission et lecture des JWT. Ne va jamais chercher l'utilisateur en base : le rôle et
 * l'identifiant voyagent dans les claims du jeton (authentification stateless).
 */
@Service
public class JwtService {

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TOKEN_TYPE = "tokenType";

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UUID userId, String role) {
        return generateToken(userId, role, TokenType.ACCESS, properties.accessTokenTtl());
    }

    public String generateRefreshToken(UUID userId, String role) {
        return generateToken(userId, role, TokenType.REFRESH, properties.refreshTokenTtl());
    }

    private String generateToken(UUID userId, String role, TokenType tokenType, Duration ttl) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_ROLE, role)
                .claim(CLAIM_TOKEN_TYPE, tokenType.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(signingKey)
                .compact();
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
