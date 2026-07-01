package com.finpme.backend.transaction.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finpme.backend.transaction.entity.Transaction;
import com.finpme.backend.transaction.entity.TransactionType;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findAllByCompanyIdOrderByTransactionDateDesc(UUID companyId);

    List<Transaction> findAllByCompanyIdAndTypeOrderByTransactionDateDesc(UUID companyId, TransactionType type);

    List<Transaction> findAllByCompanyIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            UUID companyId, LocalDate start, LocalDate end);

    boolean existsByPluggyTxId(String pluggyTxId);

    Optional<Transaction> findByIdAndCompanyId(UUID id, UUID companyId);
}
