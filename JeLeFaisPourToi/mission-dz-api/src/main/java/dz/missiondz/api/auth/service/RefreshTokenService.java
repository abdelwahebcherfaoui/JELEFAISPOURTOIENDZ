package dz.missiondz.api.auth.service;

import dz.missiondz.api.auth.dao.RefreshTokenRepository;
import dz.missiondz.api.auth.entity.RefreshToken;
import dz.missiondz.api.security.JwtProperties;
import dz.missiondz.api.users.entity.User;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Un seul refresh token actif par utilisateur. {@link #rotate(String)} consomme le jeton présenté
 * (suppression) et en émet un nouveau : un jeton déjà utilisé ne fonctionne donc plus jamais, ce
 * qui détecte un vol (rejeu) et limite la fenêtre d'exploitation si le jeton fuite.
 */
@Service
@Transactional
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtProperties jwtProperties) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProperties = jwtProperties;
    }

    public RefreshToken create(User user) {
        refreshTokenRepository.deleteByUser(user);
        return refreshTokenRepository.save(newTokenFor(user));
    }

    public RefreshToken rotate(String rawToken) {
        RefreshToken existing =
                refreshTokenRepository.findByToken(rawToken).orElseThrow(InvalidRefreshTokenException::new);

        if (existing.isExpired()) {
            refreshTokenRepository.delete(existing);
            throw new InvalidRefreshTokenException();
        }

        User user = existing.getUser();
        refreshTokenRepository.delete(existing);
        return refreshTokenRepository.save(newTokenFor(user));
    }

    public void revokeByToken(String rawToken) {
        refreshTokenRepository.findByToken(rawToken).ifPresent(refreshTokenRepository::delete);
    }

    private RefreshToken newTokenFor(User user) {
        return RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiresAt(Instant.now().plus(jwtProperties.refreshTokenTtl()))
                .build();
    }
}
