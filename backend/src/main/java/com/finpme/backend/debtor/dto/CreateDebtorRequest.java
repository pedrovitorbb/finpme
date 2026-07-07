package com.finpme.backend.debtor.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateDebtorRequest(
        @NotBlank @Size(max = 255) String name,
        @NotNull @Positive BigDecimal amount,
        @NotNull LocalDate dueDate,
        @Size(max = 20) String whatsappNumber,
        @Size(max = 500) String description
) {
}
