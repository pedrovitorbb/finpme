import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { registerByCnpj } from '@/services/companyService'
import { createTransaction } from '@/services/transactionService'
import { cn } from '@/lib/utils'

const TOTAL_STEPS = 3

function todayIso() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function StepDots({ current }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i + 1 === current ? 'w-8 bg-primary' : 'w-1.5 bg-border',
          )}
        />
      ))}
    </div>
  )
}

function OnboardingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)

  const [cnpj, setCnpj] = useState('')
  const [company, setCompany] = useState(null)
  const [amount, setAmount] = useState('')

  async function handleCnpjSubmit(event) {
    event.preventDefault()
    const digits = cnpj.replace(/\D/g, '')
    if (digits.length !== 14) {
      toast({ variant: 'destructive', title: 'CNPJ incompleto', description: 'Digite os 14 números.' })
      return
    }

    setBusy(true)
    try {
      const created = await registerByCnpj(digits)
      setCompany(created)
      setStep(2)
    } catch (error) {
      const status = error.response?.status
      toast({
        variant: 'destructive',
        title: status === 404 ? 'CNPJ não encontrado' : 'Não deu certo',
        description:
          status === 404
            ? 'Confira os números e tente de novo.'
            : status === 409
              ? 'Esse CNPJ já está cadastrado.'
              : 'Tente de novo em instantes.',
      })
    } finally {
      setBusy(false)
    }
  }

  function handleMixAnswer(mixes) {
    // Ainda não há endpoint para atualizar essa preferência no backend —
    // guardada localmente até a integração existir.
    localStorage.setItem('finpme_mixes_personal_business', JSON.stringify(mixes))
    setStep(3)
  }

  async function handleFirstTransaction(event) {
    event.preventDefault()
    const value = Number(amount.replace(/\./g, '').replace(',', '.'))
    if (!value || value <= 0) {
      toast({ variant: 'destructive', title: 'Valor inválido' })
      return
    }

    setBusy(true)
    try {
      await createTransaction(company.id, {
        amount: value,
        type: 'INCOME',
        category: 'SALE',
        transactionDate: todayIso(),
        description: 'Primeira venda registrada no Fintrek',
      })
      toast({ variant: 'success', title: 'Primeira venda registrada!' })
      navigate('/', { replace: true })
    } catch {
      toast({ variant: 'destructive', title: 'Não deu certo, tente de novo' })
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-14">
      <StepDots current={step} />

      {step === 1 && (
        <div className="mt-10">
          <h1 className="text-3xl font-semibold leading-tight">
            Qual o CNPJ
            <br />
            do seu negócio?
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            A gente busca os dados da sua empresa automaticamente.
          </p>

          <form onSubmit={handleCnpjSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                maxLength={18}
                className="mt-2 text-lg tracking-wide"
                required
              />
            </div>
            <Button type="submit" size="xl" disabled={busy}>
              {busy ? 'Buscando…' : 'Buscar meu CNPJ'}
            </Button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="mt-10">
          {company && (
            <p className="text-sm font-medium text-success">
              ✓ {company.nomeFantasia || company.razaoSocial} cadastrada
            </p>
          )}
          <h1 className="mt-4 text-3xl font-semibold leading-tight">
            Você usa a mesma conta para gastos pessoais e do negócio?
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            Sem julgamentos — isso só ajuda a gente a separar as coisas para você.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button size="xl" variant="outline" onClick={() => handleMixAnswer(true)}>
              Sim, misturo tudo
            </Button>
            <Button size="xl" variant="outline" onClick={() => handleMixAnswer(false)}>
              Não, tenho conta separada
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-10">
          <h1 className="text-3xl font-semibold leading-tight">
            Registre sua
            <br />
            primeira venda
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            Quanto entrou no seu último trabalho ou venda? Pode ser um valor aproximado.
          </p>

          <form onSubmit={handleFirstTransaction} className="mt-8 flex flex-col gap-6">
            <div className="flex items-baseline gap-2 border-b-2 border-border pb-2 focus-within:border-primary">
              <span className="text-xl font-medium text-text-muted">R$</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-4xl font-medium tabular-nums outline-none placeholder:text-text-muted/50"
                autoComplete="off"
              />
            </div>

            <Button type="submit" size="xl" disabled={busy}>
              {busy ? 'Registrando…' : 'Registrar venda'}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="mt-6 w-full text-center text-sm text-text-muted"
          >
            Pular por enquanto
          </button>
        </div>
      )}
    </div>
  )
}

export default OnboardingPage
