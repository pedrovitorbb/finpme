package com.finpme.backend.radar.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.finpme.backend.company.entity.Company;
import com.finpme.backend.company.entity.TaxRegime;
import com.finpme.backend.company.exception.CompanyNotFoundException;
import com.finpme.backend.company.repository.CompanyRepository;
import com.finpme.backend.radar.dto.TaxRadarResponse;
import com.finpme.backend.transaction.entity.TransactionType;
import com.finpme.backend.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaxRadarService {

    private static final BigDecimal MEI_LIMIT = new BigDecimal("81000");
    private static final BigDecimal SIMPLES_NACIONAL_LIMIT = new BigDecimal("4800000");
    private static final Locale PT_BR = Locale.of("pt", "BR");

    private final TransactionRepository transactionRepository;
    private final CompanyRepository companyRepository;

    public TaxRadarResponse getRadar(UUID companyId, UUID ownerId) {
        Company company = companyRepository.findByIdAndOwnerId(companyId, ownerId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        BigDecimal ytd = calculateYTD(companyId);
        BigDecimal limit = getLimit(company.getTaxRegime());
        BigDecimal limitUsedPct = limit != null
                ? ytd.divide(limit, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : null;
        BigDecimal projected = projectEndOfYear(ytd);
        String alertLevel = determineAlertLevel(limitUsedPct);

        BigDecimal canStillEarn = calculateCanStillEarn(ytd, limit);
        String projectionMessage = buildProjectionMessage(ytd, limit, projected);
        String friendlyStatus = buildFriendlyStatus(limitUsedPct);

        return new TaxRadarResponse(ytd, limit, limitUsedPct, projected, company.getTaxRegime(), alertLevel,
                canStillEarn, projectionMessage, friendlyStatus);
    }

    private BigDecimal calculateYTD(UUID companyId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfYear = LocalDate.of(today.getYear(), 1, 1);

        return transactionRepository
                .findAllByCompanyIdAndTransactionDateBetweenOrderByTransactionDateDesc(companyId, startOfYear, today)
                .stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(t -> t.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal getLimit(TaxRegime regime) {
        return switch (regime) {
            case MEI -> MEI_LIMIT;
            case SIMPLES_NACIONAL -> SIMPLES_NACIONAL_LIMIT;
            case LUCRO_PRESUMIDO, LUCRO_REAL -> null;
        };
    }

    private BigDecimal projectEndOfYear(BigDecimal ytd) {
        LocalDate today = LocalDate.now();
        LocalDate startOfYear = LocalDate.of(today.getYear(), 1, 1);
        long diasPassados = ChronoUnit.DAYS.between(startOfYear, today);

        if (diasPassados == 0) {
            return null;
        }

        return ytd.divide(BigDecimal.valueOf(diasPassados), 10, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(365));
    }

    private BigDecimal calculateCanStillEarn(BigDecimal ytd, BigDecimal limit) {
        if (limit == null) {
            return null;
        }
        return limit.subtract(ytd).max(BigDecimal.ZERO);
    }

    private String buildProjectionMessage(BigDecimal ytd, BigDecimal limit, BigDecimal projected) {
        if (limit == null) {
            return "Seu regime tributário não tem limite anual de faturamento.";
        }
        if (ytd.compareTo(limit) >= 0) {
            return "Você já ultrapassou o limite anual do seu regime. Procure seu contador para avaliar o desenquadramento.";
        }
        if (projected == null || projected.compareTo(limit) <= 0) {
            return "No ritmo atual, você termina o ano dentro do limite do seu regime.";
        }

        String monthName = estimateBreachMonth(ytd, limit);
        if (monthName == null) {
            return "No ritmo atual, você vai ultrapassar o limite ainda este ano.";
        }
        return "No ritmo atual, você vai estourar o limite em " + monthName + ".";
    }

    /**
     * Estima em qual mês o faturamento acumulado atinge o limite,
     * mantendo o ritmo diário médio do ano até hoje.
     */
    private String estimateBreachMonth(BigDecimal ytd, BigDecimal limit) {
        LocalDate today = LocalDate.now();
        LocalDate startOfYear = LocalDate.of(today.getYear(), 1, 1);
        long diasPassados = ChronoUnit.DAYS.between(startOfYear, today);

        if (diasPassados == 0 || ytd.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        BigDecimal dailyRate = ytd.divide(BigDecimal.valueOf(diasPassados), 10, RoundingMode.HALF_UP);
        long daysToBreach = limit.divide(dailyRate, 0, RoundingMode.CEILING).longValue();

        LocalDate breachDate = startOfYear.plusDays(daysToBreach);
        if (breachDate.getYear() != today.getYear()) {
            return null;
        }
        return breachDate.getMonth().getDisplayName(TextStyle.FULL, PT_BR);
    }

    private String buildFriendlyStatus(BigDecimal limitUsedPct) {
        if (limitUsedPct == null) {
            return "Seu regime não tem teto de faturamento — sem risco de estourar limite.";
        }

        String pct = limitUsedPct.setScale(0, RoundingMode.HALF_UP).toPlainString();
        if (limitUsedPct.compareTo(new BigDecimal("100")) >= 0) {
            return "Limite estourado — você já usou " + pct + "% do teto anual.";
        }
        if (limitUsedPct.compareTo(new BigDecimal("95")) >= 0) {
            return "Alerta máximo — você já usou " + pct + "% do teto anual.";
        }
        if (limitUsedPct.compareTo(new BigDecimal("85")) >= 0) {
            return "Fique de olho — você já usou " + pct + "% do teto anual.";
        }
        if (limitUsedPct.compareTo(new BigDecimal("70")) >= 0) {
            return "Atenção — você já usou " + pct + "% do teto anual.";
        }
        return "Tudo tranquilo — você usou " + pct + "% do teto anual.";
    }

    private String determineAlertLevel(BigDecimal limitUsedPct) {
        if (limitUsedPct == null) {
            return null;
        }
        if (limitUsedPct.compareTo(new BigDecimal("95")) >= 0) {
            return "WARNING_95";
        }
        if (limitUsedPct.compareTo(new BigDecimal("85")) >= 0) {
            return "WARNING_85";
        }
        if (limitUsedPct.compareTo(new BigDecimal("70")) >= 0) {
            return "WARNING_70";
        }
        return null;
    }
}
