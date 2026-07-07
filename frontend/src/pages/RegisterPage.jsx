import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { register } from '@/services/authService'

function RegisterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Senha muito curta',
        description: 'Use pelo menos 8 caracteres.',
      })
      return
    }

    setLoading(true)
    try {
      await register(name.trim(), email.trim(), password)
      navigate('/onboarding', { replace: true })
    } catch (error) {
      const alreadyExists = error.response?.status === 500 || error.response?.status === 409
      toast({
        variant: 'destructive',
        title: 'Não deu para criar sua conta',
        description: alreadyExists
          ? 'Talvez esse e-mail já esteja cadastrado. Tente entrar.'
          : 'Confira os dados e tente de novo.',
      })
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <p className="text-lg font-bold tracking-tight text-primary">Fintrek</p>
      <h1 className="mt-8 text-3xl font-semibold leading-tight">
        Seu negócio,
        <br />
        finalmente organizado
      </h1>
      <p className="mt-3 text-sm text-text-secondary">
        Leva menos de um minuto para começar.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <Label htmlFor="name">Seu nome</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Como você quer ser chamado"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Pelo menos 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2"
            required
          />
        </div>

        <Button type="submit" size="xl" disabled={loading} className="mt-2">
          {loading ? 'Criando conta…' : 'Criar conta grátis'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-primary">
          Entrar
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
