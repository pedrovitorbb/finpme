-- ─────────────────────────────────────────────────────────────────────────
-- V6: Criação da tabela tax_alerts
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE tax_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL,
    alert_type      VARCHAR(30) NOT NULL,
    threshold_pct   NUMERIC(5,2),
    channel         VARCHAR(20) NOT NULL DEFAULT 'WHATSAPP',
    status          VARCHAR(20) NOT NULL DEFAULT 'SENT',
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Chave estrangeira
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE tax_alerts
    ADD CONSTRAINT fk_tax_alerts_company FOREIGN KEY (company_id) REFERENCES companies (id);

-- ─────────────────────────────────────────────────────────────────────────
-- Constraints de valores válidos
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE tax_alerts
    ADD CONSTRAINT chk_tax_alerts_alert_type CHECK (alert_type IN ('LIMIT_70', 'LIMIT_85', 'LIMIT_95', 'DASN_DEADLINE'));

ALTER TABLE tax_alerts
    ADD CONSTRAINT chk_tax_alerts_channel CHECK (channel IN ('WHATSAPP', 'PLATFORM'));

ALTER TABLE tax_alerts
    ADD CONSTRAINT chk_tax_alerts_status CHECK (status IN ('SENT', 'FAILED', 'PENDING'));

-- ─────────────────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_tax_alerts_company_id ON tax_alerts (company_id);
CREATE INDEX idx_tax_alerts_company_alert_type ON tax_alerts (company_id, alert_type);
CREATE INDEX idx_tax_alerts_sent_at ON tax_alerts (sent_at);

-- ─────────────────────────────────────────────────────────────────────────
-- Comentários de documentação
-- ─────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE tax_alerts IS 'Histórico imutável de alertas tributários enviados às empresas';
COMMENT ON COLUMN tax_alerts.id IS 'Identificador único do alerta (UUID gerado automaticamente)';
COMMENT ON COLUMN tax_alerts.company_id IS 'Empresa que recebeu o alerta (referência a companies.id)';
COMMENT ON COLUMN tax_alerts.alert_type IS 'Tipo do alerta: LIMIT_70, LIMIT_85, LIMIT_95 ou DASN_DEADLINE';
COMMENT ON COLUMN tax_alerts.threshold_pct IS 'Percentual do limite que disparou o alerta; nulo para DASN_DEADLINE';
COMMENT ON COLUMN tax_alerts.channel IS 'Canal de envio do alerta: WHATSAPP ou PLATFORM';
COMMENT ON COLUMN tax_alerts.status IS 'Status do envio: SENT, FAILED ou PENDING';
COMMENT ON COLUMN tax_alerts.sent_at IS 'Data e hora em que o alerta foi enviado';
COMMENT ON COLUMN tax_alerts.created_at IS 'Data e hora de criação do registro';
