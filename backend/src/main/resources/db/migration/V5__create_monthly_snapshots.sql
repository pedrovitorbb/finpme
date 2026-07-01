-- ─────────────────────────────────────────────────────────────────────────
-- V5: Criação da tabela monthly_snapshots
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE monthly_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL,
    year            INTEGER NOT NULL,
    month           INTEGER NOT NULL,
    gross_revenue   NUMERIC(15,2) NOT NULL DEFAULT 0,
    net_revenue     NUMERIC(15,2) NOT NULL DEFAULT 0,
    ebitda          NUMERIC(15,2) NOT NULL DEFAULT 0,
    ytd_revenue     NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_limit_pct   NUMERIC(5,2) NOT NULL DEFAULT 0,
    calculated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_monthly_snapshots_company_year_month UNIQUE (company_id, year, month)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Chave estrangeira
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE monthly_snapshots
    ADD CONSTRAINT fk_monthly_snapshots_company FOREIGN KEY (company_id) REFERENCES companies (id);

-- ─────────────────────────────────────────────────────────────────────────
-- Constraints de valores válidos
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE monthly_snapshots
    ADD CONSTRAINT chk_monthly_snapshots_month CHECK (month BETWEEN 1 AND 12);

ALTER TABLE monthly_snapshots
    ADD CONSTRAINT chk_monthly_snapshots_year CHECK (year >= 2024);

-- ─────────────────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_monthly_snapshots_company_id ON monthly_snapshots (company_id);
CREATE INDEX idx_monthly_snapshots_company_year ON monthly_snapshots (company_id, year);

-- ─────────────────────────────────────────────────────────────────────────
-- Comentários de documentação
-- ─────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE monthly_snapshots IS 'Fotografias mensais consolidadas dos indicadores financeiros de cada empresa';
COMMENT ON COLUMN monthly_snapshots.id IS 'Identificador único do snapshot (UUID gerado automaticamente)';
COMMENT ON COLUMN monthly_snapshots.company_id IS 'Empresa a que o snapshot pertence (referência a companies.id)';
COMMENT ON COLUMN monthly_snapshots.year IS 'Ano de referência do snapshot';
COMMENT ON COLUMN monthly_snapshots.month IS 'Mês de referência do snapshot (1 a 12)';
COMMENT ON COLUMN monthly_snapshots.gross_revenue IS 'Receita bruta do mês';
COMMENT ON COLUMN monthly_snapshots.net_revenue IS 'Receita líquida do mês';
COMMENT ON COLUMN monthly_snapshots.ebitda IS 'EBITDA calculado para o mês';
COMMENT ON COLUMN monthly_snapshots.ytd_revenue IS 'Receita acumulada no ano até o mês (year-to-date)';
COMMENT ON COLUMN monthly_snapshots.tax_limit_pct IS 'Percentual do limite de faturamento do regime tributário já consumido';
COMMENT ON COLUMN monthly_snapshots.calculated_at IS 'Data e hora em que o snapshot foi calculado, atualizada pelo NightlySnapshotJob';
