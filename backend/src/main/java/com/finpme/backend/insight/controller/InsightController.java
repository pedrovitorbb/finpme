package com.finpme.backend.insight.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finpme.backend.auth.entity.User;
import com.finpme.backend.company.exception.CompanyNotFoundException;
import com.finpme.backend.insight.dto.InsightResponse;
import com.finpme.backend.insight.service.InsightService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/insights")
@RequiredArgsConstructor
@Tag(name = "Insights")
public class InsightController {

    private final InsightService insightService;

    @GetMapping
    @Operation(summary = "Retorna os insights do dia da empresa, gerando um novo lote caso ainda não exista")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Insights retornados com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<List<InsightResponse>> getInsights(@PathVariable UUID companyId) {
        return ResponseEntity.ok(insightService.getLatest(companyId, getOwnerId()));
    }

    @ExceptionHandler(CompanyNotFoundException.class)
    public ResponseEntity<String> handleCompanyNotFound(CompanyNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    private UUID getOwnerId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getId();
    }
}
