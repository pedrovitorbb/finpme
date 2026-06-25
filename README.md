# FinPME

Plataforma de gestão financeira para Pequenas e Médias Empresas (PMEs) brasileiras.

## Visão Geral

O FinPME é um SaaS de gestão financeira focado em simplificar o controle de fluxo de caixa, contas a pagar/receber, emissão de relatórios e conciliação bancária para PMEs.

## Estrutura do Repositório

```
finpme/
├── backend/        # API REST (Node.js + TypeScript + Fastify)
├── frontend/       # Aplicação web (React + TypeScript + Vite)
├── docs/           # Documentação técnica (SRS, ERD, ADRs)
├── .env.example    # Variáveis de ambiente de exemplo
└── .gitignore
```

## Documentação

- [Especificação de Requisitos (SRS)](docs/SRS.md)
- [Diagrama Entidade-Relacionamento (ERD)](docs/erd.md)
- [ADR-001 — Stack Técnico](docs/ADR-001-stack-tecnico.md)

## Pré-requisitos

- Node.js >= 20.x
- PostgreSQL >= 15
- Redis >= 7
- Docker e Docker Compose (recomendado)

## Setup Local

```bash
# Clonar o repositório
git clone https://github.com/pedrovitorbb/finpme.git
cd finpme

# Copiar variáveis de ambiente
cp .env.example .env
# Editar o .env com suas credenciais locais

# Backend
cd backend
npm install
npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

## Contribuição

Veja [CONTRIBUTING.md](docs/CONTRIBUTING.md) para diretrizes de contribuição.

## Licença

Proprietário — todos os direitos reservados.
