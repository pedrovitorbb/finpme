package com.finpme.backend.notification.dto;

import java.util.UUID;

public record NotificationSettingsResponse(
        UUID id,
        boolean alert70Pct,
        boolean alert85Pct,
        boolean alert95Pct,
        boolean channelWhatsapp,
        boolean channelPlatform,
        String whatsappNumber
) {
}
