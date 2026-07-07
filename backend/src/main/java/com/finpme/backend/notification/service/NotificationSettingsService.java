package com.finpme.backend.notification.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.finpme.backend.notification.dto.NotificationSettingsResponse;
import com.finpme.backend.notification.dto.UpdateNotificationSettingsRequest;
import com.finpme.backend.notification.entity.NotificationSettings;
import com.finpme.backend.notification.repository.NotificationSettingsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationSettingsService {

    private final NotificationSettingsRepository notificationSettingsRepository;

    public NotificationSettingsResponse getByUser(UUID userId) {
        NotificationSettings settings = notificationSettingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultForUser(userId));
        return toResponse(settings);
    }

    public NotificationSettingsResponse update(UUID userId, UpdateNotificationSettingsRequest request) {
        NotificationSettings settings = notificationSettingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultForUser(userId));

        if (request.alert70Pct() != null) {
            settings.setAlert70Pct(request.alert70Pct());
        }
        if (request.alert85Pct() != null) {
            settings.setAlert85Pct(request.alert85Pct());
        }
        if (request.alert95Pct() != null) {
            settings.setAlert95Pct(request.alert95Pct());
        }
        if (request.channelWhatsapp() != null) {
            settings.setChannelWhatsapp(request.channelWhatsapp());
        }
        if (request.channelPlatform() != null) {
            settings.setChannelPlatform(request.channelPlatform());
        }
        if (request.whatsappNumber() != null) {
            settings.setWhatsappNumber(request.whatsappNumber());
        }
        settings.setUpdatedAt(LocalDateTime.now());

        return toResponse(notificationSettingsRepository.save(settings));
    }

    /**
     * Cria as configurações padrão de notificação (todos os alertas e canais
     * habilitados). Chamado no registro de novos usuários e sob demanda para
     * usuários criados antes desta funcionalidade existir.
     */
    public NotificationSettings createDefaultForUser(UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        NotificationSettings settings = NotificationSettings.builder()
                .userId(userId)
                .alert70Pct(true)
                .alert85Pct(true)
                .alert95Pct(true)
                .channelWhatsapp(true)
                .channelPlatform(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return notificationSettingsRepository.save(settings);
    }

    private NotificationSettingsResponse toResponse(NotificationSettings settings) {
        return new NotificationSettingsResponse(
                settings.getId(),
                settings.isAlert70Pct(),
                settings.isAlert85Pct(),
                settings.isAlert95Pct(),
                settings.isChannelWhatsapp(),
                settings.isChannelPlatform(),
                settings.getWhatsappNumber());
    }
}
