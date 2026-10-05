package dz.missiondz.api.missions.dto;

import java.time.Instant;
import java.util.UUID;

public record MissionUpdateResponse(
        UUID id, UUID authorId, String authorName, String message, boolean visibleToClient, Instant createdAt) {
}
