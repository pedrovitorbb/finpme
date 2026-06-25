# FinPME

Plataforma SaaS de gestão financeira e inteligência tributária para micro e pequenas empresas brasileiras (MEI, ME e EPP).

---

## O que é

O FinPME centraliza o controle financeiro em tempo real, calcula automaticamente métricas gerenciais (faturamento bruto, líquido, EBITDA) e monitora proativamente os limites de regime tributário — emitindo alertas via WhatsApp antes que o empresário incorra em penalidades fiscais.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Java 21 + Spring Boot 3.x |
| Banco de dados | PostgreSQL 16 |
| Schema versioning | Flyway |
| Cache / rate limit | Redis 7 |
| Frontend | React 18 + Vite |
| Containerização | Docker + Docker Compose |
| Open Finance | Pluggy API |
| CNPJ lookup | BrasilAPI |

---

## Pré-requisitos

- Java 21
- Node.js 20+
- Docker Desktop
- Git

---

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/pedrovitorbb/finpme.git
cd finpme
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais locais. Veja a seção **Variáveis de ambiente** abaixo.

### 3. Suba o banco e o Redis

```bash
docker compose up -d
```

Isso sobe PostgreSQL na porta 5432 e Redis na porta 6379. Aguarde os containers ficarem saudáveis:

```bash
docker compose ps
```

### 4. Rode o backend

```bash
cd backend
./mvnw spring-boot:run
```

O Flyway roda as migrations automaticamente na inicialização. A API fica disponível em `http://localhost:8080`.

Documentação Swagger: `http://localhost:8080/swagger-ui.html`

### 5. Rode o frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend fica disponível em `http://localhost:5173`.

---

## Variáveis de ambiente

Copie o `.env.example` e preencha os valores. **Nunca commite o `.env` com credenciais reais.**

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finpme
DB_USER=finpme
DB_PASSWORD=sua_senha_aqui

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=sua_chave_secreta_minimo_32_caracteres
JWT_EXPIRATION_HOURS=24

# Pluggy (Open Finance)
PLUGGY_CLIENT_ID=seu_client_id
PLUGGY_CLIENT_SECRET=seu_client_secret

# WhatsApp Business API (Meta)
WHATSAPP_TOKEN=seu_token
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
```

---

## Estrutura do projeto

```
finpme/
├── backend/                        # Spring Boot
│   ├── src/main/java/com/finpme/
│   │   ├── auth/                   # Autenticação JWT
│   │   ├── company/                # Gestão de empresa / CNPJ
│   │   ├── transaction/            # Transações financeiras
│   │   ├── dashboard/              # Métricas e snapshots
│   │   ├── radar/                  # Radar tributário
│   │   ├── openfinance/            # Integração Pluggy
│   │   ├── alert/                  # Alertas WhatsApp
│   │   └── shared/                 # Utilitários e configurações
│   ├── src/main/resources/
│   │   └── db/migration/           # Scripts Flyway (V1__, V2__...)
│   └── src/test/
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── pages/                  # Dashboard, Radar, Fluxo de caixa
│   │   ├── components/             # Componentes reutilizáveis
│   │   ├── services/               # Chamadas à API (Axios)
│   │   └── hooks/                  # Custom hooks
│   └── public/
├── docs/                           # Documentação do projeto
│   ├── SRS.md                      # Documento de requisitos
│   ├── erd.md                      # Diagrama ER
│   ├── ADR-001-stack-tecnico.md    # Decisão de stack
│   └── ADR-002-autenticacao.md     # (a criar)
├── docker-compose.yml              # PostgreSQL + Redis
├── .env.example                    # Template de variáveis de ambiente
├── .gitignore
└── README.md
```

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [docs/SRS.md](docs/SRS.md) | Requisitos funcionais e não funcionais |
| [docs/erd.md](docs/erd.md) | Diagrama entidade-relacionamento |
| [docs/ADR-001-stack-tecnico.md](docs/ADR-001-stack-tecnico.md) | Decisão de stack técnico |
| `http://localhost:8080/swagger-ui.html` | Documentação dos endpoints REST (requer backend rodando) |

---

## Roadmap

- **Fase 1 (semanas 1–6):** Autenticação, gestão de empresa, transações manuais, radar tributário básico e dashboard MVP
- **Fase 2 (semanas 7–16):** Open Finance via Pluggy, EBITDA, DRE, alertas WhatsApp e simulador de regime
- **Fase 3 (semanas 17–26):** Módulo Contador, cache e performance, segurança e auditoria completa, CI/CD

---

## Regras de negócio principais

- **Limite MEI:** R$ 81.000/ano — tolerância de 20% antes do desenquadramento
- **Limite Simples Nacional:** R$ 4.800.000/ano
- A partir de outubro/2025 (Resolução CGSN 183/2025), receitas no CPF do titular somam ao limite do CNPJ
- Prazo da DASN-SIMEI: 31 de maio de cada ano
- Alertas disparados em 70%, 85% e 95% do limite anual

---

## Convenções de commit

```
feat: adiciona módulo de radar tributário
fix: corrige cálculo de YTD com transações manuais
docs: atualiza diagrama ER com tabela tax_alerts
chore: adiciona migration V3 para monthly_snapshots
test: adiciona testes unitários no TaxRadarService
```

---

## Licença

Proprietário — todos os direitos reservados.
