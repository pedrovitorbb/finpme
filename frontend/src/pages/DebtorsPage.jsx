import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, HandCoins, MessageCircle, Trash2 } from 'lucide-react'
import ScreenHeader from '@/components/ScreenHeader'
import SemaforoCard from '@/components/SemaforoCard'
import EmptyState from '@/components/EmptyState'
import MoneyDisplay from '@/components/MoneyDisplay'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useCompany } from '@/context/CompanyContext'
import { formatCurrency, formatFriendlyDate } from '@/hooks/useFormatters'
import {
  listDebtors,
  createDebtor,
  markDebtorAsPaid,
  deleteDebtor,
} from '@/services/debtorService'
import { cn } from '@/lib/utils'

function buildChargeLink(debtor, companyName) {
  const digits = (debtor.whatsappNumber ?? '').replace(/\D/g, '')
  if (!digits) return null
  const message =
    `Oi, ${debtor.name}! Tudo bem? Passando para lembrar do valor de ` +
    `${formatCurrency(debtor.amount)} combinado com ${companyName ?? 'a gente'}. ` +
    'Quando puder acertar, me avisa. Obrigado!'
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

function DebtorsPage() {
  const { company } = useCompany()
  const { toast } = useToast()
  const [debtors, setDebtors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', dueDate: '', whatsappNumber: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listDebtors(company.id)
      setDebtors(data)
    } catch {
      toast({ variant: 'destructive', title: 'Não foi possível carregar os devedores' })
    } finally {
      setLoading(false)
    }
  }, [company.id, toast])

  useEffect(() => {
    load()
  }, [load])

  const open = useMemo(() => debtors.filter((d) => d.status !== 'PAID'), [debtors])
  const totalOpen = open.reduce((sum, d) => sum + Number(d.amount), 0)
  const hasOverdue = open.some((d) => d.status === 'OVERDUE')

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    const amount = Number(form.amount.replace(/\./g, '').replace(',', '.'))
    if (!form.name.trim() || !amount || amount <= 0 || !form.dueDate) {
      toast({ variant: 'destructive', title: 'Preencha nome, valor e data' })
      return
    }

    setBusy(true)
    try {
      await createDebtor(company.id, {
        name: form.name.trim(),
        amount,
        dueDate: form.dueDate,
        whatsappNumber: form.whatsappNumber.trim() || null,
      })
      toast({ variant: 'success', title: 'Devedor anotado' })
      setModalOpen(false)
      setForm({ name: '', amount: '', dueDate: '', whatsappNumber: '' })
      load()
    } catch {
      toast({ variant: 'destructive', title: 'Não deu certo, tente de novo' })
    } finally {
      setBusy(false)
    }
  }

  async function handleMarkPaid(debtor) {
    try {
      await markDebtorAsPaid(company.id, debtor.id)
      toast({ variant: 'success', title: `${debtor.name} pagou — que ótimo!` })
      load()
    } catch {
      toast({ variant: 'destructive', title: 'Não deu certo, tente de novo' })
    }
  }

  async function handleDelete(debtor) {
    try {
      await deleteDebtor(company.id, debtor.id)
      toast({ title: 'Devedor removido' })
      load()
    } catch {
      toast({ variant: 'destructive', title: 'Não deu certo, tente de novo' })
    }
  }

  return (
    <div>
      <ScreenHeader title="Cobrar devedor" backTo="/mais" />

      {loading ? (
        <div className="flex flex-col gap-3 px-5 pt-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-5 pt-3">
          {open.length > 0 && (
            <SemaforoCard
              level={hasOverdue ? 'RED' : 'YELLOW'}
              message={
                open.length === 1
                  ? `1 cliente deve ${formatCurrency(totalOpen)} no total`
                  : `${open.length} clientes devem ${formatCurrency(totalOpen)} no total`
              }
            />
          )}

          {debtors.length === 0 ? (
            <EmptyState
              icon={HandCoins}
              message="Ninguém te devendo por aqui. Quando venderem fiado, anote para não esquecer."
              actionLabel="Adicionar devedor"
              onAction={() => setModalOpen(true)}
            />
          ) : (
            <ul className="divide-y rounded-lg border bg-surface">
              {debtors.map((debtor) => {
                const chargeLink = buildChargeLink(debtor, company?.nomeFantasia)
                const isPaid = debtor.status === 'PAID'
                const isOverdue = debtor.status === 'OVERDUE'
                return (
                  <li key={debtor.id} className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate text-sm font-medium', isPaid && 'text-text-muted line-through')}>
                        {debtor.name}
                      </p>
                      <p className={cn('text-xs', isOverdue ? 'font-medium text-danger' : 'text-text-muted')}>
                        {isPaid
                          ? 'Pago'
                          : isOverdue
                            ? `Venceu ${formatFriendlyDate(debtor.dueDate)}`
                            : `Vence ${formatFriendlyDate(debtor.dueDate)}`}
                      </p>
                    </div>

                    <MoneyDisplay
                      value={debtor.amount}
                      size="sm"
                      tone={isPaid ? 'default' : isOverdue ? 'danger' : 'default'}
                      className={cn(isPaid && 'text-text-muted line-through')}
                    />

                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(debtor)}
                        className="rounded-full p-2 text-text-muted transition-colors hover:bg-secondary hover:text-danger"
                        aria-label={`Remover ${debtor.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {chargeLink ? (
                          <Button asChild size="sm" variant="outline" className="gap-1.5">
                            <a href={chargeLink} target="_blank" rel="noreferrer">
                              <MessageCircle size={14} />
                              Cobrar
                            </a>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled title="Sem WhatsApp cadastrado">
                            Cobrar
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(debtor)}
                          className="rounded-full p-2 text-success transition-colors hover:bg-success/10"
                          aria-label={`Marcar ${debtor.name} como pago`}
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {debtors.length > 0 && (
            <Button size="xl" onClick={() => setModalOpen(true)}>
              Adicionar devedor
            </Button>
          )}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo devedor</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="debtor-name">Nome</Label>
              <Input
                id="debtor-name"
                placeholder="Ex: João da padaria"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                maxLength={255}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="debtor-amount">Valor (R$)</Label>
              <Input
                id="debtor-amount"
                inputMode="decimal"
                placeholder="0,00"
                value={form.amount}
                onChange={(e) => setField('amount', e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="debtor-due">Vence quando?</Label>
              <Input
                id="debtor-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setField('dueDate', e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="debtor-whats">
                WhatsApp <span className="font-normal text-text-muted">(opcional)</span>
              </Label>
              <Input
                id="debtor-whats"
                inputMode="tel"
                placeholder="Ex: 11 99999-0000"
                value={form.whatsappNumber}
                onChange={(e) => setField('whatsappNumber', e.target.value)}
                maxLength={20}
                className="mt-1.5"
              />
            </div>

            <DialogFooter className="mt-1">
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? 'Salvando…' : 'Salvar devedor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DebtorsPage
