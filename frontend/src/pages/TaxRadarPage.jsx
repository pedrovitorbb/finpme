import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import SemaforoCard from '@/components/SemaforoCard'
import InsightCard from '@/components/InsightCard'
import RadarBar from '@/components/RadarBar'
import StatCard from '@/components/StatCard'
import MoneyDisplay from '@/components/MoneyDisplay'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompany } from '@/context/CompanyContext'
import { formatCurrency } from '@/hooks/useFormatters'
import { getTaxRadar } from '@/services/taxRadarService'

const MEI_LIMIT = 81_000
const SIMPLES_LIMIT = 4_800_000

function levelFromAlert(alertLevel) {
  if (alertLevel === 'WARNING_95') return 'RED'
  if (alertLevel === 'WARNING_85' || alertLevel === 'WARNING_70') return 'YELLOW'
  return 'GREEN'
}

function TaxRadarPage() {
  const { company } = useCompany()
  const [loading, setLoading] = useState(true)
  const [radar, setRadar] = useState(null)

  useEffect(() => {
    let cancelled = false

    getTaxRadar(company.id)
      .then((data) => {
        if (!cancelled) setRadar(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [company.id])

  if (loading) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!radar) {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-title">Impostos</h1>
        <p className="mt-4 text-sm text-text-secondary">
          Não foi possível carregar seus dados agora. Tente de novo em instantes.
        </p>
      </div>
    )
  }

  const projected = radar.projectedRevenue ?? 0
  const hasLimit = radar.annualLimit != null

  return (
    <div className="px-5 pt-6">
      <h1 className="text-title">Impostos</h1>

      <div className="mt-5 flex flex-col gap-4">
        {radar.friendlyStatus && (
          <SemaforoCard level={levelFromAlert(radar.alertLevel)} message={radar.friendlyStatus} />
        )}

        {hasLimit && (
          <div className="rounded-lg border bg-surface p-4">
            <RadarBar
              label={radar.taxRegime === 'MEI' ? 'Limite MEI' : 'Limite do regime'}
              percent={radar.limitUsedPct}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Faturei esse ano"
            value={<MoneyDisplay value={radar.ytdRevenue} size="md" />}
          />
          <StatCard
            label="Limite do regime"
            value={hasLimit ? <MoneyDisplay value={radar.annualLimit} size="md" /> : 'Sem limite'}
          />
          <StatCard
            label="Posso faturar mais"
            value={
              radar.canStillEarn != null ? (
                <MoneyDisplay value={radar.canStillEarn} size="md" tone="success" />
              ) : (
                '—'
              )
            }
          />
          <StatCard
            label="Previsão até dezembro"
            value={<MoneyDisplay value={projected} size="md" />}
            hint="no ritmo atual"
          />
        </div>

        {radar.projectionMessage && (
          <InsightCard label="Projeção" message={radar.projectionMessage} />
        )}

        <section className="mt-2">
          <h2 className="text-subtitle">Simulador de regime</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Com a previsão de {formatCurrency(projected)} até dezembro, veja onde seu negócio cabe:
          </p>

          <ul className="mt-3 divide-y rounded-lg border bg-surface">
            {[
              { name: 'MEI', limit: MEI_LIMIT, note: 'até R$ 81 mil por ano' },
              { name: 'Simples Nacional', limit: SIMPLES_LIMIT, note: 'até R$ 4,8 milhões por ano' },
            ].map(({ name, limit, note }) => {
              const fits = projected <= limit
              return (
                <li key={name} className="flex items-center gap-3 p-4">
                  <span
                    className={
                      fits
                        ? 'flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success'
                        : 'flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-danger'
                    }
                  >
                    {fits ? <Check size={16} /> : <X size={16} />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{name}</span>
                    <span className="block text-xs text-text-muted">{note}</span>
                  </span>
                  <span className={fits ? 'text-sm font-medium text-success' : 'text-sm font-medium text-danger'}>
                    {fits ? 'Cabe' : 'Não cabe'}
                  </span>
                </li>
              )
            })}
          </ul>

          <p className="mt-3 text-xs leading-relaxed text-text-muted">
            Essa é uma simulação simples pelo faturamento. Antes de mudar de regime, converse com
            seu contador.
          </p>
        </section>
      </div>
    </div>
  )
}

export default TaxRadarPage
