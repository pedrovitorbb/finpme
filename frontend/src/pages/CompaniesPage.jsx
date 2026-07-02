import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listCompanies, registerByCnpj, registerManual } from '../services/companyService'
import './CompaniesPage.css'

const TAX_REGIMES = ['MEI', 'SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL']

function formatCnpj(cnpj) {
  if (!cnpj) return ''
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('cnpj')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [cnpjInput, setCnpjInput] = useState('')
  const [cnpjTaxRegime, setCnpjTaxRegime] = useState('')

  const [manualForm, setManualForm] = useState({ razaoSocial: '', cnpj: '', taxRegime: 'MEI' })

  const navigate = useNavigate()

  async function loadCompanies() {
    try {
      setLoading(true)
      const data = await listCompanies()
      setCompanies(data)
      setError('')
    } catch {
      setError('Não foi possível carregar as empresas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  function openModal() {
    setModalOpen(true)
    setActiveTab('cnpj')
    setFormError('')
    setCnpjInput('')
    setCnpjTaxRegime('')
    setManualForm({ razaoSocial: '', cnpj: '', taxRegime: 'MEI' })
  }

  function closeModal() {
    setModalOpen(false)
  }

  async function handleCnpjSubmit(event) {
    event.preventDefault()
    const digits = cnpjInput.replace(/\D/g, '')

    if (digits.length !== 14) {
      setFormError('CNPJ deve ter 14 dígitos')
      return
    }

    setFormError('')
    setSubmitting(true)

    try {
      await registerByCnpj(digits, cnpjTaxRegime || undefined)
      closeModal()
      await loadCompanies()
    } catch {
      setFormError('Não foi possível cadastrar a empresa')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleManualSubmit(event) {
    event.preventDefault()
    const digits = manualForm.cnpj.replace(/\D/g, '')

    if (digits.length !== 14) {
      setFormError('CNPJ deve ter 14 dígitos')
      return
    }

    if (!manualForm.razaoSocial.trim()) {
      setFormError('Razão social é obrigatória')
      return
    }

    setFormError('')
    setSubmitting(true)

    try {
      await registerManual({ ...manualForm, cnpj: digits })
      closeModal()
      await loadCompanies()
    } catch {
      setFormError('Não foi possível cadastrar a empresa')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="companies-page">
      <header className="companies-header">
        <Link to="/" className="back-link">
          ← Dashboard
        </Link>
        <h1>Empresas</h1>
        <button type="button" className="new-company-button" onClick={openModal}>
          Nova empresa
        </button>
      </header>

      {loading && <p>Carregando...</p>}
      {error && <p className="companies-error">{error}</p>}

      {!loading && !error && (
        <div className="companies-grid">
          {companies.map((company) => (
            <div key={company.id} className="company-card">
              <h2>{company.razaoSocial}</h2>
              <p className="company-cnpj">{formatCnpj(company.cnpj)}</p>
              <p>
                <strong>Regime:</strong> {company.taxRegime}
              </p>
              <p>
                <strong>Local:</strong> {company.municipio}/{company.uf}
              </p>
              <div className="company-actions">
                <button type="button" onClick={() => navigate(`/transactions/${company.id}`)}>
                  Ver transações
                </button>
                <button type="button" onClick={() => navigate(`/tax-radar/${company.id}`)}>
                  Radar tributário
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-tabs">
              <button
                type="button"
                className={activeTab === 'cnpj' ? 'active' : ''}
                onClick={() => setActiveTab('cnpj')}
              >
                Por CNPJ
              </button>
              <button
                type="button"
                className={activeTab === 'manual' ? 'active' : ''}
                onClick={() => setActiveTab('manual')}
              >
                Manual
              </button>
            </div>

            {formError && <p className="companies-error">{formError}</p>}

            {activeTab === 'cnpj' ? (
              <form onSubmit={handleCnpjSubmit} className="modal-form">
                <label htmlFor="cnpj-input">CNPJ</label>
                <input
                  id="cnpj-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={14}
                  value={cnpjInput}
                  onChange={(event) => setCnpjInput(event.target.value.replace(/\D/g, ''))}
                  placeholder="Somente números"
                  required
                />

                <label htmlFor="cnpj-tax-regime">Regime tributário (opcional)</label>
                <select
                  id="cnpj-tax-regime"
                  value={cnpjTaxRegime}
                  onChange={(event) => setCnpjTaxRegime(event.target.value)}
                >
                  <option value="">Detectar automaticamente</option>
                  {TAX_REGIMES.map((regime) => (
                    <option key={regime} value={regime}>
                      {regime}
                    </option>
                  ))}
                </select>

                <button type="submit" disabled={submitting}>
                  {submitting ? 'Buscando...' : 'Buscar'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleManualSubmit} className="modal-form">
                <label htmlFor="manual-razao-social">Razão social</label>
                <input
                  id="manual-razao-social"
                  type="text"
                  value={manualForm.razaoSocial}
                  onChange={(event) =>
                    setManualForm({ ...manualForm, razaoSocial: event.target.value })
                  }
                  required
                />

                <label htmlFor="manual-cnpj">CNPJ</label>
                <input
                  id="manual-cnpj"
                  type="text"
                  inputMode="numeric"
                  maxLength={14}
                  value={manualForm.cnpj}
                  onChange={(event) =>
                    setManualForm({ ...manualForm, cnpj: event.target.value.replace(/\D/g, '') })
                  }
                  placeholder="Somente números"
                  required
                />

                <label htmlFor="manual-tax-regime">Regime tributário</label>
                <select
                  id="manual-tax-regime"
                  value={manualForm.taxRegime}
                  onChange={(event) =>
                    setManualForm({ ...manualForm, taxRegime: event.target.value })
                  }
                >
                  {TAX_REGIMES.map((regime) => (
                    <option key={regime} value={regime}>
                      {regime}
                    </option>
                  ))}
                </select>

                <button type="submit" disabled={submitting}>
                  {submitting ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CompaniesPage
