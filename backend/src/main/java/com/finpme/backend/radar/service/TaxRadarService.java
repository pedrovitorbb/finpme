package com.finpme.backend.radar.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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

        return new TaxRadarResponse(ytd, limit, limitUsedPct, projected, company.getTaxRegime(), alertLevel);
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
