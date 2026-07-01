package com.finpme.backend.company.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finpme.backend.auth.entity.User;
import com.finpme.backend.company.dto.CompanyResponse;
import com.finpme.backend.company.dto.CompanySummaryResponse;
import com.finpme.backend.company.dto.RegisterByCnpjRequest;
import com.finpme.backend.company.dto.RegisterManualRequest;
import com.finpme.backend.company.dto.UpdateTaxRegimeRequest;
import com.finpme.backend.company.exception.CnpjNotFoundException;
import com.finpme.backend.company.exception.CompanyNotFoundException;
import com.finpme.backend.company.exception.ExternalApiUnavailableException;
import com.finpme.backend.company.service.CompanyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
@Tag(name = "Companies")
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping("/cnpj")
    @Operation(summary = "Cadastra uma empresa a partir do CNPJ, consultando dados na BrasilAPI")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Empresa cadastrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "CNPJ não encontrado na Receita Federal"),
            @ApiResponse(responseCode = "409", description = "CNPJ já cadastrado"),
            @ApiResponse(responseCode = "503", description = "BrasilAPI indisponível ou em timeout")
    })
    public ResponseEntity<CompanyResponse> registerByCnpj(@Valid @RequestBody RegisterByCnpjRequest request) {
        CompanyResponse response = companyService.registerByCnpj(request, getOwnerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/manual")
    @Operation(summary = "Cadastra uma empresa manualmente, sem consultar a BrasilAPI")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Empresa cadastrada com sucesso"),
            @ApiResponse(responseCode = "409", description = "CNPJ já cadastrado")
    })
    public ResponseEntity<CompanyResponse> registerManual(@Valid @RequestBody RegisterManualRequest request) {
        CompanyResponse response = companyService.registerManual(request, getOwnerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Lista as empresas ativas do usuário autenticado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    public ResponseEntity<List<CompanySummaryResponse>> list() {
        return ResponseEntity.ok(companyService.listByOwner(getOwnerId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca os detalhes de uma empresa pelo id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Empresa encontrada"),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<CompanyResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getById(id, getOwnerId()));
    }

    @PatchMapping("/{id}/tax-regime")
    @Operation(summary = "Atualiza o regime tributário de uma empresa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Regime tributário atualizado"),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<CompanyResponse> updateTaxRegime(
            @PathVariable UUID id,
            @RequestBody UpdateTaxRegimeRequest request
    ) {
        return ResponseEntity.ok(companyService.updateTaxRegime(id, request, getOwnerId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativa (soft delete) uma empresa")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Empresa desativada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        companyService.deactivate(id, getOwnerId());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ExternalApiUnavailableException.class)
    public ResponseEntity<Map<String, String>> handleExternalApiUnavailable(ExternalApiUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "error", ex.getMessage(),
                "fallback", "/api/v1/companies/manual"
        ));
    }

    @ExceptionHandler(CnpjNotFoundException.class)
    public ResponseEntity<String> handleCnpjNotFound(CnpjNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(CompanyNotFoundException.class)
    public ResponseEntity<String> handleCompanyNotFound(CompanyNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    private UUID getOwnerId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getId();
    }
}
