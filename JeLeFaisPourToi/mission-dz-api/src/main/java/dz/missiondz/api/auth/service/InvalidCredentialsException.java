package dz.missiondz.api.auth.service;

import dz.missiondz.api.common.ApiException;
import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends ApiException {

    public InvalidCredentialsException() {
        super(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect.");
    }
}
