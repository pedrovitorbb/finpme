import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { listCompanies } from '../services/companyService'
import { getDashboard } from '../services/dashboardService'
import { getTaxRadar } from '../services/taxRadarService'
import { logout } from '../services/authService'
import './DashboardPage.css'

const ALERT_LABELS = {
  null: 'Normal',
  WARNING_70: 'Atenção (70%)',
  WARNING_85: 'Alerta (85%)',
  WARNING_95: 'Crítico (95%)',
}

const ALERT_COLORS = {
  null: '#2e7d32',
  WARNING_70: '#f9a825',
  WARNING_85: '#ef6c00',
  WARNING_95: '#c62828',
}

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
}

function formatCompact(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1000) return `${Math.round(value / 1000)}k`
  return `${value}`
}

function getLastSixMonths(year, month) {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(year, month - 1 - i, 1)
    months.push({ year: date.getFullYear(), month: date.getMonth() + 1 })
  }
  return months
}

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [taxRadar, setTaxRadar] = useState(null)
  const [revenueHistory, setRevenueHistory] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      const companyList = await listCompanies()
      if (cancelled) return
      setCompanies(companyList)

      if (companyList.length === 0) {
        setLoading(false)
        return
      }

      const companyId = companyList[0].id
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const months = getLastSixMonths(year, month)

      const [monthlyDashboards, taxRadarData] = await Promise.all([
        Promise.all(
          months.map((m) =>
            getDashboard(companyId, m.year, m.month).catch(() => null),
          ),
        ),
        getTaxRadar(companyId),
      ])
      if (cancelled) return

      setDashboard(monthlyDashboards[monthlyDashboards.length - 1])
      setTaxRadar(taxRadarData)
      setRevenueHistory(
        months.map((m, index) => ({
          month: MONTH_LABELS[m.month - 1],
          grossRevenue: monthlyDashboards[index]?.grossRevenue ?? 0,
        })),
      )
      setLoading(false)
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  function handleLogout() {
    logout()
  }

  if (loading) {
    return <div className="dashboard-page dashboard-loading">Carregando...</div>
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button type="button" className="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </header>

      {companies.length === 0 ? (
        <div className="dashboard-empty">
          <p>Nenhuma empresa cadastrada</p>
          <button type="button" onClick={() => navigate('/companies')}>
            Cadastrar empresa
          </button>
        </div>
      ) : (
        <>
          <section className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Faturamento Bruto</span>
              <span className="metric-value">{formatCurrency(dashboard?.grossRevenue)}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Faturamento Líquido</span>
              <span className="metric-value">{formatCurrency(dashboard?.netRevenue)}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">EBITDA</span>
              <span className="metric-value">{formatCurrency(dashboard?.ebitda)}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Total de Despesas</span>
              <span className="metric-value">{formatCurrency(dashboard?.totalExpenses)}</span>
            </div>
          </section>

          <section className="tax-radar">
            <h2>Radar Tributário</h2>
            <div className="tax-radar-content">
              <div className="tax-radar-item">
                <span className="metric-label">Limite Utilizado</span>
                <span className="metric-value">{taxRadar?.limitUsedPct}%</span>
              </div>
              <div className="tax-radar-item">
                <span className="metric-label">Faturamento Acumulado (ano)</span>
                <span className="metric-value">{formatCurrency(taxRadar?.ytdRevenue)}</span>
              </div>
              <div className="tax-radar-item">
                <span className="metric-label">Nível de Alerta</span>
                <span
                  className="alert-badge"
                  style={{ backgroundColor: ALERT_COLORS[taxRadar?.alertLevel] ?? ALERT_COLORS.null }}
                >
                  {ALERT_LABELS[taxRadar?.alertLevel] ?? ALERT_LABELS.null}
                </span>
              </div>
            </div>
          </section>

          <section className="revenue-chart">
            <h2>Evolução de Receita</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCompact} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Faturamento Bruto']}
                />
                <Bar
                  dataKey="grossRevenue"
                  fill="#6b6bff"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </>
      )}
    </div>
  )
}

export default DashboardPage
