package dz.missiondz.api.missions.dto;

import dz.missiondz.api.missions.entity.ExecutorType;
import dz.missiondz.api.missions.entity.MissionStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record MissionResponse(
        UUID id,
        UUID clientId,
        String clientName,
        UUID categoryId,
        String categoryName,
        String title,
        String description,
        String addressAlgeria,
        String wilaya,
        LocalDate preferredDate,
        MissionStatus status,
        ExecutorType executorType,
        UUID executorId,
        Instant createdAt,
        Instant updatedAt) {
}
