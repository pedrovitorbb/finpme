-- ─────────────────────────────────────────────────────────────────────────
-- V8: Adiciona flag mixes_personal_business na tabela users
--
-- Muitos MEIs e microempresários usam a mesma conta bancária para gastos
-- pessoais e da empresa. Essa flag indica que o usuário mistura finanças
-- pessoais e empresariais, permitindo que a plataforma ofereça a separação
-- assistida das transações (classificação pessoal vs. negócio).
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE users
    ADD COLUMN mixes_personal_business BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN users.mixes_personal_business IS 'Indica se o usuário mistura finanças pessoais e da empresa na mesma conta (habilita a separação assistida de transações)';
