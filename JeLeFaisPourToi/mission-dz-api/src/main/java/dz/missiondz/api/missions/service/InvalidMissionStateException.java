package dz.missiondz.api.missions.service;

import dz.missiondz.api.common.ApiException;
import dz.missiondz.api.missions.entity.MissionStatus;
import org.springframework.http.HttpStatus;

public class InvalidMissionStateException extends ApiException {

    public InvalidMissionStateException(MissionStatus current, String action) {
        super(HttpStatus.CONFLICT, "Impossible de \"" + action + "\" une mission au statut " + current + ".");
    }
}
