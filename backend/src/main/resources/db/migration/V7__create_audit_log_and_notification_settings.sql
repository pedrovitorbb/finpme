-- ─────────────────────────────────────────────────────────────────────────
-- V7: Criação das tabelas audit_log e notification_settings
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE audit_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,
    action       VARCHAR(100) NOT NULL,
    entity       VARCHAR(50),
    entity_id    UUID,
    ip_address   VARCHAR(45),
    user_agent   VARCHAR(500),
    payload      JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- audit_log — chave estrangeira
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE audit_log
    ADD CONSTRAINT fk_audit_log_user FOREIGN KEY (user_id) REFERENCES users (id);

-- ─────────────────────────────────────────────────────────────────────────
-- audit_log — índices
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_audit_log_user_id ON audit_log (user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at);
CREATE INDEX idx_audit_log_user_action ON audit_log (user_id, action);

-- ─────────────────────────────────────────────────────────────────────────
-- audit_log — comentários de documentação
-- ─────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE audit_log IS 'Registro imutável de auditoria das ações realizadas pelos usuários';
COMMENT ON COLUMN audit_log.id IS 'Identificador único do registro de auditoria (UUID gerado automaticamente)';
COMMENT ON COLUMN audit_log.user_id IS 'Usuário que executou a ação (referência a users.id)';
COMMENT ON COLUMN audit_log.action IS 'Ação executada (ex: USER_LOGIN, COMPANY_CREATED, TAX_REGIME_UPDATED)';
COMMENT ON COLUMN audit_log.entity IS 'Entidade afetada pela ação (ex: users, companies, transactions)';
COMMENT ON COLUMN audit_log.entity_id IS 'Identificador do registro afetado; nulo quando não aplicável';
COMMENT ON COLUMN audit_log.ip_address IS 'Endereço IP de origem da ação (suporta IPv6)';
COMMENT ON COLUMN audit_log.user_agent IS 'User agent do cliente que executou a ação';
COMMENT ON COLUMN audit_log.payload IS 'Dados relevantes da ação em formato JSON';
COMMENT ON COLUMN audit_log.created_at IS 'Data e hora de criação do registro';

CREATE TABLE notification_settings (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL UNIQUE,
    alert_70pct        BOOLEAN NOT NULL DEFAULT TRUE,
    alert_85pct        BOOLEAN NOT NULL DEFAULT TRUE,
    alert_95pct        BOOLEAN NOT NULL DEFAULT TRUE,
    channel_whatsapp   BOOLEAN NOT NULL DEFAULT TRUE,
    channel_platform   BOOLEAN NOT NULL DEFAULT TRUE,
    whatsapp_number    VARCHAR(20),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- notification_settings — chave estrangeira
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE notification_settings
    ADD CONSTRAINT fk_notification_settings_user FOREIGN KEY (user_id) REFERENCES users (id);

-- ─────────────────────────────────────────────────────────────────────────
-- notification_settings — trigger para manter updated_at sincronizado
-- (reaproveita a função set_users_updated_at() criada na V1)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TRIGGER trg_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION set_users_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- notification_settings — comentários de documentação
-- ─────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE notification_settings IS 'Preferências de notificação e alerta de cada usuário (relação 1:1 com users)';
COMMENT ON COLUMN notification_settings.id IS 'Identificador único da configuração (UUID gerado automaticamente)';
COMMENT ON COLUMN notification_settings.user_id IS 'Usuário dono da configuração (referência única a users.id)';
COMMENT ON COLUMN notification_settings.alert_70pct IS 'Indica se o usuário deseja receber alerta ao atingir 70% do limite';
COMMENT ON COLUMN notification_settings.alert_85pct IS 'Indica se o usuário deseja receber alerta ao atingir 85% do limite';
COMMENT ON COLUMN notification_settings.alert_95pct IS 'Indica se o usuário deseja receber alerta ao atingir 95% do limite';
COMMENT ON COLUMN notification_settings.channel_whatsapp IS 'Indica se os alertas devem ser enviados via WhatsApp';
COMMENT ON COLUMN notification_settings.channel_platform IS 'Indica se os alertas devem ser enviados via plataforma';
COMMENT ON COLUMN notification_settings.whatsapp_number IS 'Número de WhatsApp para envio dos alertas';
COMMENT ON COLUMN notification_settings.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN notification_settings.updated_at IS 'Data e hora da última atualização do registro (atualizada automaticamente via trigger)';
