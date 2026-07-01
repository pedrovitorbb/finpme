package com.finpme.backend.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.finpme.backend.transaction.entity.TransactionCategory;
import com.finpme.backend.transaction.entity.TransactionType;

import jakarta.validation.constraints.Size;

public record UpdateTransactionRequest(
        BigDecimal amount,
        TransactionType type,
        TransactionCategory category,
        LocalDate transactionDate,
        @Size(max = 500) String description
) {
}
