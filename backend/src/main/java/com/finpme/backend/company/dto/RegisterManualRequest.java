package com.finpme.backend.company.dto;

import com.finpme.backend.company.entity.TaxRegime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterManualRequest(
        @NotBlank @Pattern(regexp = "\\d{14}") String cnpj,
        @NotBlank @Size(max = 255) String razaoSocial,
        String nomeFantasia,
        TaxRegime taxRegime,
        String cnae
) {
}
