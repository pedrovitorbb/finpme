-- ─────────────────────────────────────────────────────────────────────────
-- V9: Criação da tabela debtors
--
-- Registra clientes que devem dinheiro à empresa ("caderninho de fiado"),
-- permitindo acompanhar vencimentos, marcar pagamentos e futuramente
-- disparar lembretes de cobrança via WhatsApp.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE debtors (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id        UUID NOT NULL,
    name              VARCHAR(255) NOT NULL,
    amount            NUMERIC(15,2) NOT NULL,
    due_date          DATE NOT NULL,
    whatsapp_number   VARCHAR(20),
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    paid_at           TIMESTAMPTZ,
    description       VARCHAR(500),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Chave estrangeira
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE debtors
    ADD CONSTRAINT fk_debtors_company FOREIGN KEY (company_id) REFERENCES companies (id);

-- ─────────────────────────────────────────────────────────────────────────
-- Constraint de valores válidos
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE debtors
    ADD CONSTRAINT chk_debtors_status CHECK (status IN ('PENDING', 'PAID', 'OVERDUE'));

-- ─────────────────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_debtors_company_id ON debtors (company_id);
CREATE INDEX idx_debtors_status ON debtors (status);
CREATE INDEX idx_debtors_due_date ON debtors (due_date);

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger para manter updated_at sincronizado a cada UPDATE
-- (reaproveita a função set_users_updated_at() criada na V1)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TRIGGER trg_debtors_updated_at
    BEFORE UPDATE ON debtors
    FOR EACH ROW
    EXECUTE FUNCTION set_users_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Comentários de documentação
-- ─────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE debtors IS 'Clientes devedores da empresa (contas a receber informais / fiado)';
COMMENT ON COLUMN debtors.id IS 'Identificador único do devedor (UUID gerado automaticamente)';
COMMENT ON COLUMN debtors.company_id IS 'Empresa credora (referência a companies.id)';
COMMENT ON COLUMN debtors.name IS 'Nome do cliente devedor';
COMMENT ON COLUMN debtors.amount IS 'Valor devido';
COMMENT ON COLUMN debtors.due_date IS 'Data de vencimento da dívida';
COMMENT ON COLUMN debtors.whatsapp_number IS 'Número de WhatsApp do devedor para lembretes de cobrança';
COMMENT ON COLUMN debtors.status IS 'Situação da dívida: PENDING, PAID ou OVERDUE';
COMMENT ON COLUMN debtors.paid_at IS 'Data e hora em que a dívida foi marcada como paga';
COMMENT ON COLUMN debtors.description IS 'Descrição livre da dívida (ex: produto vendido, acordo feito)';
COMMENT ON COLUMN debtors.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN debtors.updated_at IS 'Data e hora da última atualização do registro (atualizada automaticamente via trigger)';
