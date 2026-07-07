package com.finpme.backend.insight.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.finpme.backend.insight.entity.Insight;

public interface InsightRepository extends JpaRepository<Insight, UUID> {

    List<Insight> findAllByCompanyIdAndGeneratedForDateOrderByPriorityDesc(UUID companyId, LocalDate date);

    /**
     * Retorna o lote de insights mais recente da empresa
     * (todos os insights da última generated_for_date registrada).
     */
    @Query("""
            SELECT i FROM Insight i
            WHERE i.companyId = :companyId
              AND i.generatedForDate = (
                  SELECT MAX(i2.generatedForDate) FROM Insight i2 WHERE i2.companyId = :companyId)
            ORDER BY i.priority DESC
            """)
    List<Insight> findLatestByCompanyId(UUID companyId);
}
