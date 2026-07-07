package com.finpme.backend.debtor.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.finpme.backend.debtor.entity.DebtorStatus;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateDebtorRequest(
        @Size(max = 255) String name,
        @Positive BigDecimal amount,
        LocalDate dueDate,
        @Size(max = 20) String whatsappNumber,
        DebtorStatus status,
        @Size(max = 500) String description
) {
}
