package com.finpme.backend.debtor.exception;

import java.util.UUID;

public class DebtorNotFoundException extends RuntimeException {
    public DebtorNotFoundException(UUID id) {
        super("Devedor não encontrado: " + id);
    }
}
