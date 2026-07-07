package com.finpme.backend.insight.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.finpme.backend.company.entity.Company;
import com.finpme.backend.insight.dto.MarginAnalysisResponse;
import com.finpme.backend.transaction.entity.Transaction;
import com.finpme.backend.transaction.entity.TransactionType;
import com.finpme.backend.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MarginAnalysisService {

    /**
     * Margens líquidas médias de referência (%) por CNAE, para os segmentos
     * mais comuns entre MEIs/microempresas. Valores hardcoded por enquanto;
     * futuramente virão de uma base de benchmarks.
     */
    private static final Map<String, BigDecimal> REFERENCE_MARGIN_BY_CNAE = Map.of(
            "4781400", new BigDecimal("15"),  // Comércio varejista de vestuário
            "5611201", new BigDecimal("12"),  // Restaurantes e similares
            "9602501", new BigDecimal("40"),  // Cabeleireiros, manicure e pedicure
            "4399103", new BigDecimal("25"),  // Obras de alvenaria
            "7319002", new BigDecimal("30")   // Promoção de vendas / marketing
    );

    private static final BigDecimal DEFAULT_REFERENCE_MARGIN = new BigDecimal("20");

    private final TransactionRepository transactionRepository;

    public MarginAnalysisResponse analyze(Company company) {
        LocalDate today = LocalDate.now();
        List<Transaction> transactions = transactionRepository
                .findAllByCompanyIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                        company.getId(), LocalDate.of(today.getYear(), 1, 1), today);

        BigDecimal revenue = sumByType(transactions, TransactionType.INCOME);
        BigDecimal expenses = sumByType(transactions, TransactionType.EXPENSE);
        BigDecimal referenceMargin = resolveReferenceMargin(company.getCnae());

        if (revenue.compareTo(BigDecimal.ZERO) <= 0) {
            return new MarginAnalysisResponse(null, referenceMargin, company.getCnae(), "UNKNOWN",
                    "Ainda não há receita registrada este ano para calcular sua margem.");
        }

        BigDecimal profit = revenue.subtract(expenses);
        BigDecimal actualMargin = profit
                .divide(revenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);

        String status = actualMargin.compareTo(referenceMargin) >= 0 ? "ABOVE_REFERENCE" : "BELOW_REFERENCE";
        String message = status.equals("ABOVE_REFERENCE")
                ? "Sua margem de " + actualMargin.toPlainString() + "% está acima da média do seu segmento ("
                        + referenceMargin.toPlainString() + "%). Continue assim!"
                : "Sua margem de " + actualMargin.toPlainString() + "% está abaixo da média do seu segmento ("
                        + referenceMargin.toPlainString() + "%). Vale revisar preços e custos.";

        return new MarginAnalysisResponse(actualMargin, referenceMargin, company.getCnae(), status, message);
    }

    private BigDecimal resolveReferenceMargin(String cnae) {
        if (cnae == null) {
            return DEFAULT_REFERENCE_MARGIN;
        }
        String normalized = cnae.replaceAll("\\D", "");
        return REFERENCE_MARGIN_BY_CNAE.getOrDefault(normalized, DEFAULT_REFERENCE_MARGIN);
    }

    private BigDecimal sumByType(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(t -> t.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
