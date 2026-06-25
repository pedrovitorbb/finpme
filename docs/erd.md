# Diagrama ER — FinPME

**Versão:** 1.0  
**Data:** Junho 2026  
**Autor:** Pedro Vitor  

---

## Diagrama

```mermaid
erDiagram
  users {
    uuid id PK
    string name
    string email
    string password_hash
    string plan
    timestamptz created_at
  }

  companies {
    uuid id PK
    uuid owner_id FK
    string cnpj
    string razao_social
    string tax_regime
    string cnae
    string status
    date data_abertura
    boolean active
    timestamptz created_at
  }

  bank_accounts {
    uuid id PK
    uuid company_id FK
    string pluggy_item_id
    string bank_name
    string account_type
    decimal balance
    timestamptz last_synced_at
    boolean active
  }

  transactions {
    uuid id PK
    uuid company_id FK
    uuid bank_account_id FK
    string pluggy_tx_id
    decimal amount
    string type
    string category
    string source
    date transaction_date
    string description
    timestamptz created_at
  }

  monthly_snapshots {
    uuid id PK
    uuid company_id FK
    int year
    int month
    decimal gross_revenue
    decimal net_revenue
    decimal ebitda
    decimal ytd_revenue
    decimal tax_limit_pct
    timestamptz calculated_at
  }

  tax_alerts {
    uuid id PK
    uuid company_id FK
    string alert_type
    decimal threshold_pct
    string channel
    string status
    timestamptz sent_at
  }

  audit_log {
    uuid id PK
    uuid user_id FK
    string action
    string entity
    uuid entity_id
    string ip_address
    string user_agent
    jsonb payload
    timestamptz created_at
  }

  notification_settings {
    uuid id PK
    uuid user_id FK
    boolean alert_70pct
    boolean alert_85pct
    boolean alert_95pct
    boolean channel_whatsapp
    boolean channel_platform
    string whatsapp_number
  }

  users ||--o{ companies : "possui"
  users ||--o{ audit_log : "gera"
  users ||--|| notification_settings : "configura"
  companies ||--o{ bank_accounts : "conecta"
  companies ||--o{ transactions : "registra"
  companies ||--o{ monthly_snapshots : "acumula"
  companies ||--o{ tax_alerts : "dispara"
```

---

## Descrição das tabelas

| Tabela | Descrição |
|---|---|
| `users` | Usuários do sistema (donos de empresa e contadores) |
| `companies` | Empresas cadastradas — uma por CNPJ, vinculada a um `owner_id` |
| `bank_accounts` | Contas bancárias conectadas via Open Finance (Pluggy) |
| `transactions` | Entradas e saídas financeiras — manuais ou importadas via Pluggy |
| `monthly_snapshots` | Métricas mensais pré-calculadas (EBITDA, YTD, % do limite) |
| `tax_alerts` | Histórico de alertas tributários enviados por empresa |
| `audit_log` | Log de auditoria de todas as ações sensíveis do usuário |
| `notification_settings` | Preferências de notificação por usuário (1:1 com users) |

---

## Notas de design

- **`pluggy_tx_id`** em `transactions` tem constraint `UNIQUE` — garante idempotência na importação de extratos bancários.
- **`bank_account_id`** em `transactions` é nullable — é `NULL` para transações inseridas manualmente, preenchido apenas para transações importadas via Pluggy.
- **`monthly_snapshots`** armazena métricas pré-calculadas para evitar recálculo em tempo real no dashboard. Recalculado diariamente às 02h pelo `NightlySnapshotJob`.
- **`active`** em `companies` e `bank_accounts` implementa soft delete — registros nunca são removidos fisicamente.
- **`notification_settings`** é 1:1 com `users` — criada automaticamente no cadastro do usuário com valores padrão.
- **`audit_log.payload`** é `jsonb` — armazena os dados relevantes da ação (ex: campos alterados, valores antes/depois).
