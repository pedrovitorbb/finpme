package com.finpme.backend.radar.dto;

import java.math.BigDecimal;

import com.finpme.backend.company.entity.TaxRegime;

public record TaxRadarResponse(
        BigDecimal ytdRevenue,
        BigDecimal annualLimit,
        BigDecimal limitUsedPct,
        BigDecimal projectedRevenue,
        TaxRegime taxRegime,
        String alertLevel,
        BigDecimal canStillEarn,
        String projectionMessage,
        String friendlyStatus
) {
}
