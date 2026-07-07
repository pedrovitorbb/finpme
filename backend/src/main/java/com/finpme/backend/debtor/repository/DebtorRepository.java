package com.finpme.backend.debtor.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finpme.backend.debtor.entity.Debtor;
import com.finpme.backend.debtor.entity.DebtorStatus;

public interface DebtorRepository extends JpaRepository<Debtor, UUID> {

    List<Debtor> findAllByCompanyIdOrderByDueDateAsc(UUID companyId);

    List<Debtor> findAllByCompanyIdAndStatusOrderByDueDateAsc(UUID companyId, DebtorStatus status);

    Optional<Debtor> findByIdAndCompanyId(UUID id, UUID companyId);
}
