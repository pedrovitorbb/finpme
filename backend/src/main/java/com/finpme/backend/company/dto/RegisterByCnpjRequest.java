package com.finpme.backend.company.dto;

import com.finpme.backend.company.entity.TaxRegime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterByCnpjRequest(
        @NotBlank @Pattern(regexp = "\\d{14}") String cnpj,
        TaxRegime taxRegimeOverride
) {
}
