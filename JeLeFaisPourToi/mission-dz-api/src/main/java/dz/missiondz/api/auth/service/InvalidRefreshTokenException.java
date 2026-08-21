package dz.missiondz.api.auth.service;

import dz.missiondz.api.common.ApiException;
import org.springframework.http.HttpStatus;

public class InvalidRefreshTokenException extends ApiException {

    public InvalidRefreshTokenException() {
        super(HttpStatus.UNAUTHORIZED, "Refresh token invalide ou expiré.");
    }
}
