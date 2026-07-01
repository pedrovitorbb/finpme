-- ─────────────────────────────────────────────────────────────────────────
-- V3: Criação da tabela bank_accounts
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE bank_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL,
    pluggy_item_id  VARCHAR(255) NOT NULL,
    bank_name       VARCHAR(100) NOT NULL,
    account_type    VARCHAR(30) NOT NULL,
    balance         NUMERIC(15,2) NOT NULL DEFAULT 0,
    last_synced_at  TIMESTAMPTZ,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Chave estrangeira
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE bank_accounts
    ADD CONSTRAINT fk_bank_accounts_company FOREIGN KEY (company_id) REFERENCES companies (id);

-- ─────────────────────────────────────────────────────────────────────────
-- Constraints de valores válidos
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE bank_accounts
    ADD CONSTRAINT chk_bank_accounts_account_type CHECK (account_type IN ('CHECKING', 'SAVINGS', 'CREDIT'));

-- ─────────────────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_bank_accounts_company_id ON bank_accounts (company_id);
CREATE INDEX idx_bank_accounts_pluggy_item_id ON bank_accounts (pluggy_item_id);
CREATE INDEX idx_bank_accounts_company_active ON bank_accounts (company_id, active);

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger para manter updated_at sincronizado a cada UPDATE
-- (reaproveita a função set_users_updated_at() criada na V1)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TRIGGER trg_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION set_users_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Comentários de documentação
-- ─────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE bank_accounts IS 'Contas bancárias das empresas, sincronizadas via Pluggy';
COMMENT ON COLUMN bank_accounts.id IS 'Identificador único da conta bancária (UUID gerado automaticamente)';
COMMENT ON COLUMN bank_accounts.company_id IS 'Empresa proprietária da conta (referência a companies.id)';
COMMENT ON COLUMN bank_accounts.pluggy_item_id IS 'Identificador do item na Pluggy referente a essa conexão bancária';
COMMENT ON COLUMN bank_accounts.bank_name IS 'Nome do banco/instituição financeira';
COMMENT ON COLUMN bank_accounts.account_type IS 'Tipo da conta: CHECKING, SAVINGS ou CREDIT';
COMMENT ON COLUMN bank_accounts.balance IS 'Saldo atual da conta';
COMMENT ON COLUMN bank_accounts.last_synced_at IS 'Data e hora da última sincronização com a Pluggy';
COMMENT ON COLUMN bank_accounts.active IS 'Indica se a conta está ativa na plataforma';
COMMENT ON COLUMN bank_accounts.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN bank_accounts.updated_at IS 'Data e hora da última atualização do registro (atualizada automaticamente via trigger)';
