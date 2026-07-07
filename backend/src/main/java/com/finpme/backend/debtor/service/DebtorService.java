package com.finpme.backend.debtor.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.finpme.backend.company.exception.CompanyNotFoundException;
import com.finpme.backend.company.repository.CompanyRepository;
import com.finpme.backend.debtor.dto.CreateDebtorRequest;
import com.finpme.backend.debtor.dto.DebtorResponse;
import com.finpme.backend.debtor.dto.DebtorSummaryResponse;
import com.finpme.backend.debtor.dto.UpdateDebtorRequest;
import com.finpme.backend.debtor.entity.Debtor;
import com.finpme.backend.debtor.entity.DebtorStatus;
import com.finpme.backend.debtor.exception.DebtorNotFoundException;
import com.finpme.backend.debtor.repository.DebtorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DebtorService {

    private final DebtorRepository debtorRepository;
    private final CompanyRepository companyRepository;

    public DebtorResponse create(UUID companyId, UUID ownerId, CreateDebtorRequest request) {
        validateCompanyOwnership(companyId, ownerId);

        LocalDateTime now = LocalDateTime.now();
        Debtor debtor = Debtor.builder()
                .companyId(companyId)
                .name(request.name())
                .amount(request.amount())
                .dueDate(request.dueDate())
                .whatsappNumber(request.whatsappNumber())
                .status(initialStatus(request.dueDate()))
                .description(request.description())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(debtorRepository.save(debtor));
    }

    public List<DebtorResponse> list(UUID companyId, UUID ownerId, DebtorStatus status) {
        validateCompanyOwnership(companyId, ownerId);

        List<Debtor> debtors = status != null
                ? debtorRepository.findAllByCompanyIdAndStatusOrderByDueDateAsc(companyId, status)
                : debtorRepository.findAllByCompanyIdOrderByDueDateAsc(companyId);

        return debtors.stream()
                .map(this::refreshOverdueStatus)
                .map(this::toResponse)
                .toList();
    }

    public DebtorResponse getById(UUID id, UUID companyId, UUID ownerId) {
        validateCompanyOwnership(companyId, ownerId);
        return toResponse(refreshOverdueStatus(findDebtor(id, companyId)));
    }

    public DebtorResponse markAsPaid(UUID id, UUID companyId, UUID ownerId) {
        validateCompanyOwnership(companyId, ownerId);

        Debtor debtor = findDebtor(id, companyId);
        debtor.setStatus(DebtorStatus.PAID);
        debtor.setPaidAt(LocalDateTime.now());
        debtor.setUpdatedAt(LocalDateTime.now());

        return toResponse(debtorRepository.save(debtor));
    }

    public DebtorResponse update(UUID id, UUID companyId, UUID ownerId, UpdateDebtorRequest request) {
        validateCompanyOwnership(companyId, ownerId);

        Debtor debtor = findDebtor(id, companyId);

        if (request.name() != null) {
            debtor.setName(request.name());
        }
        if (request.amount() != null) {
            debtor.setAmount(request.amount());
        }
        if (request.dueDate() != null) {
            debtor.setDueDate(request.dueDate());
        }
        if (request.whatsappNumber() != null) {
            debtor.setWhatsappNumber(request.whatsappNumber());
        }
        if (request.status() != null) {
            debtor.setStatus(request.status());
            if (request.status() == DebtorStatus.PAID && debtor.getPaidAt() == null) {
                debtor.setPaidAt(LocalDateTime.now());
            }
            if (request.status() != DebtorStatus.PAID) {
                debtor.setPaidAt(null);
            }
        }
        if (request.description() != null) {
            debtor.setDescription(request.description());
        }
        debtor.setUpdatedAt(LocalDateTime.now());

        return toResponse(debtorRepository.save(debtor));
    }

    public void delete(UUID id, UUID companyId, UUID ownerId) {
        validateCompanyOwnership(companyId, ownerId);
        debtorRepository.delete(findDebtor(id, companyId));
    }

    public DebtorSummaryResponse getSummary(UUID companyId, UUID ownerId) {
        validateCompanyOwnership(companyId, ownerId);

        List<Debtor> debtors = debtorRepository.findAllByCompanyIdOrderByDueDateAsc(companyId)
                .stream()
                .map(this::refreshOverdueStatus)
                .toList();

        return new DebtorSummaryResponse(
                countByStatus(debtors, DebtorStatus.PENDING),
                sumByStatus(debtors, DebtorStatus.PENDING),
                countByStatus(debtors, DebtorStatus.OVERDUE),
                sumByStatus(debtors, DebtorStatus.OVERDUE),
                countByStatus(debtors, DebtorStatus.PAID),
                sumByStatus(debtors, DebtorStatus.PAID));
    }

    private DebtorStatus initialStatus(LocalDate dueDate) {
        return dueDate.isBefore(LocalDate.now()) ? DebtorStatus.OVERDUE : DebtorStatus.PENDING;
    }

    /**
     * Promove PENDING para OVERDUE quando o vencimento já passou,
     * persistindo a mudança para manter o banco consistente.
     */
    private Debtor refreshOverdueStatus(Debtor debtor) {
        if (debtor.getStatus() == DebtorStatus.PENDING && debtor.getDueDate().isBefore(LocalDate.now())) {
            debtor.setStatus(DebtorStatus.OVERDUE);
            debtor.setUpdatedAt(LocalDateTime.now());
            return debtorRepository.save(debtor);
        }
        return debtor;
    }

    private Debtor findDebtor(UUID id, UUID companyId) {
        return debtorRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new DebtorNotFoundException(id));
    }

    private void validateCompanyOwnership(UUID companyId, UUID ownerId) {
        companyRepository.findByIdAndOwnerId(companyId, ownerId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));
    }

    private long countByStatus(List<Debtor> debtors, DebtorStatus status) {
        return debtors.stream().filter(d -> d.getStatus() == status).count();
    }

    private BigDecimal sumByStatus(List<Debtor> debtors, DebtorStatus status) {
        return debtors.stream()
                .filter(d -> d.getStatus() == status)
                .map(Debtor::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private DebtorResponse toResponse(Debtor debtor) {
        return new DebtorResponse(
                debtor.getId(),
                debtor.getCompanyId(),
                debtor.getName(),
                debtor.getAmount(),
                debtor.getDueDate(),
                debtor.getWhatsappNumber(),
                debtor.getStatus() != null ? debtor.getStatus().name() : null,
                debtor.getPaidAt(),
                debtor.getDescription(),
                debtor.getCreatedAt());
    }
}
