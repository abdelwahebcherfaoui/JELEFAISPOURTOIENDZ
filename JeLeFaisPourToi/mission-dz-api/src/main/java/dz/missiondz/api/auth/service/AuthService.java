package dz.missiondz.api.auth.service;

import dz.missiondz.api.auth.dto.AuthResponse;
import dz.missiondz.api.auth.dto.LoginRequest;
import dz.missiondz.api.auth.dto.SignupRequest;
import dz.missiondz.api.auth.entity.RefreshToken;
import dz.missiondz.api.security.JwtService;
import dz.missiondz.api.users.dao.UserRepository;
import dz.missiondz.api.users.entity.Role;
import dz.missiondz.api.users.entity.User;
import dz.missiondz.api.users.service.EmailAlreadyUsedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inscription, connexion et rafraîchissement de jeton. L'access token reste stateless (JWT, voir
 * {@link dz.missiondz.api.security.JwtService}) ; le refresh token, lui, est stocké en base et
 * tourné à chaque utilisation (voir {@link RefreshTokenService}), ce qui le rend révocable et à
 * usage unique.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException(request.email());
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.name())
                .phone(request.phone())
                .role(Role.CLIENT)
                .build();
        userRepository.save(user);

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshToken rotated = refreshTokenService.rotate(refreshToken);
        User user = rotated.getUser();
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getRole().name(), user.getName());
        return new AuthResponse(accessToken, rotated.getToken());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revokeByToken(refreshToken);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getRole().name(), user.getName());
        RefreshToken refreshToken = refreshTokenService.create(user);
        return new AuthResponse(accessToken, refreshToken.getToken());
    }
}
