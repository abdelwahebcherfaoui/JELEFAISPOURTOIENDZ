package dz.missiondz.api.missions.service;

import dz.missiondz.api.common.ApiException;
import java.util.UUID;
import org.springframework.http.HttpStatus;

public class MissionNotFoundException extends ApiException {

    public MissionNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "Aucune mission trouvée avec l'id " + id + ".");
    }
}
