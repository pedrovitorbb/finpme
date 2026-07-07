package com.finpme.backend.notification.dto;

import jakarta.validation.constraints.Size;

public record UpdateNotificationSettingsRequest(
        Boolean alert70Pct,
        Boolean alert85Pct,
        Boolean alert95Pct,
        Boolean channelWhatsapp,
        Boolean channelPlatform,
        @Size(max = 20) String whatsappNumber
) {
}
