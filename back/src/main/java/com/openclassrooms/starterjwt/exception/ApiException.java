package com.openclassrooms.starterjwt.exception;

/**
 * Base class for the application's own exceptions, each annotated with
 * @ResponseStatus. GlobalExceptionHandler only intercepts this type (not
 * RuntimeException in general), so framework/third-party runtime exceptions
 * are never accidentally caught and exposed to the client.
 */
public abstract class ApiException extends RuntimeException {
    protected ApiException() {
        super();
    }

    protected ApiException(String message) {
        super(message);
    }
}
