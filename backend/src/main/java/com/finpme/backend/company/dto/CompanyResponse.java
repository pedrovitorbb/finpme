package com.finpme.backend.company.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.finpme.backend.company.entity.TaxRegime;

public record CompanyResponse(
        UUID id,
        String cnpj,
        String razaoSocial,
        String nomeFantasia,
        TaxRegime taxRegime,
        String cnae,
        String cnaeDescricao,
        String status,
        LocalDate dataAbertura,
        String municipio,
        String uf,
        LocalDateTime createdAt
) {
}
