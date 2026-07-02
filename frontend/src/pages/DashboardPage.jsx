import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
}

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [taxRadar, setTaxRadar] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      const companyList = await listCompanies()
      setCompanies(companyList)

      if (companyList.length === 0) {
        setLoading(false)
        return
      }

      const companyId = companyList[0].id
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      const [dashboardData, taxRadarData] = await Promise.all([
        getDashboard(companyId, year, month),
        getTaxRadar(companyId),
      ])

      setDashboard(dashboardData)
      setTaxRadar(taxRadarData)
      setLoading(false)
    }

    loadData()
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
        </>
      )}
    </div>
  )
}

export default DashboardPage
