package dz.missiondz.api.missions.service;

import dz.missiondz.api.common.ApiException;
import org.springframework.http.HttpStatus;

public class InvalidExecutorException extends ApiException {

    public InvalidExecutorException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
