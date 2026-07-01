package com.finpme.backend.company.exception;

public class ExternalApiUnavailableException extends RuntimeException {
    public ExternalApiUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
