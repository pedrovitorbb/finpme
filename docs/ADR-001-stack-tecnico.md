# ADR-001 — Stack Técnico do FinPME

**Status:** Aceito  
**Data:** 2026-06-25  
**Decisores:** Pedro Vitor  

---

## Contexto

O FinPME é um SaaS de gestão financeira para PMEs brasileiras. Precisamos definir a stack tecnológica para o MVP, priorizando:

1. Produtividade de desenvolvimento (time pequeno, prazo de 4 meses)
2. Escalabilidade suficiente para o MVP (até ~500 tenants)
3. Ecossistema maduro com boa oferta de bibliotecas financeiras/BR
4. Facilidade de contratação futura de desenvolvedores

---

## Decisão

### Backend

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Runtime | Node.js | 22 LTS |
| Linguagem | TypeScript | 5.x |
| Framework web | Fastify | 4.x |
| ORM | Prisma | 5.x |
| Banco de dados | PostgreSQL | 16 |
| Cache / Filas | Redis (BullMQ) | 7.x |
| Autenticação | JWT + bcrypt | — |
| Validação | Zod | 3.x |
| Testes | Vitest + Supertest | — |
| Documentação API | Fastify Swagger (OpenAPI 3) | — |

### Frontend

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | React | 18.x |
| Linguagem | TypeScript | 5.x |
| Build tool | Vite | 5.x |
| Roteamento | TanStack Router | 1.x |
| Estado server | TanStack Query | 5.x |
| UI Components | shadcn/ui + Tailwind CSS | — |
| Formulários | React Hook Form + Zod | — |
| Tabelas/Gráficos | TanStack Table + Recharts | — |
| Testes | Vitest + Testing Library | — |

### Infraestrutura (MVP)

| Componente | Tecnologia |
|-----------|-----------|
| Containerização | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Hospedagem backend | Railway ou Render |
| Hospedagem frontend | Vercel |
| Banco de dados gerenciado | Supabase (PostgreSQL) ou Neon |
| Cache gerenciado | Upstash (Redis) |
| Armazenamento de arquivos | Cloudflare R2 |
| Monitoramento | Sentry (erros) + Grafana Cloud (métricas) |

---

## Alternativas Consideradas

### Backend: NestJS vs Fastify
- **NestJS:** mais opinativo, excelente para times grandes, overhead de abstrações para MVP
- **Fastify:** mais leve, mais rápido, flexível — adequado ao time reduzido ✅

### ORM: Prisma vs Drizzle vs TypeORM
- **TypeORM:** maduro mas tipagem fraca, decorators verbosos
- **Drizzle:** mais leve, totalmente type-safe em SQL, porém ecossistema menor
- **Prisma:** excelente DX, migrações automáticas, studio integrado — melhor para MVP ✅

### Frontend: Next.js vs React + Vite
- **Next.js:** SSR útil para landing pages/SEO, mas o app financeiro é autenticado (SSR não agrega muito)
- **React + Vite:** SPA pura, mais simples de deployar, build mais rápido ✅

### Banco: PostgreSQL vs MySQL vs MongoDB
- **MongoDB:** flexibilidade de schema, mas dados financeiros são inerentemente relacionais
- **MySQL:** opção sólida, mas PostgreSQL tem RLS nativo e suporte a JSONB superior ✅

---

## Consequências

**Positivas:**
- TypeScript end-to-end: compartilhamento de tipos entre frontend e backend via pacote `@finpme/shared`
- Prisma facilita migrations e introspection durante o desenvolvimento ágil
- shadcn/ui + Tailwind permite velocidade de UI sem depender de design system proprietário
- PostgreSQL RLS resolve isolamento multi-tenant sem lógica extra na aplicação

**Negativas / Riscos:**
- Fastify tem comunidade menor que Express — mitigado pela documentação robusta
- Prisma pode ter gargalo de performance em queries muito complexas — usar `$queryRaw` nesses casos
- Railway/Render têm cold start em plano gratuito — migrar para instância dedicada antes de lançar

---

## Revisão

Esta ADR deve ser revisada se:
- O número de tenants ultrapassar 2.000 (avaliar separação de serviços)
- Requisitos de real-time intenso surgirem (avaliar WebSockets nativos ou SSE)
- Time crescer para mais de 5 devs (avaliar NestJS ou monorepo com Turborepo)
