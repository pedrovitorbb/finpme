# SRS — Especificação de Requisitos de Software

**Projeto:** FinPME  
**Versão:** 1.0  
**Data:** 2026-06-25  
**Status:** Rascunho

---

## 1. Introdução

### 1.1 Propósito

Este documento descreve os requisitos funcionais e não-funcionais do sistema FinPME, uma plataforma SaaS de gestão financeira voltada para Pequenas e Médias Empresas (PMEs) brasileiras.

### 1.2 Escopo

O FinPME abrange:
- Gestão de fluxo de caixa (entradas e saídas)
- Contas a pagar e a receber
- Conciliação bancária básica
- Relatórios financeiros (DRE simplificado, fluxo de caixa projetado)
- Gestão de categorias e centros de custo
- Multi-empresa (uma conta pode gerenciar múltiplas CNPJs/empresas)

### 1.3 Definições

| Termo | Definição |
|-------|-----------|
| PME | Pequena e Média Empresa |
| Tenant | Organização/empresa cadastrada na plataforma |
| Usuário | Pessoa física com acesso ao sistema |
| Lançamento | Registro de entrada ou saída financeira |

---

## 2. Visão Geral do Sistema

### 2.1 Perspectiva do Produto

SaaS multi-tenant acessível via browser (web-first). Futuras versões poderão incluir app mobile.

### 2.2 Usuários-Alvo

- **Proprietário/Gestor:** visão completa, acesso a todos os módulos
- **Contador/Financeiro:** lançamentos, conciliação, relatórios
- **Operacional:** apenas lançamentos e consultas básicas

---

## 3. Requisitos Funcionais

### 3.1 Autenticação e Autorização (AUTH)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| AUTH-01 | Cadastro de usuário com e-mail e senha | Alta |
| AUTH-02 | Login com JWT + refresh token | Alta |
| AUTH-03 | Recuperação de senha via e-mail | Alta |
| AUTH-04 | Controle de acesso por perfil (admin, financeiro, operacional) | Alta |
| AUTH-05 | Suporte a múltiplos tenants por usuário | Média |
| AUTH-06 | Login via Google OAuth 2.0 | Baixa |

### 3.2 Gestão de Empresas / Tenants (TENANT)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| TENANT-01 | Cadastro de empresa com CNPJ e dados básicos | Alta |
| TENANT-02 | Convite de usuários para a empresa por e-mail | Alta |
| TENANT-03 | Definição de permissões por usuário dentro da empresa | Alta |

### 3.3 Plano de Contas e Categorias (CAT)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| CAT-01 | CRUD de categorias hierárquicas (receitas/despesas) | Alta |
| CAT-02 | Categorias padrão pré-configuradas ao criar empresa | Média |
| CAT-03 | Centros de custo vinculados a categorias | Média |

### 3.4 Contas Bancárias (CONTA)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| CONTA-01 | CRUD de contas bancárias (banco, agência, conta) | Alta |
| CONTA-02 | Saldo atual calculado a partir de lançamentos | Alta |
| CONTA-03 | Caixa/cofre como tipo de conta | Média |

### 3.5 Lançamentos Financeiros (LANCTO)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| LANCTO-01 | Registro de entrada (receita) e saída (despesa) | Alta |
| LANCTO-02 | Vinculação a conta, categoria e centro de custo | Alta |
| LANCTO-03 | Lançamentos parcelados (fixo e variável) | Alta |
| LANCTO-04 | Lançamentos recorrentes (mensal, semanal, etc.) | Média |
| LANCTO-05 | Transferência entre contas | Alta |
| LANCTO-06 | Anexo de comprovante (PDF/imagem) | Média |
| LANCTO-07 | Status: previsto / realizado / cancelado | Alta |

### 3.6 Contas a Pagar / Receber (CP-CR)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| CP-CR-01 | Listagem de títulos em aberto por vencimento | Alta |
| CP-CR-02 | Baixa de título (manual) | Alta |
| CP-CR-03 | Alertas de vencimento (D-3, D-1, D+0) | Média |

### 3.7 Relatórios (REL)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| REL-01 | Fluxo de caixa (período configurável) | Alta |
| REL-02 | DRE simplificado | Média |
| REL-03 | Extrato por conta bancária | Alta |
| REL-04 | Exportação para CSV/XLSX | Média |

---

## 4. Requisitos Não-Funcionais

### 4.1 Desempenho
- Tempo de resposta da API < 500ms para 95% das requisições
- Suporte inicial a até 500 tenants ativos simultâneos

### 4.2 Segurança
- Autenticação JWT com rotação de refresh token
- Dados sensíveis criptografados em repouso (AES-256)
- HTTPS obrigatório em produção
- Rate limiting nas rotas de autenticação
- Isolamento de dados por tenant (Row-Level Security no PostgreSQL)

### 4.3 Disponibilidade
- SLA de 99,5% de uptime (ambiente de produção)
- Backups diários do banco de dados

### 4.4 Usabilidade
- Interface responsiva (desktop-first, compatível com tablets)
- Suporte aos browsers: Chrome 120+, Firefox 120+, Edge 120+

### 4.5 Manutenibilidade
- Cobertura de testes >= 70% nas regras de negócio críticas
- Documentação de API via OpenAPI 3.x

---

## 5. Restrições

- MVP deve ser lançado em até 4 meses após início do desenvolvimento
- Stack conforme definido em [ADR-001](ADR-001-stack-tecnico.md)
- Conformidade com LGPD para dados de usuários e empresas brasileiras
