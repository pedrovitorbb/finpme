import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts'
import StatCard from '@/components/StatCard'
import InsightCard from '@/components/InsightCard'
import MoneyDisplay from '@/components/MoneyDisplay'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompany } from '@/context/CompanyContext'
import { formatCurrency } from '@/hooks/useFormatters'
import { getDashboard } from '@/services/dashboardService'

const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const MONTH_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function lastSixMonths() {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }
  return months
}

function buildAnalysis(history) {
  const current = history[history.length - 1]
  const previous = history[history.length - 2]
  if (!current || !previous) return null

  const received = current.grossRevenue
  const before = previous.grossRevenue

  if (before <= 0 && received <= 0) {
    return 'Ainda não há lançamentos suficientes para comparar seus meses. Registre suas vendas para acompanhar a evolução.'
  }
  if (before <= 0) {
    return `Você recebeu ${formatCurrency(received)} este mês. Continue registrando para ver sua evolução mês a mês.`
  }

  const change = Math.round(((received - before) / before) * 100)
  if (change > 5) {
    return `Suas vendas cresceram ${change}% em relação ao mês passado. Bom sinal — mantenha o ritmo!`
  }
  if (change < -5) {
    return `Suas vendas caíram ${Math.abs(change)}% em relação ao mês passado. Vale olhar o que mudou.`
  }
  return 'Suas vendas estão estáveis em relação ao mês passado.'
}

function GraphsPage() {
  const { company } = useCompany()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const months = lastSixMonths()
      const dashboards = await Promise.all(
        months.map((m) => getDashboard(company.id, m.year, m.month).catch(() => null)),
      )
      if (cancelled) return

      setHistory(
        months.map((m, i) => ({
          ...m,
          label: MONTH_SHORT[m.month - 1],
          grossRevenue: dashboards[i]?.grossRevenue ?? 0,
          totalExpenses: dashboards[i]?.totalExpenses ?? 0,
        })),
      )
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [company.id])

  const bestMonth = useMemo(() => {
    if (!history.length) return null
    return history.reduce((best, m) => (m.grossRevenue > best.grossRevenue ? m : best))
  }, [history])

  if (loading) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-6">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-44 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    )
  }

  const current = history[history.length - 1]
  const balance = current.grossRevenue - current.totalExpenses
  const monthlyAverage = history.reduce((sum, m) => sum + m.grossRevenue, 0) / history.length
  const analysis = buildAnalysis(history)

  return (
    <div className="px-5 pt-6">
      <h1 className="text-title">Evolução do negócio</h1>

      <div className="mt-6 rounded-lg border bg-surface p-4">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={history} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(214 20% 65%)' }}
            />
            <Bar dataKey="grossRevenue" radius={[6, 6, 0, 0]} isAnimationActive={false}>
              {history.map((m, i) => (
                <Cell
                  key={m.label}
                  fill={i === history.length - 1 ? '#185FA5' : '#E2E8F0'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {bestMonth && bestMonth.grossRevenue > 0 && (
          <p className="mt-3 text-sm text-text-secondary">
            {MONTH_FULL[bestMonth.month - 1]} foi seu melhor mês —{' '}
            <span className="font-semibold text-foreground">
              {formatCurrency(bestMonth.grossRevenue)}
            </span>
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <StatCard
          label="Recebi esse mês"
          value={<MoneyDisplay value={current.grossRevenue} size="md" tone="success" />}
        />
        <StatCard
          label="Gastei esse mês"
          value={<MoneyDisplay value={current.totalExpenses} size="md" tone="danger" />}
        />
        <StatCard
          label="Sobrou"
          value={<MoneyDisplay value={balance} size="md" tone={balance < 0 ? 'danger' : 'default'} />}
        />
        <StatCard
          label="Média mensal"
          value={<MoneyDisplay value={monthlyAverage} size="md" />}
          hint="últimos 6 meses"
        />
      </div>

      {analysis && <InsightCard label="Análise" message={analysis} className="mt-5" />}
    </div>
  )
}

export default GraphsPage
