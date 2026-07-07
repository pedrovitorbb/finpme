package com.finpme.backend.notification.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finpme.backend.auth.entity.User;
import com.finpme.backend.notification.dto.NotificationSettingsResponse;
import com.finpme.backend.notification.dto.UpdateNotificationSettingsRequest;
import com.finpme.backend.notification.service.NotificationSettingsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notifications/settings")
@RequiredArgsConstructor
@Tag(name = "Notification Settings")
public class NotificationSettingsController {

    private final NotificationSettingsService notificationSettingsService;

    @GetMapping
    @Operation(summary = "Retorna as preferências de notificação do usuário autenticado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Preferências retornadas com sucesso")
    })
    public ResponseEntity<NotificationSettingsResponse> get() {
        return ResponseEntity.ok(notificationSettingsService.getByUser(getUserId()));
    }

    @PatchMapping
    @Operation(summary = "Atualiza parcialmente as preferências de notificação do usuário autenticado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Preferências atualizadas com sucesso")
    })
    public ResponseEntity<NotificationSettingsResponse> update(
            @Valid @RequestBody UpdateNotificationSettingsRequest request
    ) {
        return ResponseEntity.ok(notificationSettingsService.update(getUserId(), request));
    }

    private UUID getUserId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getId();
    }
}
