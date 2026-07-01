package com.finpme.backend.transaction.dto;

import java.time.LocalDate;

import com.finpme.backend.transaction.entity.TransactionType;

public record TransactionFilterRequest(
        LocalDate startDate,
        LocalDate endDate,
        TransactionType type
) {
}
