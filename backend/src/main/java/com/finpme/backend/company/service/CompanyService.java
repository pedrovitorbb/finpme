package com.finpme.backend.company.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.finpme.backend.company.client.BrasilApiClient;
import com.finpme.backend.company.dto.BrasilApiResponse;
import com.finpme.backend.company.dto.CompanyResponse;
import com.finpme.backend.company.dto.CompanySummaryResponse;
import com.finpme.backend.company.dto.RegisterByCnpjRequest;
import com.finpme.backend.company.dto.RegisterManualRequest;
import com.finpme.backend.company.dto.UpdateTaxRegimeRequest;
import com.finpme.backend.company.entity.Company;
import com.finpme.backend.company.entity.CompanyStatus;
import com.finpme.backend.company.entity.TaxRegime;
import com.finpme.backend.company.exception.CompanyNotFoundException;
import com.finpme.backend.company.repository.CompanyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final BrasilApiClient brasilApiClient;

    public CompanyResponse registerByCnpj(RegisterByCnpjRequest request, UUID ownerId) {
        String cleanCnpj = cleanCnpj(request.cnpj());

        if (companyRepository.existsByCnpj(cleanCnpj)) {
            throw new IllegalStateException("CNPJ já cadastrado: " + cleanCnpj);
        }

        BrasilApiResponse apiResponse = brasilApiClient.fetchByCnpj(cleanCnpj);

        LocalDateTime now = LocalDateTime.now();
        Company company = Company.builder()
                .ownerId(ownerId)
                .cnpj(cleanCnpj)
                .razaoSocial(apiResponse.razao_social())
                .nomeFantasia(apiResponse.nome_fantasia())
                .taxRegime(request.taxRegimeOverride() != null ? request.taxRegimeOverride() : TaxRegime.SIMPLES_NACIONAL)
                .cnae(apiResponse.cnae_fiscal() != null ? String.valueOf(apiResponse.cnae_fiscal()) : null)
                .cnaeDescricao(apiResponse.cnae_fiscal_descricao())
                .status(mapStatus(apiResponse.situacao_cadastral()))
                .dataAbertura(apiResponse.data_inicio_atividade() != null ? LocalDate.parse(apiResponse.data_inicio_atividade()) : null)
                .logradouro(apiResponse.logradouro())
                .numero(apiResponse.numero())
                .complemento(apiResponse.complemento())
                .bairro(apiResponse.bairro())
                .municipio(apiResponse.municipio())
                .uf(apiResponse.uf())
                .cep(apiResponse.cep())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(companyRepository.save(company));
    }

    public CompanyResponse registerManual(RegisterManualRequest request, UUID ownerId) {
        String cleanCnpj = cleanCnpj(request.cnpj());

        if (companyRepository.existsByCnpj(cleanCnpj)) {
            throw new IllegalStateException("CNPJ já cadastrado: " + cleanCnpj);
        }

        LocalDateTime now = LocalDateTime.now();
        Company company = Company.builder()
                .ownerId(ownerId)
                .cnpj(cleanCnpj)
                .razaoSocial(request.razaoSocial())
                .nomeFantasia(request.nomeFantasia())
                .taxRegime(request.taxRegime() != null ? request.taxRegime() : TaxRegime.SIMPLES_NACIONAL)
                .cnae(request.cnae())
                .status(CompanyStatus.ATIVA)
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(companyRepository.save(company));
    }

    public List<CompanySummaryResponse> listByOwner(UUID ownerId) {
        return companyRepository.findAllByOwnerIdAndActiveTrue(ownerId).stream()
                .map(this::toSummary)
                .toList();
    }

    public CompanyResponse getById(UUID id, UUID ownerId) {
        Company company = companyRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new CompanyNotFoundException(id));

        return toResponse(company);
    }

    public CompanyResponse updateTaxRegime(UUID id, UpdateTaxRegimeRequest request, UUID ownerId) {
        Company company = companyRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new CompanyNotFoundException(id));

        company.setTaxRegime(request.taxRegime());
        company.setUpdatedAt(LocalDateTime.now());

        return toResponse(companyRepository.save(company));
    }

    public void deactivate(UUID id, UUID ownerId) {
        Company company = companyRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new CompanyNotFoundException(id));

        company.setActive(false);
        company.setUpdatedAt(LocalDateTime.now());

        companyRepository.save(company);
    }

    private String cleanCnpj(String cnpj) {
        return cnpj.replaceAll("[^0-9]", "");
    }

    private CompanyResponse toResponse(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getCnpj(),
                company.getRazaoSocial(),
                company.getNomeFantasia(),
                company.getTaxRegime(),
                company.getCnae(),
                company.getCnaeDescricao(),
                company.getStatus() != null ? company.getStatus().name() : null,
                company.getDataAbertura(),
                company.getMunicipio(),
                company.getUf(),
                company.getCreatedAt()
        );
    }

    private CompanySummaryResponse toSummary(Company company) {
        return new CompanySummaryResponse(
                company.getId(),
                company.getCnpj(),
                company.getRazaoSocial(),
                company.getTaxRegime(),
                company.getMunicipio(),
                company.getUf()
        );
    }

    private CompanyStatus mapStatus(Integer situacaoCadastral) {
        if (situacaoCadastral == null) {
            return CompanyStatus.ATIVA;
        }

        return switch (situacaoCadastral) {
            case 1 -> CompanyStatus.NULA;
            case 2 -> CompanyStatus.ATIVA;
            case 3 -> CompanyStatus.SUSPENSA;
            case 4 -> CompanyStatus.INAPTA;
            case 8 -> CompanyStatus.BAIXADA;
            default -> CompanyStatus.ATIVA;
        };
    }
}
