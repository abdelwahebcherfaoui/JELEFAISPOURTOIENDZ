package dz.missiondz.api.catalog.dto;

import java.util.UUID;

public record CategoryResponse(UUID id, String slug, String name, String description, String icon) {
}
