package com.finpme.backend.dashboard.dto;

import java.math.BigDecimal;

public record DashboardResponse(
        int year,
        int month,
        BigDecimal grossRevenue,
        BigDecimal netRevenue,
        BigDecimal ebitda,
        BigDecimal taxAmount,
        BigDecimal operationalCosts,
        BigDecimal totalExpenses,
        long transactionCount,
        String healthLevel,
        String healthMessage,
        BigDecimal monthsOfReserve
) {
}
