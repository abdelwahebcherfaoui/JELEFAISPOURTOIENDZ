package dz.missiondz.api.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
        @NotBlank(message = "Le refresh token est obligatoire.") String refreshToken) {
}
