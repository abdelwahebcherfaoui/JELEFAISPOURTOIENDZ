package dz.missiondz.api.missions.dto;

import jakarta.validation.constraints.NotNull;

public record ResolveDisputeRequest(@NotNull(message = "La décision est obligatoire.") Resolution resolution) {

    /** Décision de l'administrateur qui arbitre une mission {@code CONTESTEE}. */
    public enum Resolution {
        REPRISE,
        ANNULATION
    }
}
