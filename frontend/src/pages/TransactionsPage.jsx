import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listTransactions, createTransaction } from '../services/transactionService'
import './TransactionsPage.css'

const TRANSACTION_TYPES = ['INCOME', 'EXPENSE']
const TRANSACTION_CATEGORIES = ['SALE', 'SUPPLIER', 'TAX', 'SALARY', 'RENT', 'OTHER']

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
}

function formatDate(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

const EMPTY_FORM = {
  amount: '',
  type: 'INCOME',
  category: 'SALE',
  transactionDate: '',
  description: '',
}

function TransactionsPage() {
  const { companyId } = useParams()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  async function loadTransactions() {
    try {
      setLoading(true)
      const data = await listTransactions(companyId)
      setTransactions(data)
      setError('')
    } catch {
      setError('Não foi possível carregar as transações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [companyId])

  function openModal() {
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.amount || !form.transactionDate) {
      setFormError('Valor e data são obrigatórios')
      return
    }

    setFormError('')
    setSubmitting(true)

    try {
      await createTransaction(companyId, {
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        transactionDate: form.transactionDate,
        description: form.description,
      })
      closeModal()
      await loadTransactions()
    } catch {
      setFormError('Não foi possível criar a transação')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="transactions-page">
      <header className="transactions-header">
        <Link to="/companies" className="back-link">
          ← Empresas
        </Link>
        <h1>Transações</h1>
        <button type="button" className="new-transaction-button" onClick={openModal}>
          Nova transação
        </button>
      </header>

      {loading && <p>Carregando...</p>}
      {error && <p className="transactions-error">{error}</p>}

      {!loading && !error && (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.transactionDate)}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category}</td>
                <td>
                  <span className={`type-badge type-${transaction.type.toLowerCase()}`}>
                    {transaction.type}
                  </span>
                </td>
                <td>{formatCurrency(transaction.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2>Nova transação</h2>

            {formError && <p className="transactions-error">{formError}</p>}

            <form onSubmit={handleSubmit} className="modal-form">
              <label htmlFor="tx-amount">Valor</label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                required
              />

              <label htmlFor="tx-type">Tipo</label>
              <select
                id="tx-type"
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
              >
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <label htmlFor="tx-category">Categoria</label>
              <select
                id="tx-category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              >
                {TRANSACTION_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <label htmlFor="tx-date">Data</label>
              <input
                id="tx-date"
                type="date"
                value={form.transactionDate}
                onChange={(event) => setForm({ ...form, transactionDate: event.target.value })}
                required
              />

              <label htmlFor="tx-description">Descrição</label>
              <input
                id="tx-description"
                type="text"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />

              <button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsPage
