package com.finpme.backend.dashboard.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.finpme.backend.company.exception.CompanyNotFoundException;
import com.finpme.backend.company.repository.CompanyRepository;
import com.finpme.backend.dashboard.dto.DashboardResponse;
import com.finpme.backend.transaction.entity.Transaction;
import com.finpme.backend.transaction.entity.TransactionCategory;
import com.finpme.backend.transaction.entity.TransactionType;
import com.finpme.backend.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final BigDecimal HEALTHY_THRESHOLD = new BigDecimal("2");
    private static final BigDecimal WARNING_THRESHOLD = BigDecimal.ONE;
    private static final BigDecimal DAYS_PER_MONTH = new BigDecimal("30");

    private final TransactionRepository transactionRepository;
    private final CompanyRepository companyRepository;

    public DashboardResponse getDashboard(UUID companyId, UUID ownerId, int year, int month) {
        companyRepository.findByIdAndOwnerId(companyId, ownerId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Transaction> transactions = transactionRepository
                .findAllByCompanyIdAndTransactionDateBetweenOrderByTransactionDateDesc(companyId, start, end);

        BigDecimal grossRevenue = calculateGrossRevenue(transactions);
        BigDecimal taxAmount = calculateTaxAmount(transactions);
        BigDecimal operationalCosts = calculateOperationalCosts(transactions);
        BigDecimal ebitda = calculateEBITDA(grossRevenue, operationalCosts);
        BigDecimal netRevenue = calculateNetRevenue(grossRevenue, taxAmount);
        BigDecimal totalExpenses = operationalCosts.add(taxAmount);

        HealthStatus health = calculateHealth(companyId, end);

        return new DashboardResponse(
                year, month, grossRevenue, netRevenue, ebitda, taxAmount, operationalCosts, totalExpenses,
                transactions.size(), health.level(), health.message(), health.monthsOfReserve());
    }

    /**
     * Semáforo de saúde do negócio:
     * - despesas fixas mensais = média das EXPENSE dos últimos 3 meses (até a data de referência)
     * - caixa disponível = soma INCOME - soma EXPENSE do ano da data de referência
     * - meses de reserva = caixa / despesas fixas mensais
     */
    private HealthStatus calculateHealth(UUID companyId, LocalDate referenceDate) {
        BigDecimal monthlyFixedExpenses = calculateMonthlyFixedExpenses(companyId, referenceDate);
        BigDecimal availableCash = calculateAvailableCash(companyId, referenceDate.getYear());

        if (monthlyFixedExpenses.compareTo(BigDecimal.ZERO) <= 0) {
            if (availableCash.compareTo(BigDecimal.ZERO) < 0) {
                return new HealthStatus("RED", "Cuidado — seu caixa está negativo", BigDecimal.ZERO);
            }
            return new HealthStatus("GREEN", "Negócio saudável — nenhuma despesa fixa registrada nos últimos meses", null);
        }

        if (availableCash.compareTo(BigDecimal.ZERO) <= 0) {
            return new HealthStatus("RED", "Cuidado — seu caixa está zerado ou negativo", BigDecimal.ZERO);
        }

        BigDecimal monthsOfReserve = availableCash.divide(monthlyFixedExpenses, 2, RoundingMode.HALF_UP);

        if (monthsOfReserve.compareTo(HEALTHY_THRESHOLD) > 0) {
            String months = monthsOfReserve.setScale(0, RoundingMode.DOWN).toPlainString();
            return new HealthStatus("GREEN", "Negócio saudável — reserva para " + months + " meses", monthsOfReserve);
        }

        if (monthsOfReserve.compareTo(WARNING_THRESHOLD) >= 0) {
            return new HealthStatus("YELLOW", "Atenção — suas despesas subiram, cuidado com o caixa", monthsOfReserve);
        }

        String days = monthsOfReserve.multiply(DAYS_PER_MONTH).setScale(0, RoundingMode.DOWN).toPlainString();
        return new HealthStatus("RED", "Cuidado — no ritmo atual seu caixa zera em " + days + " dias", monthsOfReserve);
    }

    private BigDecimal calculateMonthlyFixedExpenses(UUID companyId, LocalDate referenceDate) {
        LocalDate start = referenceDate.minusMonths(3).plusDays(1);

        BigDecimal totalExpenses = transactionRepository
                .findAllByCompanyIdAndTransactionDateBetweenOrderByTransactionDateDesc(companyId, start, referenceDate)
                .stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalExpenses.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateAvailableCash(UUID companyId, int year) {
        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear = LocalDate.of(year, 12, 31);

        List<Transaction> transactions = transactionRepository
                .findAllByCompanyIdAndTransactionDateBetweenOrderByTransactionDateDesc(companyId, startOfYear, endOfYear);

        BigDecimal income = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expenses = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return income.subtract(expenses);
    }

    private BigDecimal calculateGrossRevenue(List<Transaction> transactions) {
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTaxAmount(List<Transaction> transactions) {
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && t.getCategory() == TransactionCategory.TAX)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateOperationalCosts(List<Transaction> transactions) {
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && t.getCategory() != TransactionCategory.TAX)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateEBITDA(BigDecimal gross, BigDecimal operationalCosts) {
        return gross.subtract(operationalCosts);
    }

    private BigDecimal calculateNetRevenue(BigDecimal gross, BigDecimal taxAmount) {
        return gross.subtract(taxAmount);
    }

    private record HealthStatus(String level, String message, BigDecimal monthsOfReserve) {
    }
}
