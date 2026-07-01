package com.finpme.backend.company.exception;

public class CnpjNotFoundException extends RuntimeException {
    public CnpjNotFoundException(String cnpj) {
        super("CNPJ não encontrado: " + cnpj);
    }
}
