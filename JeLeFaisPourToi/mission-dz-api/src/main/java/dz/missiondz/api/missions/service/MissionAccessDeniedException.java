package dz.missiondz.api.missions.service;

import dz.missiondz.api.common.ApiException;
import org.springframework.http.HttpStatus;

public class MissionAccessDeniedException extends ApiException {

    public MissionAccessDeniedException() {
        super(HttpStatus.FORBIDDEN, "Vous n'avez pas accès à cette mission.");
    }
}
