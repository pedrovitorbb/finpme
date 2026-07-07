package com.finpme.backend.insight.dto;

import java.math.BigDecimal;

public record MarginAnalysisResponse(
        BigDecimal actualMarginPct,
        BigDecimal referenceMarginPct,
        String cnae,
        String status,
        String message
) {
}
