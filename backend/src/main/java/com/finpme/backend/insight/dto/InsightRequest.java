package com.finpme.backend.insight.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.finpme.backend.dashboard.dto.DashboardResponse;
import com.finpme.backend.debtor.dto.DebtorSummaryResponse;
import com.finpme.backend.radar.dto.TaxRadarResponse;

/**
 * Contexto agregado da empresa que será enviado à IA para geração dos
 * insights (dashboard + radar tributário + análise de margem + devedores).
 */
public record InsightRequest(
        UUID companyId,
        String companyName,
        String cnae,
        String cnaeDescricao,
        String taxRegime,
        LocalDate referenceDate,
        DashboardResponse dashboard,
        TaxRadarResponse taxRadar,
        MarginAnalysisResponse margin,
        DebtorSummaryResponse debtors
) {
}
