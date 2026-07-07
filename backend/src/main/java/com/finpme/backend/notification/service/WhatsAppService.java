package com.finpme.backend.notification.service;

import org.springframework.stereotype.Service;

import com.finpme.backend.auth.entity.User;
import com.finpme.backend.dashboard.dto.DashboardResponse;
import com.finpme.backend.debtor.entity.Debtor;
import com.finpme.backend.radar.dto.TaxRadarResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * Stub do serviço de envio de mensagens via WhatsApp. Por enquanto apenas
 * registra em log o que seria enviado; será substituído pela integração
 * real (WhatsApp Business API) quando ela for implementada.
 */
@Service
@Slf4j
public class WhatsAppService {

    public void sendWeeklySummary(User user, DashboardResponse dashboard) {
        log.info("[WhatsApp stub] Resumo semanal para {}: receita bruta R$ {}, despesas R$ {}, saúde {}",
                user.getEmail(), dashboard.grossRevenue(), dashboard.totalExpenses(), dashboard.healthLevel());
    }

    public void sendTaxAlert(User user, TaxRadarResponse radar) {
        log.info("[WhatsApp stub] Alerta tributário para {}: {} ({}% do limite usado)",
                user.getEmail(), radar.friendlyStatus(), radar.limitUsedPct());
    }

    public void sendDebtorReminder(User user, Debtor debtor) {
        log.info("[WhatsApp stub] Lembrete de cobrança para {}: {} deve R$ {} com vencimento em {}",
                user.getEmail(), debtor.getName(), debtor.getAmount(), debtor.getDueDate());
    }

    public void sendDasnDeadlineReminder(User user) {
        log.info("[WhatsApp stub] Lembrete de prazo da DASN-SIMEI para {}", user.getEmail());
    }
}
