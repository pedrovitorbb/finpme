package com.finpme.backend.insight.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.finpme.backend.insight.entity.InsightType;

public record InsightResponse(
        UUID id,
        InsightType type,
        String title,
        String message,
        Integer priority,
        LocalDate generatedForDate,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {
}
