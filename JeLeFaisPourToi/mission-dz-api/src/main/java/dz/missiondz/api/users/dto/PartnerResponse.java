package dz.missiondz.api.users.dto;

import dz.missiondz.api.users.entity.PartnerValidationStatus;
import java.math.BigDecimal;
import java.util.UUID;

public record PartnerResponse(
        UUID partnerId,
        UUID userId,
        String name,
        String email,
        String phone,
        String entreprise,
        String specialite,
        String wilaya,
        PartnerValidationStatus statutValidation,
        BigDecimal tauxCommission) {
}
