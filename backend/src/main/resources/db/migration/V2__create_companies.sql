-- ─────────────────────────────────────────────────────────────────────────
-- V2: Criação da tabela companies
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL,
    cnpj            VARCHAR(14) NOT NULL UNIQUE,
    razao_social    VARCHAR(255) NOT NULL,
    nome_fantasia   VARCHAR(255),
    tax_regime      VARCHAR(30) NOT NULL DEFAULT 'SIMPLES_NACIONAL',
    cnae            VARCHAR(10),
    cnae_descricao  VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'ATIVA',
    data_abertura   DATE,
    logradouro      VARCHAR(255),
    numero          VARCHAR(10),
    complemento     VARCHAR(100),
    bairro          VARCHAR(100),
    municipio       VARCHAR(100),
    uf              CHAR(2),
    cep             VARCHAR(9),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Chave estrangeira
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE companies
    ADD CONSTRAINT fk_companies_owner FOREIGN KEY (owner_id) REFERENCES users (id);

-- ─────────────────────────────────────────────────────────────────────────
-- Constraints de valores válidos
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE companies
    ADD CONSTRAINT chk_companies_tax_regime CHECK (tax_regime IN ('MEI', 'SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL'));

ALTER TABLE companies
    ADD CONSTRAINT chk_companies_status CHECK (status IN ('ATIVA', 'SUSPENSA', 'INAPTA', 'BAIXADA', 'NULA'));

-- ─────────────────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_companies_owner_id ON companies (owner_id);
CREATE INDEX idx_companies_cnpj ON companies (cnpj);
CREATE INDEX idx_companies_owner_active ON companies (owner_id, active);

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger para manter updated_at sincronizado a cada UPDATE
-- (reaproveita a função set_users_updated_at() criada na V1)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION set_users_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Comentários de documentação
-- ─────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE companies IS 'Empresas cadastradas pelos usuários da plataforma FinPME';
COMMENT ON COLUMN companies.id IS 'Identificador único da empresa (UUID gerado automaticamente)';
COMMENT ON COLUMN companies.owner_id IS 'Usuário proprietário da empresa (referência a users.id)';
COMMENT ON COLUMN companies.cnpj IS 'CNPJ único da empresa (apenas dígitos, 14 caracteres)';
COMMENT ON COLUMN companies.razao_social IS 'Razão social da empresa';
COMMENT ON COLUMN companies.nome_fantasia IS 'Nome fantasia da empresa';
COMMENT ON COLUMN companies.tax_regime IS 'Regime tributário: MEI, SIMPLES_NACIONAL, LUCRO_PRESUMIDO ou LUCRO_REAL';
COMMENT ON COLUMN companies.cnae IS 'Código CNAE principal da empresa';
COMMENT ON COLUMN companies.cnae_descricao IS 'Descrição da atividade referente ao CNAE';
COMMENT ON COLUMN companies.status IS 'Situação cadastral da empresa: ATIVA, SUSPENSA, INAPTA, BAIXADA ou NULA';
COMMENT ON COLUMN companies.data_abertura IS 'Data de abertura da empresa';
COMMENT ON COLUMN companies.logradouro IS 'Logradouro do endereço da empresa';
COMMENT ON COLUMN companies.numero IS 'Número do endereço da empresa';
COMMENT ON COLUMN companies.complemento IS 'Complemento do endereço da empresa';
COMMENT ON COLUMN companies.bairro IS 'Bairro do endereço da empresa';
COMMENT ON COLUMN companies.municipio IS 'Município do endereço da empresa';
COMMENT ON COLUMN companies.uf IS 'Unidade federativa (UF) do endereço da empresa';
COMMENT ON COLUMN companies.cep IS 'CEP do endereço da empresa';
COMMENT ON COLUMN companies.active IS 'Indica se a empresa está ativa na plataforma';
COMMENT ON COLUMN companies.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN companies.updated_at IS 'Data e hora da última atualização do registro (atualizada automaticamente via trigger)';
