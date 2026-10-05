package dz.missiondz.api.users.service;

import dz.missiondz.api.common.ApiException;
import java.util.UUID;
import org.springframework.http.HttpStatus;

public class PartnerNotFoundException extends ApiException {

    public PartnerNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "Aucun partenaire trouvé avec l'id " + id + ".");
    }
}
