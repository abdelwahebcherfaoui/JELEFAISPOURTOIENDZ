package dz.missiondz.api.common;

import org.springframework.http.HttpStatus;

/**
 * Base pour toute exception métier qui doit se traduire directement en réponse HTTP, quel que
 * soit le domaine. {@link GlobalExceptionHandler} n'a besoin de connaître que ce type de base —
 * pas chaque exception concrète de chaque module.
 */
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;

    protected ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
