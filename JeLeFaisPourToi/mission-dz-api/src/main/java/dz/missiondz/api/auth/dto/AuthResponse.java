package dz.missiondz.api.auth.dto;

public record AuthResponse(String accessToken, String refreshToken) {
}
