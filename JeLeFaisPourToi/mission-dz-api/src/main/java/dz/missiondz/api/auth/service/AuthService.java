package dz.missiondz.api.auth.service;

import dz.missiondz.api.auth.dto.AuthResponse;
import dz.missiondz.api.auth.dto.LoginRequest;
import dz.missiondz.api.auth.dto.SignupRequest;
import dz.missiondz.api.security.JwtService;
import dz.missiondz.api.security.TokenType;
import dz.missiondz.api.users.dao.UserRepository;
import dz.missiondz.api.users.entity.Role;
import dz.missiondz.api.users.entity.User;
import io.jsonwebtoken.JwtException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inscription, connexion et rafraîchissement de jeton. Le refresh token reste, pour l'instant,
 * stateless comme l'access token (voir {@link dz.missiondz.api.security.JwtService}) : la
 * conception technique prévoit qu'il soit "stocké côté serveur et révocable", ce qui exigerait
 * une entité dédiée (table de refresh tokens, invalidée à la déconnexion) — non construite ici
 * faute d'un besoin de déconnexion/révocation pour l'instant. À ajouter quand ce besoin apparaît.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return issueTokens(user);
    }

    public AuthResponse refresh(String refreshToken) {
        JwtService.DecodedToken decoded;
        try {
            decoded = jwtService.parse(refreshToken);
        } catch (JwtException | IllegalArgumentException e) {
            throw new InvalidRefreshTokenException();
        }

        if (decoded.tokenType() != TokenType.REFRESH) {
            throw new InvalidRefreshTokenException();
        }

        User user = userRepository.findById(decoded.userId()).orElseThrow(InvalidRefreshTokenException::new);

        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        String role = user.getRole().name();
        String accessToken = jwtService.generateAccessToken(user.getId(), role);
        String refreshToken = jwtService.generateRefreshToken(user.getId(), role);
        return new AuthResponse(accessToken, refreshToken);
    }
}
