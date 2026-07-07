package com.finpme.backend.notification.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finpme.backend.notification.entity.NotificationSettings;

public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, UUID> {

    Optional<NotificationSettings> findByUserId(UUID userId);
}
