# ERD — Diagrama Entidade-Relacionamento

**Projeto:** FinPME  
**Versão:** 1.0  
**Data:** 2026-06-25

---

## Diagrama (Mermaid)

```mermaid
erDiagram
    USER {
        uuid id PK
        string name
        string email UK
        string password_hash
        string avatar_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TENANT {
        uuid id PK
        string name
        string cnpj UK
        string slug UK
        string plan
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TENANT_USER {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        string role
        boolean is_active
        timestamp joined_at
    }

    ACCOUNT {
        uuid id PK
        uuid tenant_id FK
        string name
        string type
        string bank_name
        string bank_agency
        string bank_account
        decimal initial_balance
        string currency
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    CATEGORY {
        uuid id PK
        uuid tenant_id FK
        uuid parent_id FK
        string name
        string type
        string color
        boolean is_active
        timestamp created_at
    }

    COST_CENTER {
        uuid id PK
        uuid tenant_id FK
        string name
        string description
        boolean is_active
        timestamp created_at
    }

    TRANSACTION {
        uuid id PK
        uuid tenant_id FK
        uuid account_id FK
        uuid category_id FK
        uuid cost_center_id FK
        uuid created_by FK
        string type
        decimal amount
        string description
        date due_date
        date paid_date
        string status
        string recurrence_type
        uuid recurrence_group_id
        integer installment_number
        integer installment_total
        timestamp created_at
        timestamp updated_at
    }

    TRANSFER {
        uuid id PK
        uuid tenant_id FK
        uuid origin_account_id FK
        uuid destination_account_id FK
        uuid transaction_out_id FK
        uuid transaction_in_id FK
        decimal amount
        string description
        date transfer_date
        timestamp created_at
    }

    ATTACHMENT {
        uuid id PK
        uuid transaction_id FK
        string filename
        string url
        string mime_type
        integer size_bytes
        timestamp uploaded_at
    }

    USER ||--o{ TENANT_USER : "pertence a"
    TENANT ||--o{ TENANT_USER : "possui"
    TENANT ||--o{ ACCOUNT : "possui"
    TENANT ||--o{ CATEGORY : "possui"
    TENANT ||--o{ COST_CENTER : "possui"
    TENANT ||--o{ TRANSACTION : "possui"
    TENANT ||--o{ TRANSFER : "possui"
    ACCOUNT ||--o{ TRANSACTION : "contém"
    CATEGORY ||--o{ TRANSACTION : "classifica"
    CATEGORY ||--o{ CATEGORY : "pai de"
    COST_CENTER ||--o{ TRANSACTION : "agrupa"
    USER ||--o{ TRANSACTION : "cria"
    TRANSACTION ||--o{ ATTACHMENT : "anexa"
    ACCOUNT ||--o{ TRANSFER : "origem"
    ACCOUNT ||--o{ TRANSFER : "destino"
```

---

## Descrição das Entidades

### USER
Usuário da plataforma. Um usuário pode pertencer a múltiplos tenants (empresas).

### TENANT
Empresa/organização. Unidade de isolamento de dados (multi-tenancy).  
`role` em TENANT_USER: `admin`, `financial`, `operational`.

### ACCOUNT
Conta bancária, carteira ou caixa de uma empresa.  
`type`: `checking` | `savings` | `cash` | `investment`.

### CATEGORY
Plano de contas hierárquico.  
`type`: `income` | `expense`.  
Suporta categorias pai/filho (ex: "Despesas Operacionais" > "Aluguel").

### COST_CENTER
Centro de custo para agrupamento gerencial de transações.

### TRANSACTION
Lançamento financeiro (entrada ou saída).  
- `type`: `income` | `expense`  
- `status`: `pending` | `paid` | `cancelled`  
- `recurrence_type`: `none` | `daily` | `weekly` | `monthly` | `yearly`  
- Lançamentos parcelados compartilham o mesmo `recurrence_group_id`.

### TRANSFER
Transferência entre duas contas do mesmo tenant.  
Gera dois registros em TRANSACTION (um débito e um crédito) vinculados por `transaction_out_id` e `transaction_in_id`.

### ATTACHMENT
Arquivo comprovante vinculado a uma transação (nota fiscal, recibo, etc.).

---

## Notas de Implementação

- **Row-Level Security (RLS):** todas as tabelas com `tenant_id` devem ter políticas RLS habilitadas no PostgreSQL.
- **Soft delete:** entidades críticas (ACCOUNT, CATEGORY, TRANSACTION) usam `is_active = false` em vez de DELETE físico.
- **Auditoria:** considerar tabela `audit_log` para registrar mudanças em transações no futuro.
