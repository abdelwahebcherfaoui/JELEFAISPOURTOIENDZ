package dz.missiondz.api.missions.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record CreateMissionRequest(
        @NotNull(message = "La catégorie est obligatoire.") UUID categoryId,
        @NotBlank(message = "Le titre est obligatoire.") String title,
        @NotBlank(message = "La description est obligatoire.")
                @Size(min = 10, message = "Décrivez la demande en au moins 10 caractères.")
                String description,
        @NotBlank(message = "L'adresse en Algérie est obligatoire.") String addressAlgeria,
        @NotBlank(message = "La wilaya est obligatoire.") String wilaya,
        LocalDate preferredDate) {
}
