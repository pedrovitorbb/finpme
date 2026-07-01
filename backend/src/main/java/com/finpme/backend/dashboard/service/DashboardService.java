package com.finpme.backend.dashboard.service;

import java.math.BigDecimal;
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

        return new DashboardResponse(
                year, month, grossRevenue, netRevenue, ebitda, taxAmount, operationalCosts, totalExpenses, transactions.size());
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
}
