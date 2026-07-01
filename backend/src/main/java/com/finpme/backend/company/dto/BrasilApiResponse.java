package com.finpme.backend.company.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record BrasilApiResponse(
        String cnpj,
        @JsonProperty("razao_social") String razao_social,
        @JsonProperty("nome_fantasia") String nome_fantasia,
        @JsonProperty("situacao_cadastral") Integer situacao_cadastral,
        @JsonProperty("data_inicio_atividade") String data_inicio_atividade,
        @JsonProperty("cnae_fiscal") Integer cnae_fiscal,
        @JsonProperty("cnae_fiscal_descricao") String cnae_fiscal_descricao,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String municipio,
        String uf,
        String cep
) {
}
