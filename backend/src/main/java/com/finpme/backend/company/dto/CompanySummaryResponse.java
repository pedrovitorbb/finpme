package com.finpme.backend.company.dto;

import java.util.UUID;

import com.finpme.backend.company.entity.TaxRegime;

public record CompanySummaryResponse(
        UUID id,
        String cnpj,
        String razaoSocial,
        TaxRegime taxRegime,
        String municipio,
        String uf
) {
}
