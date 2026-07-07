import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Inbox } from 'lucide-react'
import ScreenHeader from '@/components/ScreenHeader'
import MoneyDisplay from '@/components/MoneyDisplay'
import EmptyState from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useCompany } from '@/context/CompanyContext'
import { formatDate } from '@/hooks/useFormatters'
import {
  listTransactions,
  updateTransaction,
  deleteTransaction,
} from '@/services/transactionService'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS = {
  SALE: 'Venda',
  SUPPLIER: 'Fornecedor',
  TAX: 'Imposto',
  SALARY: 'Salário',
  RENT: 'Aluguel',
  OTHER: 'Outros',
}

const MONTH_NAMES_SHORT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function isoDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function groupLabel(dateStr) {
  const today = new Date()
  const todayIso = isoDate(today)
  const yesterdayIso = isoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))
  const weekAgoIso = isoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6))

  if (dateStr === todayIso) return 'Hoje'
  if (dateStr === yesterdayIso) return 'Ontem'
  if (dateStr >= weekAgoIso && dateStr < yesterdayIso) return 'Esta semana'
  return formatDate(dateStr)
}

function TransactionListPage() {
  const { company } = useCompany()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listTransactions(company.id)
      setTransactions(data)
    } catch {
      toast({ variant: 'destructive', title: 'Não foi possível carregar o histórico' })
    } finally {
      setLoading(false)
    }
  }, [company.id, toast])

  useEffect(() => {
    load()
  }, [load])

  const now = new Date()
  const monthChipLabel =
    MONTH_NAMES_SHORT[now.getMonth()].charAt(0).toUpperCase() +
    MONTH_NAMES_SHORT[now.getMonth()].slice(1)

  const filters = [
    { value: 'ALL', label: 'Tudo' },
    { value: 'INCOME', label: 'Entradas' },
    { value: 'EXPENSE', label: 'Saídas' },
    { value: 'MONTH', label: monthChipLabel },
  ]

  const filtered = useMemo(() => {
    const monthPrefix = isoDate(now).slice(0, 7)
    return transactions.filter((t) => {
      if (filter === 'INCOME') return t.type === 'INCOME'
      if (filter === 'EXPENSE') return t.type === 'EXPENSE'
      if (filter === 'MONTH') return t.transactionDate.startsWith(monthPrefix)
      return true
    })
  }, [transactions, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => {
    const result = []
    let currentLabel = null
    for (const t of filtered) {
      const label = groupLabel(t.transactionDate)
      if (label !== currentLabel) {
        result.push({ label, items: [] })
        currentLabel = label
      }
      result[result.length - 1].items.push(t)
    }
    return result
  }, [filtered])

  function openTransaction(t) {
    setSelected(t)
    setEditAmount(String(t.amount).replace('.', ','))
    setEditDescription(t.description ?? '')
  }

  async function handleSave() {
    const value = Number(editAmount.replace(/\./g, '').replace(',', '.'))
    if (!value || value <= 0) {
      toast({ variant: 'destructive', title: 'Valor inválido' })
      return
    }
    setBusy(true)
    try {
      await updateTransaction(company.id, selected.id, {
        amount: value,
        description: editDescription.trim() || null,
      })
      toast({ variant: 'success', title: 'Lançamento atualizado' })
      setSelected(null)
      load()
    } catch {
      toast({ variant: 'destructive', title: 'Não deu certo, tente de novo' })
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteTransaction(company.id, selected.id)
      toast({ variant: 'success', title: 'Lançamento apagado' })
      setSelected(null)
      load()
    } catch {
      toast({ variant: 'destructive', title: 'Não deu certo, tente de novo' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <ScreenHeader title="Histórico" backTo="/lancar" />

      <div className="flex gap-2 overflow-x-auto px-5 py-3">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              filter === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-surface text-text-secondary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 px-5 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Inbox}
          message="Nenhum lançamento por aqui ainda. Registre sua primeira entrada ou saída."
        />
      ) : (
        <div className="flex flex-col gap-5 px-5 pt-2">
          {groups.map(({ label, items }) => (
            <section key={label}>
              <h2 className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {label}
              </h2>
              <ul className="divide-y rounded-lg border bg-surface">
                {items.map((t) => {
                  const isIncome = t.type === 'INCOME'
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => openTransaction(t)}
                        className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-secondary/50"
                      >
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                            isIncome ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
                          )}
                        >
                          {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {t.description || CATEGORY_LABELS[t.category] || 'Sem descrição'}
                          </span>
                          <span className="block text-xs text-text-muted">
                            {CATEGORY_LABELS[t.category] ?? 'Outros'}
                          </span>
                        </span>
                        <MoneyDisplay
                          value={isIncome ? t.amount : -t.amount}
                          tone={isIncome ? 'success' : 'danger'}
                          signed
                          size="sm"
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar lançamento</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="edit-amount">Valor (R$)</Label>
              <Input
                id="edit-amount"
                inputMode="decimal"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={500}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" className="text-danger" onClick={handleDelete} disabled={busy}>
              Apagar
            </Button>
            <Button onClick={handleSave} disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TransactionListPage
