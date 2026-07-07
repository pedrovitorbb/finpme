import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useCompany } from '@/context/CompanyContext'
import { createTransaction } from '@/services/transactionService'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: 'SALE', label: 'Venda' },
  { value: 'SUPPLIER', label: 'Fornecedor' },
  { value: 'TAX', label: 'Imposto' },
  { value: 'SALARY', label: 'Salário' },
  { value: 'RENT', label: 'Aluguel' },
  { value: 'OTHER', label: 'Outros' },
]

function todayIso() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function parseAmount(raw) {
  const normalized = raw.replace(/\./g, '').replace(',', '.')
  const value = Number(normalized)
  return Number.isFinite(value) ? value : NaN
}

function TransactionsPage() {
  const { company } = useCompany()
  const { toast } = useToast()
  const [type, setType] = useState('INCOME')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('SALE')
  const [date, setDate] = useState(todayIso())
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const isIncome = type === 'INCOME'

  async function handleSubmit(event) {
    event.preventDefault()

    const value = parseAmount(amount)
    if (!value || value <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valor inválido',
        description: 'Informe quanto dinheiro entrou ou saiu.',
      })
      return
    }

    setSaving(true)
    try {
      await createTransaction(company.id, {
        amount: value,
        type,
        category,
        transactionDate: date,
        description: description.trim() || null,
      })
      toast({
        variant: 'success',
        title: isIncome ? 'Entrada salva!' : 'Saída salva!',
        description: 'Seu lançamento já está no histórico.',
      })
      setAmount('')
      setDescription('')
      setDate(todayIso())
    } catch {
      toast({
        variant: 'destructive',
        title: 'Não deu certo',
        description: 'Tente salvar de novo em instantes.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-title">Lançar</h1>
        <Link to="/historico" className="text-sm font-medium text-primary">
          Ver histórico
        </Link>
      </div>

      <Tabs value={type} onValueChange={setType} className="mt-5">
        <TabsList className="grid h-14 w-full grid-cols-2">
          <TabsTrigger value="INCOME" className="h-full text-base data-[state=active]:text-success">
            Entrou dinheiro
          </TabsTrigger>
          <TabsTrigger value="EXPENSE" className="h-full text-base data-[state=active]:text-danger">
            Saiu dinheiro
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-7">
        <div>
          <Label htmlFor="amount" className="text-text-secondary">
            Quanto?
          </Label>
          <div className="mt-2 flex items-baseline gap-2 border-b-2 border-border pb-2 focus-within:border-primary">
            <span className="text-xl font-medium text-text-muted">R$</span>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-4xl font-medium tabular-nums outline-none placeholder:text-text-muted/50"
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <Label className="text-text-secondary">Categoria</Label>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  category === value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-text-secondary hover:border-text-muted',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="date" className="text-text-secondary">
            Quando?
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-text-secondary">
            Descrição <span className="font-normal text-text-muted">(opcional)</span>
          </Label>
          <Input
            id="description"
            placeholder={isIncome ? 'Ex: venda para a Maria' : 'Ex: compra de material'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            className="mt-2"
          />
        </div>

        <Button
          type="submit"
          size="xl"
          disabled={saving}
          className={cn(!isIncome && 'bg-danger hover:bg-danger/90')}
        >
          {saving ? 'Salvando…' : isIncome ? 'Salvar entrada' : 'Salvar saída'}
        </Button>
      </form>

      <p className="mt-6 pb-4 text-center text-sm text-text-muted">
        Ou{' '}
        <Link to="/mais" className="font-medium text-primary">
          conecte seu banco
        </Link>{' '}
        para importar automaticamente
      </p>
    </div>
  )
}

export default TransactionsPage
