import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '@/components/TopBar'
import SemaforoCard from '@/components/SemaforoCard'
import InsightCard from '@/components/InsightCard'
import RadarBar from '@/components/RadarBar'
import MoneyDisplay from '@/components/MoneyDisplay'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompany } from '@/context/CompanyContext'
import { formatCurrency } from '@/hooks/useFormatters'
import { getDashboard } from '@/services/dashboardService'
import { getTaxRadar } from '@/services/taxRadarService'
import { getLatestInsights } from '@/services/insightService'
import { listTransactions } from '@/services/transactionService'
import { getCurrentUser } from '@/services/authService'

const REGIME_LABELS = {
  MEI: 'Limite MEI',
  SIMPLES_NACIONAL: 'Limite Simples',
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function sumWhere(transactions, predicate) {
  return transactions.filter(predicate).reduce((total, t) => total + Number(t.amount), 0)
}

function DashboardPage() {
  const { company } = useCompany()
  const user = getCurrentUser()
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState(null)
  const [radar, setRadar] = useState(null)
  const [insight, setInsight] = useState(null)
  const [cash, setCash] = useState(0)
  const [week, setWeek] = useState({ income: 0, expense: 0 })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const now = new Date()
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)

      const [dashboardData, radarData, insights, yearTransactions] = await Promise.all([
        getDashboard(company.id, now.getFullYear(), now.getMonth() + 1).catch(() => null),
        getTaxRadar(company.id).catch(() => null),
        getLatestInsights(company.id).catch(() => []),
        listTransactions(company.id, {
          startDate: isoDate(startOfYear),
          endDate: isoDate(now),
        }).catch(() => []),
      ])
      if (cancelled) return

      setDashboard(dashboardData)
      setRadar(radarData)
      setInsight(insights[0] ?? null)
      setCash(
        sumWhere(yearTransactions, (t) => t.type === 'INCOME') -
          sumWhere(yearTransactions, (t) => t.type === 'EXPENSE'),
      )

      const weekStart = isoDate(weekAgo)
      setWeek({
        income: sumWhere(yearTransactions, (t) => t.type === 'INCOME' && t.transactionDate >= weekStart),
        expense: sumWhere(yearTransactions, (t) => t.type === 'EXPENSE' && t.transactionDate >= weekStart),
      })
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [company.id])

  if (loading) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <div>
      <TopBar />

      <section className="px-5 pt-6">
        <p className="text-sm text-text-secondary">
          {greeting()}
          {firstName ? `, ${firstName}` : ''}
        </p>
        <p className="mt-3">
          <MoneyDisplay value={cash} size="display" tone={cash < 0 ? 'danger' : 'default'} />
        </p>
        <p className="mt-1 text-sm text-text-muted">no caixa do negócio agora</p>
      </section>

      <div className="mx-5 my-6 border-t" />

      <section className="grid grid-cols-2 gap-4 px-5">
        <div>
          <p className="text-xs font-medium text-text-secondary">Entrou essa semana</p>
          <p className="mt-1">
            <MoneyDisplay value={week.income} size="lg" tone="success" signed />
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary">Saiu essa semana</p>
          <p className="mt-1">
            <MoneyDisplay value={-week.expense} size="lg" tone="danger" signed={week.expense > 0} />
          </p>
        </div>
      </section>

      <section className="mt-6 flex flex-col gap-4 px-5">
        {dashboard?.healthMessage && (
          <SemaforoCard level={dashboard.healthLevel} message={dashboard.healthMessage} />
        )}

        {insight && <InsightCard title={insight.title} message={insight.message} />}

        {radar?.annualLimit != null && (
          <div className="rounded-lg border bg-surface p-4">
            <RadarBar
              label={REGIME_LABELS[radar.taxRegime] ?? 'Limite do regime'}
              percent={radar.limitUsedPct}
              caption={
                radar.canStillEarn != null
                  ? `Pode faturar mais ${formatCurrency(radar.canStillEarn)} este ano`
                  : undefined
              }
            />
            <Link
              to="/impostos"
              className="mt-3 inline-block text-sm font-medium text-primary"
            >
              Ver detalhes
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

export default DashboardPage
