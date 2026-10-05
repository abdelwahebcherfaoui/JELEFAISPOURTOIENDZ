package dz.missiondz.api.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Créé exclusivement par l'administrateur (pas d'auto-inscription des partenaires). Le mot de
 * passe fourni ici est un mot de passe initial que le partenaire réutilisera pour se connecter
 * via {@code POST /api/auth/login} — pas de flux d'invitation/réinitialisation pour l'instant.
 */
public record CreatePartnerRequest(
        @NotBlank(message = "Le nom est obligatoire.") String name,
        @NotBlank(message = "L'email est obligatoire.") @Email(message = "Email invalide.") String email,
        @NotBlank(message = "Le mot de passe initial est obligatoire.")
                @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères.")
                String password,
        String phone,
        String entreprise,
        String specialite,
        @NotBlank(message = "La wilaya est obligatoire.") String wilaya,
        BigDecimal tauxCommission) {
}
