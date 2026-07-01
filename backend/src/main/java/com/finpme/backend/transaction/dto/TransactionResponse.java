package com.finpme.backend.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        UUID companyId,
        BigDecimal amount,
        String type,
        String category,
        String source,
        LocalDate transactionDate,
        String description,
        LocalDateTime createdAt
) {
}
