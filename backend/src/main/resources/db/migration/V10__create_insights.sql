-- ─────────────────────────────────────────────────────────────────────────
-- V10: Criação da tabela insights
--
-- Armazena os insights gerados pelo motor de IA para cada empresa
-- (recomendações financeiras, tributárias, de crescimento e de margem).
-- Cada lote de insights é vinculado à data de geração (generated_for_date),
-- permitindo exibir "os insights do dia" e manter histórico.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE insights (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID NOT NULL,
    generated_for_date  DATE NOT NULL,
    type                VARCHAR(30) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    message             TEXT NOT NULL,
    priority            INTEGER DEFAULT 0,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Chave estrangeira
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE insights
    ADD CONSTRAINT fk_insights_company FOREIGN KEY (company_id) REFERENCES companies (id);

-- ─────────────────────────────────────────────────────────────────────────
-- Constraint de valores válidos
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE insights
    ADD CONSTRAINT chk_insights_type CHECK (type IN ('FINANCEIRO', 'TRIBUTARIO', 'CRESCIMENTO', 'MARGEM'));

-- ─────────────────────────────────────────────────────────────────────────
-- Índice
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_insights_company_date ON insights (company_id, generated_for_date);

-- ─────────────────────────────────────────────────────────────────────────
-- Comentários de documentação
-- ─────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE insights IS 'Insights gerados pelo motor de IA para cada empresa';
COMMENT ON COLUMN insights.id IS 'Identificador único do insight (UUID gerado automaticamente)';
COMMENT ON COLUMN insights.company_id IS 'Empresa dona do insight (referência a companies.id)';
COMMENT ON COLUMN insights.generated_for_date IS 'Data de referência do lote de insights (os insights "do dia")';
COMMENT ON COLUMN insights.type IS 'Categoria do insight: FINANCEIRO, TRIBUTARIO, CRESCIMENTO ou MARGEM';
COMMENT ON COLUMN insights.title IS 'Título curto do insight';
COMMENT ON COLUMN insights.message IS 'Texto completo do insight em linguagem simples';
COMMENT ON COLUMN insights.priority IS 'Prioridade de exibição (maior = mais importante)';
COMMENT ON COLUMN insights.read_at IS 'Data e hora em que o usuário leu o insight; nulo enquanto não lido';
COMMENT ON COLUMN insights.created_at IS 'Data e hora de criação do registro';
