package dz.missiondz.api.users.service;

import dz.missiondz.api.common.ApiException;
import org.springframework.http.HttpStatus;

public class EmailAlreadyUsedException extends ApiException {

    public EmailAlreadyUsedException(String email) {
        super(HttpStatus.CONFLICT, "Un compte existe déjà avec l'email " + email + ".");
    }
}
