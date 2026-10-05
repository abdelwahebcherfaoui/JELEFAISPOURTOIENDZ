package dz.missiondz.api.missions.dto;

import jakarta.validation.constraints.NotBlank;

public record DisputeRequest(@NotBlank(message = "Le motif de la contestation est obligatoire.") String reason) {
}
