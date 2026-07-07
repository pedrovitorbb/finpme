package com.finpme.backend.debtor.controller;

import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.finpme.backend.auth.entity.User;
import com.finpme.backend.company.exception.CompanyNotFoundException;
import com.finpme.backend.debtor.dto.CreateDebtorRequest;
import com.finpme.backend.debtor.dto.DebtorResponse;
import com.finpme.backend.debtor.dto.DebtorSummaryResponse;
import com.finpme.backend.debtor.dto.UpdateDebtorRequest;
import com.finpme.backend.debtor.entity.DebtorStatus;
import com.finpme.backend.debtor.exception.DebtorNotFoundException;
import com.finpme.backend.debtor.service.DebtorService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/debtors")
@RequiredArgsConstructor
@Tag(name = "Debtors")
public class DebtorController {

    private final DebtorService debtorService;

    @PostMapping
    @Operation(summary = "Registra um novo devedor (cliente que deve dinheiro à empresa)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Devedor registrado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<DebtorResponse> create(
            @PathVariable UUID companyId,
            @Valid @RequestBody CreateDebtorRequest request
    ) {
        DebtorResponse response = debtorService.create(companyId, getOwnerId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Lista os devedores da empresa, com filtro opcional por status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<List<DebtorResponse>> list(
            @PathVariable UUID companyId,
            @RequestParam(required = false) DebtorStatus status
    ) {
        return ResponseEntity.ok(debtorService.list(companyId, getOwnerId(), status));
    }

    @GetMapping("/summary")
    @Operation(summary = "Resumo das cobranças da empresa (totais pendentes, vencidos e pagos)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resumo calculado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<DebtorSummaryResponse> summary(@PathVariable UUID companyId) {
        return ResponseEntity.ok(debtorService.getSummary(companyId, getOwnerId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca os detalhes de um devedor pelo id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Devedor encontrado"),
            @ApiResponse(responseCode = "404", description = "Empresa ou devedor não encontrado")
    })
    public ResponseEntity<DebtorResponse> getById(@PathVariable UUID companyId, @PathVariable UUID id) {
        return ResponseEntity.ok(debtorService.getById(id, companyId, getOwnerId()));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente um devedor")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Devedor atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa ou devedor não encontrado")
    })
    public ResponseEntity<DebtorResponse> update(
            @PathVariable UUID companyId,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDebtorRequest request
    ) {
        return ResponseEntity.ok(debtorService.update(id, companyId, getOwnerId(), request));
    }

    @PostMapping("/{id}/mark-paid")
    @Operation(summary = "Marca a dívida do devedor como paga")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dívida marcada como paga"),
            @ApiResponse(responseCode = "404", description = "Empresa ou devedor não encontrado")
    })
    public ResponseEntity<DebtorResponse> markAsPaid(@PathVariable UUID companyId, @PathVariable UUID id) {
        return ResponseEntity.ok(debtorService.markAsPaid(id, companyId, getOwnerId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove definitivamente um devedor")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Devedor removido com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa ou devedor não encontrado")
    })
    public ResponseEntity<Void> delete(@PathVariable UUID companyId, @PathVariable UUID id) {
        debtorService.delete(id, companyId, getOwnerId());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(DebtorNotFoundException.class)
    public ResponseEntity<String> handleDebtorNotFound(DebtorNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
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
