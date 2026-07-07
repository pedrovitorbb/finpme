import ScreenHeader from '@/components/ScreenHeader'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useCompany } from '@/context/CompanyContext'
import { getCurrentUser, logout } from '@/services/authService'

const PLAN_LABELS = {
  MEI_SOLO: 'MEI Solo',
  PME_PRO: 'PME Pro',
}

const REGIME_LABELS = {
  MEI: 'MEI',
  SIMPLES_NACIONAL: 'Simples Nacional',
  LUCRO_PRESUMIDO: 'Lucro Presumido',
  LUCRO_REAL: 'Lucro Real',
}

function initialsOf(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

function formatCnpj(cnpj) {
  if (!cnpj || cnpj.length !== 14) return cnpj ?? '—'
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function InfoRow({ label, value }) {
  return (
    <li className="flex items-center justify-between gap-4 p-4">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </li>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </h2>
  )
}

function SettingsPage() {
  const { company } = useCompany()
  const { toast } = useToast()
  const user = getCurrentUser()

  return (
    <div>
      <ScreenHeader title="Configurações" backTo="/mais" />

      <div className="flex flex-col gap-6 px-5 pt-3 pb-6">
        <section className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {initialsOf(user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">{user?.name ?? '—'}</p>
            <p className="truncate text-sm text-text-muted">{user?.email ?? '—'}</p>
          </div>
          <Badge variant="secondary">{PLAN_LABELS[user?.plan] ?? user?.plan ?? '—'}</Badge>
        </section>

        <section>
          <SectionTitle>Empresa</SectionTitle>
          <ul className="divide-y rounded-lg border bg-surface">
            <InfoRow
              label="Nome"
              value={company?.nomeFantasia || company?.razaoSocial || '—'}
            />
            <InfoRow label="CNPJ" value={formatCnpj(company?.cnpj)} />
            <InfoRow
              label="Regime"
              value={REGIME_LABELS[company?.taxRegime] ?? company?.taxRegime ?? '—'}
            />
          </ul>
        </section>

        <section>
          <SectionTitle>Plano</SectionTitle>
          <ul className="divide-y rounded-lg border bg-surface">
            <InfoRow label="Plano atual" value={PLAN_LABELS[user?.plan] ?? '—'} />
            <InfoRow label="Valor" value="Grátis no período de testes" />
            <InfoRow label="Próxima cobrança" value="—" />
          </ul>
        </section>

        <section>
          <SectionTitle>Conta</SectionTitle>
          <ul className="divide-y rounded-lg border bg-surface">
            <li>
              <button
                type="button"
                onClick={() => toast({ title: 'Em breve', description: 'A troca de senha ainda está sendo preparada.' })}
                className="w-full p-4 text-left text-sm font-medium transition-colors hover:bg-secondary/50"
              >
                Alterar senha
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={logout}
                className="w-full p-4 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/5"
              >
                Sair da conta
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default SettingsPage
