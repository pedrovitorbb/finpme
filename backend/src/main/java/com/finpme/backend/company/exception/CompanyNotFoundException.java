package com.finpme.backend.company.exception;

import java.util.UUID;

public class CompanyNotFoundException extends RuntimeException {
    public CompanyNotFoundException(UUID id) {
        super("Empresa não encontrada: " + id);
    }
}
