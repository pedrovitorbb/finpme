package com.finpme.backend.company.client;

import java.time.Duration;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.finpme.backend.company.dto.BrasilApiResponse;
import com.finpme.backend.company.exception.CnpjNotFoundException;
import com.finpme.backend.company.exception.ExternalApiUnavailableException;

@Component
public class BrasilApiClient {

    private static final String BASE_URL = "https://brasilapi.com.br/api/cnpj/v1";
    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final WebClient webClient;

    public BrasilApiClient() {
        this.webClient = WebClient.builder().baseUrl(BASE_URL).build();
    }

    public BrasilApiResponse fetchByCnpj(String cnpj) {
        try {
            return webClient.get()
                    .uri("/{cnpj}", cnpj)
                    .retrieve()
                    .bodyToMono(BrasilApiResponse.class)
                    .timeout(TIMEOUT)
                    .block();
        } catch (WebClientResponseException.NotFound ex) {
            throw new CnpjNotFoundException(cnpj);
        } catch (Exception ex) {
            throw new ExternalApiUnavailableException("Falha ao consultar BrasilAPI para o CNPJ " + cnpj, ex);
        }
    }
}
