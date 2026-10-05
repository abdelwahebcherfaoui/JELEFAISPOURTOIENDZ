package dz.missiondz.api.missions.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SendQuoteRequest(
        @NotNull(message = "Le montant est obligatoire.")
                @DecimalMin(value = "0.0", inclusive = false, message = "Le montant doit être positif.")
                BigDecimal montant,
        String devise,
        String description) {
}
