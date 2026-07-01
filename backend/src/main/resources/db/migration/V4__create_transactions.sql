-- ─────────────────────────────────────────────────────────────────────────
-- V4: Criação da tabela transactions
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id        UUID NOT NULL,
    bank_account_id   UUID,
    pluggy_tx_id      VARCHAR(255) UNIQUE,
    amount            NUMERIC(15,2) NOT NULL,
    type              VARCHAR(10) NOT NULL,
    category          VARCHAR(50),
    source            VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    transaction_date  DATE NOT NULL,
    description       VARCHAR(500),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Chaves estrangeiras
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_company FOREIGN KEY (company_id) REFERENCES companies (id);

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_bank_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts (id);

-- ─────────────────────────────────────────────────────────────────────────
-- Constraints de valores válidos
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE transactions
    ADD CONSTRAINT chk_transactions_type CHECK (type IN ('INCOME', 'EXPENSE'));

ALTER TABLE transactions
    ADD CONSTRAINT chk_transactions_category CHECK (category IN ('SALE', 'SUPPLIER', 'TAX', 'SALARY', 'RENT', 'OTHER'));

ALTER TABLE transactions
    ADD CONSTRAINT chk_transactions_source CHECK (source IN ('MANUAL', 'PLUGGY'));

-- ─────────────────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_transactions_company_id ON transactions (company_id);
CREATE INDEX idx_transactions_transaction_date ON transactions (transaction_date);
CREATE INDEX idx_transactions_company_date ON transactions (company_id, transaction_date);
CREATE INDEX idx_transactions_company_type ON transactions (company_id, type);

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger para manter updated_at sincronizado a cada UPDATE
-- (reaproveita a função set_users_updated_at() criada na V1)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_users_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Comentários de documentação
-- ─────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE transactions IS 'Transações financeiras (receitas e despesas) das empresas';
COMMENT ON COLUMN transactions.id IS 'Identificador único da transação (UUID gerado automaticamente)';
COMMENT ON COLUMN transactions.company_id IS 'Empresa dona da transação (referência a companies.id)';
COMMENT ON COLUMN transactions.bank_account_id IS 'Conta bancária de origem da transação (referência a bank_accounts.id); nulo quando a transação é manual';
COMMENT ON COLUMN transactions.pluggy_tx_id IS 'Identificador da transação na Pluggy, usado para garantir idempotência na importação';
COMMENT ON COLUMN transactions.amount IS 'Valor da transação';
COMMENT ON COLUMN transactions.type IS 'Tipo da transação: INCOME ou EXPENSE';
COMMENT ON COLUMN transactions.category IS 'Categoria da transação: SALE, SUPPLIER, TAX, SALARY, RENT ou OTHER';
COMMENT ON COLUMN transactions.source IS 'Origem da transação: MANUAL ou PLUGGY';
COMMENT ON COLUMN transactions.transaction_date IS 'Data em que a transação ocorreu';
COMMENT ON COLUMN transactions.description IS 'Descrição livre da transação';
COMMENT ON COLUMN transactions.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN transactions.updated_at IS 'Data e hora da última atualização do registro (atualizada automaticamente via trigger)';
