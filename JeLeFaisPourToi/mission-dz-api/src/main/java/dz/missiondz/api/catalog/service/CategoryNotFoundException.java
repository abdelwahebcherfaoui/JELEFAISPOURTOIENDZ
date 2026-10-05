package dz.missiondz.api.catalog.service;

import dz.missiondz.api.common.ApiException;
import java.util.UUID;
import org.springframework.http.HttpStatus;

public class CategoryNotFoundException extends ApiException {

    public CategoryNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "Aucune catégorie active trouvée avec l'id " + id + ".");
    }
}
