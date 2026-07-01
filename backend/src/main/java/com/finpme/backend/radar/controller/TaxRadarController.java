package com.finpme.backend.radar.controller;

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
import com.finpme.backend.radar.dto.TaxRadarResponse;
import com.finpme.backend.radar.service.TaxRadarService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/tax-radar")
@RequiredArgsConstructor
@Tag(name = "Tax Radar")
public class TaxRadarController {

    private final TaxRadarService taxRadarService;

    @GetMapping
    @Operation(summary = "Calcula o radar tributário da empresa (YTD, limite, percentual usado e projeção anual)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Radar calculado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<TaxRadarResponse> getRadar(@PathVariable UUID companyId) {
        return ResponseEntity.ok(taxRadarService.getRadar(companyId, getOwnerId()));
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
