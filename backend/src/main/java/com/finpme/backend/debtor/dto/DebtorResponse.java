package com.finpme.backend.debtor.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record DebtorResponse(
        UUID id,
        UUID companyId,
        String name,
        BigDecimal amount,
        LocalDate dueDate,
        String whatsappNumber,
        String status,
        LocalDateTime paidAt,
        String description,
        LocalDateTime createdAt
) {
}
