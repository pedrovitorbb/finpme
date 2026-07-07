package com.finpme.backend.notification.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notification_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "alert_70pct")
    private boolean alert70Pct;

    @Column(name = "alert_85pct")
    private boolean alert85Pct;

    @Column(name = "alert_95pct")
    private boolean alert95Pct;

    @Column(name = "channel_whatsapp")
    private boolean channelWhatsapp;

    @Column(name = "channel_platform")
    private boolean channelPlatform;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
