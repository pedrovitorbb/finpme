package com.finpme.backend.transaction.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
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
import com.finpme.backend.transaction.dto.CreateTransactionRequest;
import com.finpme.backend.transaction.dto.TransactionFilterRequest;
import com.finpme.backend.transaction.dto.TransactionResponse;
import com.finpme.backend.transaction.dto.UpdateTransactionRequest;
import com.finpme.backend.transaction.entity.TransactionType;
import com.finpme.backend.transaction.exception.TransactionNotFoundException;
import com.finpme.backend.transaction.service.TransactionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @Operation(summary = "Cria uma transação manual para a empresa")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Transação criada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<TransactionResponse> create(
            @PathVariable UUID companyId,
            @Valid @RequestBody CreateTransactionRequest request
    ) {
        TransactionResponse response = transactionService.create(companyId, getOwnerId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Lista as transações da empresa, com filtros opcionais de período e tipo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<List<TransactionResponse>> list(
            @PathVariable UUID companyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) TransactionType type
    ) {
        TransactionFilterRequest filter = new TransactionFilterRequest(startDate, endDate, type);
        return ResponseEntity.ok(transactionService.list(companyId, getOwnerId(), filter));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca os detalhes de uma transação pelo id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transação encontrada"),
            @ApiResponse(responseCode = "404", description = "Empresa ou transação não encontrada")
    })
    public ResponseEntity<TransactionResponse> getById(@PathVariable UUID companyId, @PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.getById(id, companyId, getOwnerId()));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente uma transação")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transação atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa ou transação não encontrada")
    })
    public ResponseEntity<TransactionResponse> update(
            @PathVariable UUID companyId,
            @PathVariable UUID id,
            @RequestBody UpdateTransactionRequest request
    ) {
        return ResponseEntity.ok(transactionService.update(id, companyId, getOwnerId(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove definitivamente uma transação manual")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Transação removida com sucesso"),
            @ApiResponse(responseCode = "404", description = "Empresa ou transação não encontrada")
    })
    public ResponseEntity<Void> delete(@PathVariable UUID companyId, @PathVariable UUID id) {
        transactionService.delete(id, companyId, getOwnerId());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(TransactionNotFoundException.class)
    public ResponseEntity<String> handleTransactionNotFound(TransactionNotFoundException ex) {
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
