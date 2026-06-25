# ADR-001 — Decisão de stack técnico

**Status:** Aceito  
**Data:** Junho 2026  
**Autor:** Pedro Vitor  

---

## Contexto

O FinPME é uma plataforma SaaS de gestão financeira e inteligência tributária para micro e pequenas empresas brasileiras. O produto precisa de:

- APIs REST seguras com autenticação JWT
- Integração com Open Finance (Pluggy) e WhatsApp Business
- Dashboard financeiro com gráficos em tempo real
- Jobs noturnos para cálculo de métricas e disparo de alertas
- Banco de dados relacional com dados financeiros sensíveis
- Ambiente reproduzível entre desenvolvimento e produção

O desenvolvedor principal tem experiência intermediária com Java/Spring Boot, conhecimento de React e JavaScript, e orientação DevSecOps. O prazo para MVP é de 6 meses.

---

## Decisões

### Backend — Spring Boot (Java)

**Escolhido:** Spring Boot 3.x com Java 21  
**Alternativas consideradas:** Node.js (Express/Fastify), Django (Python)

**Motivo:**  
O desenvolvedor já domina Java e Spring Boot. O ecossistema cobre todos os requisitos do projeto sem dependências externas: Spring Security para autenticação JWT, Spring Scheduler para jobs noturnos, WebClient para chamadas às APIs externas (Pluggy, BrasilAPI, WhatsApp), e Spring Data JPA para o acesso ao banco. Java 21 traz Virtual Threads, o que melhora a performance em I/O intensivo sem mudar o modelo de programação.

Node.js foi descartado por exigir reaprendizado de stack sem benefício concreto para o perfil do projeto. Django foi descartado pelo mesmo motivo — o ecossistema Java resolve tudo que é necessário.

---

### Banco de dados — PostgreSQL 16

**Escolhido:** PostgreSQL 16  
**Alternativas consideradas:** MySQL, MongoDB

**Motivo:**  
Transações financeiras são dados relacionais por natureza — `transactions` referencia `companies`, que referencia `users`. PostgreSQL tem suporte nativo a UUID como PK, JSONB para o campo `payload` do `audit_log`, triggers para `updated_at` automático, e `gen_random_uuid()` sem extensão externa. É o banco com melhor suporte no ecossistema Spring/JPA.

MongoDB foi descartado porque o modelo de dados do FinPME é fortemente relacional — usar um banco de documentos aqui seria forçar um paradigma inadequado ao problema.

---

### Versionamento de schema — Flyway

**Escolhido:** Flyway  
**Alternativas consideradas:** Liquibase, migrations manuais

**Motivo:**  
Flyway versiona o schema do banco como código — cada alteração de tabela vira um arquivo SQL numerado em `db/migration/`. Isso garante que o schema em produção sempre corresponde ao código da aplicação, sem surpresas. A integração com Spring Boot é nativa: o Flyway roda automaticamente na inicialização da aplicação.

Liquibase foi descartado por ter mais complexidade de configuração (XML/YAML) sem benefício adicional para o porte do projeto. Migrations manuais foram descartadas por não serem rastreáveis nem reproduzíveis.

---

### Cache e rate limiting — Redis

**Escolhido:** Redis 7  
**Alternativas consideradas:** Cache em memória (Caffeine), sem cache

**Motivo:**  
Redis serve dois propósitos distintos no FinPME:

1. **Cache de métricas:** `monthly_snapshots` são calculados uma vez por noite e servidos do Redis. O dashboard abre em menos de 1 segundo sem recalcular EBITDA e YTD a cada requisição.
2. **Rate limiting:** o `RateLimitFilter` usa Redis para contar requisições por IP no endpoint de autenticação (10 req/min), bloqueando força bruta antes de virar problema.

Caffeine (cache em memória) foi descartado porque não persiste entre reinicializações e não funciona em ambientes com múltiplas instâncias. Sem cache, o dashboard recalcularia métricas de potencialmente milhares de transações em cada requisição — inviável em escala.

---

