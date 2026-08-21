package dz.missiondz.api.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.JwtException;
import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-key-at-least-32-bytes-long-1234567890";

    private final JwtService jwtService =
            new JwtService(new JwtProperties(SECRET, Duration.ofMinutes(15), Duration.ofDays(30)));

    @Test
    void generatesAndParsesAnAccessToken() {
        UUID userId = UUID.randomUUID();

        String token = jwtService.generateAccessToken(userId, "CLIENT");
        JwtService.DecodedToken decoded = jwtService.parse(token);

        assertThat(decoded.userId()).isEqualTo(userId);
        assertThat(decoded.role()).isEqualTo("CLIENT");
        assertThat(decoded.tokenType()).isEqualTo(TokenType.ACCESS);
    }

    @Test
    void generatesAndParsesARefreshToken() {
        UUID userId = UUID.randomUUID();

        String token = jwtService.generateRefreshToken(userId, "ADMIN");
        JwtService.DecodedToken decoded = jwtService.parse(token);

        assertThat(decoded.tokenType()).isEqualTo(TokenType.REFRESH);
    }

    @Test
    void rejectsATokenSignedWithADifferentSecret() {
        var otherJwtService = new JwtService(
                new JwtProperties(
                        "a-completely-different-secret-key-also-32-bytes-or-more",
                        Duration.ofMinutes(15),
                        Duration.ofDays(30)));

        String token = otherJwtService.generateAccessToken(UUID.randomUUID(), "CLIENT");

        assertThatThrownBy(() -> jwtService.parse(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void rejectsAnAlreadyExpiredToken() {
        var alreadyExpiredJwtService =
                new JwtService(new JwtProperties(SECRET, Duration.ofSeconds(-1), Duration.ofDays(30)));

        String token = alreadyExpiredJwtService.generateAccessToken(UUID.randomUUID(), "CLIENT");

        assertThatThrownBy(() -> jwtService.parse(token)).isInstanceOf(JwtException.class);
    }
}
