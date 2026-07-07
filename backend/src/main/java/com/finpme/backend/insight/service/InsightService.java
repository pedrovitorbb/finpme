package com.finpme.backend.insight.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finpme.backend.company.entity.Company;
import com.finpme.backend.company.exception.CompanyNotFoundException;
import com.finpme.backend.company.repository.CompanyRepository;
import com.finpme.backend.dashboard.dto.DashboardResponse;
import com.finpme.backend.dashboard.service.DashboardService;
import com.finpme.backend.debtor.dto.DebtorSummaryResponse;
import com.finpme.backend.debtor.service.DebtorService;
import com.finpme.backend.insight.dto.InsightRequest;
import com.finpme.backend.insight.dto.InsightResponse;
import com.finpme.backend.insight.dto.MarginAnalysisResponse;
import com.finpme.backend.insight.entity.Insight;
import com.finpme.backend.insight.entity.InsightType;
import com.finpme.backend.insight.repository.InsightRepository;
import com.finpme.backend.radar.dto.TaxRadarResponse;
import com.finpme.backend.radar.service.TaxRadarService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InsightService {

    private final InsightRepository insightRepository;
    private final CompanyRepository companyRepository;
    private final DashboardService dashboardService;
    private final TaxRadarService taxRadarService;
    private final MarginAnalysisService marginAnalysisService;
    private final DebtorService debtorService;

    /**
     * Retorna os insights do dia da empresa, gerando um novo lote caso
     * ainda não exista nenhum para a data atual.
     */
    @Transactional
    public List<InsightResponse> getLatest(UUID companyId, UUID ownerId) {
        companyRepository.findByIdAndOwnerId(companyId, ownerId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        LocalDate today = LocalDate.now();
        List<Insight> existing = insightRepository
                .findAllByCompanyIdAndGeneratedForDateOrderByPriorityDesc(companyId, today);

        if (!existing.isEmpty()) {
            return existing.stream().map(this::toResponse).toList();
        }

        List<InsightResponse> generated = generateInsights(companyId);
        return saveInsights(companyId, generated);
    }

    /**
     * Agrega o contexto financeiro completo da empresa (dashboard, radar
     * tributário, análise de margem e devedores) que será enviado à IA.
     */
    public InsightRequest buildInsightContext(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        LocalDate today = LocalDate.now();
        UUID ownerId = company.getOwnerId();

        DashboardResponse dashboard = dashboardService.getDashboard(
                companyId, ownerId, today.getYear(), today.getMonthValue());
        TaxRadarResponse taxRadar = taxRadarService.getRadar(companyId, ownerId);
        MarginAnalysisResponse margin = marginAnalysisService.analyze(company);
        DebtorSummaryResponse debtors = debtorService.getSummary(companyId, ownerId);

        return new InsightRequest(
                companyId,
                company.getNomeFantasia() != null ? company.getNomeFantasia() : company.getRazaoSocial(),
                company.getCnae(),
                company.getCnaeDescricao(),
                company.getTaxRegime() != null ? company.getTaxRegime().name() : null,
                today,
                dashboard,
                taxRadar,
                margin,
                debtors);
    }

    @Transactional
    public List<InsightResponse> saveInsights(UUID companyId, List<InsightResponse> insights) {
        LocalDateTime now = LocalDateTime.now();

        List<Insight> entities = insights.stream()
                .map(i -> Insight.builder()
                        .companyId(companyId)
                        .generatedForDate(i.generatedForDate() != null ? i.generatedForDate() : LocalDate.now())
                        .type(i.type())
                        .title(i.title())
                        .message(i.message())
                        .priority(i.priority() != null ? i.priority() : 0)
                        .createdAt(now)
                        .build())
                .toList();

        return insightRepository.saveAll(entities).stream().map(this::toResponse).toList();
    }

    /**
     * Stub do motor de IA: monta o contexto agregado (que futuramente será
     * enviado à Claude API) e devolve 3 insights fixos de exemplo. Será
     * substituído pela chamada real quando a integração for implementada.
     */
    public List<InsightResponse> generateInsights(UUID companyId) {
        InsightRequest context = buildInsightContext(companyId);
        LocalDate today = LocalDate.now();

        InsightResponse financeiro = new InsightResponse(null, InsightType.FINANCEIRO,
                "Acompanhe seu caixa de perto",
                "Registrar todas as entradas e saídas da semana ajuda a enxergar para onde o dinheiro está indo. "
                        + "Reserve 10 minutos toda sexta-feira para conferir seus lançamentos.",
                3, today, null, null);

        InsightResponse tributario = new InsightResponse(null, InsightType.TRIBUTARIO,
                "Fique de olho no limite do seu regime",
                context.taxRadar() != null && context.taxRadar().friendlyStatus() != null
                        ? context.taxRadar().friendlyStatus()
                        : "Acompanhe seu faturamento acumulado para não ser pego de surpresa pelo teto do seu regime tributário.",
                2, today, null, null);

        InsightResponse margem = new InsightResponse(null, InsightType.MARGEM,
                "Como está sua margem de lucro?",
                context.margin() != null && context.margin().message() != null
                        ? context.margin().message()
                        : "Compare sua margem de lucro com a média do seu segmento para saber se seus preços estão bem calibrados.",
                1, today, null, null);

        return List.of(financeiro, tributario, margem);
    }

    private InsightResponse toResponse(Insight insight) {
        return new InsightResponse(
                insight.getId(),
                insight.getType(),
                insight.getTitle(),
                insight.getMessage(),
                insight.getPriority(),
                insight.getGeneratedForDate(),
                insight.getReadAt(),
                insight.getCreatedAt());
    }
}
