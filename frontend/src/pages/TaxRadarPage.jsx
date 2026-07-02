import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTaxRadar } from '../services/taxRadarService'
import './TaxRadarPage.css'

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

function getProgressColor(pct) {
  if (pct === null || pct === undefined) return '#2e7d32'
  if (pct >= 95) return '#c62828'
  if (pct >= 85) return '#ef6c00'
  if (pct >= 70) return '#f9a825'
  return '#2e7d32'
}

function TaxRadarPage() {
  const { companyId } = useParams()
  const [radar, setRadar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRadar() {
      try {
        setLoading(true)
        const data = await getTaxRadar(companyId)
        setRadar(data)
        setError('')
      } catch {
        setError('Não foi possível carregar o radar tributário')
      } finally {
        setLoading(false)
      }
    }

    loadRadar()
  }, [companyId])

  const pct = radar?.limitUsedPct ?? null
  const progressWidth = pct !== null ? Math.min(pct, 100) : 0

  return (
    <div className="tax-radar-page">
      <header className="tax-radar-header">
        <Link to="/companies" className="back-link">
          ← Empresas
        </Link>
        <h1>Radar Tributário</h1>
      </header>

      {loading && <p>Carregando...</p>}
      {error && <p className="tax-radar-error">{error}</p>}

      {!loading && !error && radar && (
        <div className="tax-radar-card">
          <div className="tax-radar-row">
            <span className="tax-radar-label">Regime tributário</span>
            <span className="tax-radar-value">{radar.taxRegime}</span>
          </div>

          <div className="tax-radar-row">
            <span className="tax-radar-label">Faturamento acumulado (ano)</span>
            <span className="tax-radar-value">{formatCurrency(radar.ytdRevenue)}</span>
          </div>

          <div className="tax-radar-row">
            <span className="tax-radar-label">Limite anual</span>
            <span className="tax-radar-value">
              {radar.annualLimit !== null ? formatCurrency(radar.annualLimit) : 'Sem limite'}
            </span>
          </div>

          <div className="tax-radar-row">
            <span className="tax-radar-label">Percentual do limite usado</span>
            <span className="tax-radar-value">{pct !== null ? `${pct}%` : '—'}</span>
          </div>

          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressWidth}%`, backgroundColor: getProgressColor(pct) }}
            />
          </div>

          <div className="tax-radar-row">
            <span className="tax-radar-label">Faturamento projetado (fim do ano)</span>
            <span className="tax-radar-value">{formatCurrency(radar.projectedRevenue)}</span>
          </div>

          <div className="tax-radar-row">
            <span className="tax-radar-label">Nível de alerta</span>
            <span
              className="alert-badge"
              style={{ backgroundColor: ALERT_COLORS[radar.alertLevel] ?? ALERT_COLORS.null }}
            >
              {ALERT_LABELS[radar.alertLevel] ?? ALERT_LABELS.null}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaxRadarPage
