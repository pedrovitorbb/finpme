package com.finpme.backend.transaction.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "bank_account_id")
    private UUID bankAccountId;

    @Column(name = "pluggy_tx_id")
    private String pluggyTxId;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private TransactionCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TransactionSource source;

    @Column(name = "transaction_date")
    private LocalDate transactionDate;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
