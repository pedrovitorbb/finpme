package com.finpme.backend.company.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finpme.backend.company.entity.Company;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findByCnpj(String cnpj);

    boolean existsByCnpj(String cnpj);

    List<Company> findAllByOwnerIdAndActiveTrue(UUID ownerId);

    Optional<Company> findByIdAndOwnerId(UUID id, UUID ownerId);
}
