package com.finpme.backend.debtor.dto;

import java.math.BigDecimal;

public record DebtorSummaryResponse(
        long pendingCount,
        BigDecimal pendingAmount,
        long overdueCount,
        BigDecimal overdueAmount,
        long paidCount,
        BigDecimal paidAmount
) {
}
