package dz.missiondz.api.missions.dto;

import jakarta.validation.constraints.NotBlank;

public record AddUpdateRequest(
        @NotBlank(message = "Le message est obligatoire.") String message, boolean visibleToClient) {
}
