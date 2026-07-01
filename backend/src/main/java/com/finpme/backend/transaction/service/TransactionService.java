package com.finpme.backend.transaction.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.finpme.backend.company.exception.CompanyNotFoundException;
import com.finpme.backend.company.repository.CompanyRepository;
import com.finpme.backend.transaction.dto.CreateTransactionRequest;
import com.finpme.backend.transaction.dto.TransactionFilterRequest;
import com.finpme.backend.transaction.dto.TransactionResponse;
import com.finpme.backend.transaction.dto.UpdateTransactionRequest;
import com.finpme.backend.transaction.entity.Transaction;
import com.finpme.backend.transaction.entity.TransactionSource;
import com.finpme.backend.transaction.exception.TransactionNotFoundException;
import com.finpme.backend.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CompanyRepository companyRepository;

    public TransactionResponse create(UUID companyId, UUID ownerId, CreateTransactionRequest request) {
        validateCompanyOwnership(companyId, ownerId);

        LocalDateTime now = LocalDateTime.now();
        Transaction transaction = Transaction.builder()
                .companyId(companyId)
                .amount(request.amount())
                .type(request.type())
                .category(request.category())
                .source(TransactionSource.MANUAL)
                .transactionDate(request.transactionDate())
                .description(request.description())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(transactionRepository.save(transaction));
    }

    public List<TransactionResponse> list(UUID companyId, UUID ownerId, TransactionFilterRequest filter) {
        validateCompanyOwnership(companyId, ownerId);

        List<Transaction> transactions;
        if (filter.startDate() != null && filter.endDate() != null) {
            transactions = transactionRepository.findAllByCompanyIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                    companyId, filter.startDate(), filter.endDate());
        } else if (filter.type() != null) {
            transactions = transactionRepository.findAllByCompanyIdAndTypeOrderByTransactionDateDesc(companyId, filter.type());
        } else {
            transactions = transactionRepository.findAllByCompanyIdOrderByTransactionDateDesc(companyId);
        }

        return transactions.stream().map(this::toResponse).toList();
    }

    public TransactionResponse getById(UUID id, UUID companyId, UUID ownerId) {
        validateCompanyOwnership(companyId, ownerId);

        Transaction transaction = transactionRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new TransactionNotFoundException(id));

        return toResponse(transaction);
    }

    public TransactionResponse update(UUID id, UUID companyId, UUID ownerId, UpdateTransactionRequest request) {
        validateCompanyOwnership(companyId, ownerId);

        Transaction transaction = transactionRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new TransactionNotFoundException(id));

        if (request.amount() != null) {
            transaction.setAmount(request.amount());
        }
        if (request.type() != null) {
            transaction.setType(request.type());
        }
        if (request.category() != null) {
            transaction.setCategory(request.category());
        }
        if (request.transactionDate() != null) {
            transaction.setTransactionDate(request.transactionDate());
        }
        if (request.description() != null) {
            transaction.setDescription(request.description());
        }
        transaction.setUpdatedAt(LocalDateTime.now());

        return toResponse(transactionRepository.save(transaction));
    }

    public void delete(UUID id, UUID companyId, UUID ownerId) {
        validateCompanyOwnership(companyId, ownerId);

        Transaction transaction = transactionRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new TransactionNotFoundException(id));

        transactionRepository.delete(transaction);
    }

    private void validateCompanyOwnership(UUID companyId, UUID ownerId) {
        companyRepository.findByIdAndOwnerId(companyId, ownerId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getCompanyId(),
                transaction.getAmount(),
                transaction.getType() != null ? transaction.getType().name() : null,
                transaction.getCategory() != null ? transaction.getCategory().name() : null,
                transaction.getSource() != null ? transaction.getSource().name() : null,
                transaction.getTransactionDate(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }
}
