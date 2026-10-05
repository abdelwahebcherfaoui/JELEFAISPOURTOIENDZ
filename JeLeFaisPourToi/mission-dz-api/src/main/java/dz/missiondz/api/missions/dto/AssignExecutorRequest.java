package dz.missiondz.api.missions.dto;

import dz.missiondz.api.missions.entity.ExecutorType;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AssignExecutorRequest(
        @NotNull(message = "Le type d'exécutant est obligatoire.") ExecutorType executorType,
        @NotNull(message = "L'identifiant de l'exécutant est obligatoire.") UUID executorId) {
}
