package dz.missiondz.api.security;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import org.springframework.http.MediaType;

/**
 * Corps JSON commun aux réponses 401/403, pour ne pas renvoyer la page d'erreur HTML par défaut.
 *
 * <p>Construit à la main plutôt qu'avec une lib JSON : le corps est fixe et son contenu (message
 * choisi par nous, jamais de saisie utilisateur) ne présente aucun risque d'échappement, et
 * Jackson n'est disponible qu'en scope {@code runtime} sur ce projet — pas exploitable ici à la
 * compilation.
 */
final class SecurityErrorResponse {

    private SecurityErrorResponse() {
    }

    static void write(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
                {"timestamp":"%s","status":%d,"error":"%s"}"""
                .formatted(Instant.now(), status, message));
    }
}
