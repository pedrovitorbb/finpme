-- ─────────────────────────────────────────────────────────────────────────
-- V1: Criação da tabela users
-- ─────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    plan            VARCHAR(20) NOT NULL DEFAULT 'MEI_SOLO',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_plan CHECK (plan IN ('MEI_SOLO', 'PRO', 'CONTADOR'))
);

-- índice de apoio às buscas por e-mail (a UNIQUE constraint acima já o mantém)
CREATE INDEX idx_users_email ON users (email);

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger para manter updated_at sincronizado a cada UPDATE
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_users_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Comentários de documentação
-- ─────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE users IS 'Usuários da plataforma FinPME';
COMMENT ON COLUMN users.id IS 'Identificador único do usuário (UUID gerado automaticamente)';
COMMENT ON COLUMN users.name IS 'Nome completo do usuário';
COMMENT ON COLUMN users.email IS 'E-mail único do usuário, utilizado para login';
COMMENT ON COLUMN users.password_hash IS 'Hash da senha do usuário (nunca armazenar em texto puro)';
COMMENT ON COLUMN users.plan IS 'Plano contratado pelo usuário: MEI_SOLO, PRO ou CONTADOR';
COMMENT ON COLUMN users.active IS 'Indica se o usuário está ativo na plataforma';
COMMENT ON COLUMN users.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN users.updated_at IS 'Data e hora da última atualização do registro (atualizada automaticamente via trigger)';
