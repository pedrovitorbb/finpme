package com.finpme.backend.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.finpme.backend.transaction.entity.TransactionCategory;
import com.finpme.backend.transaction.entity.TransactionType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTransactionRequest(
        @NotNull BigDecimal amount,
        @NotNull TransactionType type,
        TransactionCategory category,
        @NotNull LocalDate transactionDate,
        @Size(max = 500) String description
) {
}
