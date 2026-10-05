package dz.missiondz.api.security;

import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Résout l'utilisateur courant à partir du {@link SecurityContextHolder}. Le principal est
 * directement l'UUID de l'utilisateur (voir {@link JwtAuthenticationFilter}), pas un objet
 * {@code UserDetails} — cohérent avec l'authentification stateless.
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static UUID id() {
        return (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public static String role() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.replace("ROLE_", ""))
                .orElseThrow();
    }
}