### Frontend — React 18

**Escolhido:** React 18 com Vite  
**Alternativas consideradas:** Next.js, Vue.js

**Motivo:**  
O FinPME é um dashboard fechado atrás de autenticação — SEO não se aplica e todas as telas são dinâmicas. Next.js brilha em páginas públicas com SSR/SSG; para um produto SaaS autenticado, adiciona complexidade de deploy (servidor Node em execução contínua) e conceitos extras (Server Components, App Router) sem benefício concreto.

React puro com Vite entrega build estático servível de qualquer CDN, roteamento com React Router, e o ecossistema necessário: Recharts para gráficos financeiros e Axios com interceptor JWT para chamadas à API. O desenvolvedor já conhece React, o que elimina curva de aprendizado.

Vue.js foi descartado por familiaridade — React é a escolha mais natural dado o background do desenvolvedor.

Se uma landing page de marketing for criada no futuro, Next.js é a escolha correta para esse contexto específico — mas como projeto separado do dashboard.

---

### Containerização — Docker

**Escolhido:** Docker + Docker Compose  
**Alternativas consideradas:** Instalação local direta

**Motivo:**  
Docker garante que o ambiente de desenvolvimento é idêntico ao de produção. Com `docker-compose.yml`, PostgreSQL e Redis sobem com um único comando (`docker compose up -d`), sem interferir em instalações locais existentes. O `Dockerfile` da aplicação Spring Boot é a mesma imagem usada em produção — elimina a classe de bugs "funciona na minha máquina".

---

### Open Finance — Pluggy

**Escolhido:** Pluggy  
**Alternativas consideradas:** TecnoSpeed, integração direta com Banco Central

**Motivo:**  
Pluggy é uma ITP (Iniciadora de Transação de Pagamento) autorizada pelo Banco Central com SDK e documentação em PT-BR. Conecta 99%+ dos bancos brasileiros (Itaú, Bradesco, Santander, Nubank, Inter, BB, Caixa) por uma única API REST. Processa mais de 530 mil conexões por mês e já é usada por Conta Azul, Nibo e Contabilizei.

A integração direta com o protocolo Open Finance do Banco Central foi descartada — exigiria 3 a 12 meses apenas para a camada de conectividade, além de certificação regulatória. A Pluggy abstrai toda essa complexidade.

---

## Resumo da stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | Spring Boot | 3.x |
| Linguagem | Java | 21 |
| Banco de dados | PostgreSQL | 16 |
| Schema versioning | Flyway | 10.x |
| Cache / rate limit | Redis | 7 |
| Frontend | React + Vite | 18 |
| Gráficos | Recharts | latest |
| HTTP client (frontend) | Axios | latest |
| Containerização | Docker + Compose | latest |
| Open Finance | Pluggy API | v2 |
| Alertas | WhatsApp Business API (Meta) | Cloud API |
| CNPJ lookup | BrasilAPI | v1 |

---

## Consequências

**Positivas:**
- Stack familiar ao desenvolvedor — sem curva de aprendizado desnecessária
- Ecossistema Spring cobre todos os requisitos sem dependências externas
- Docker garante paridade entre desenvolvimento e produção
- Flyway torna o schema rastreável e reproduzível
- Redis resolve cache e segurança com uma única tecnologia

**Negativas / trade-offs:**
- Java tem startup mais lento que Node.js (mitigado com Virtual Threads do Java 21)
- Redis adiciona um serviço a mais para operar em produção
- Pluggy tem custo por conexão em produção (cobrado por item conectado/mês)
- React puro sem SSR significa que a página inicial exige JavaScript habilitado no browser (aceitável para um produto SaaS autenticado)

---

## Revisão

Esta decisão deve ser revisada se:
- O produto precisar de uma landing page pública com SEO — avaliar Next.js para esse contexto específico
- O número de empresas ativas ultrapassar 50.000 — avaliar separação do job noturno em serviço dedicado
- A Pluggy apresentar instabilidade recorrente — avaliar TecnoSpeed como alternativa
