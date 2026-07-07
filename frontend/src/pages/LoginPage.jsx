import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { login } from '@/services/authService'

function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Não deu para entrar',
        description: 'Confira seu e-mail e senha e tente de novo.',
      })
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <p className="text-lg font-bold tracking-tight text-primary">Fintrek</p>
      <h1 className="mt-8 text-3xl font-semibold leading-tight">
        Que bom te ver
        <br />
        de novo
      </h1>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
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
            autoComplete="current-password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2"
            required
          />
        </div>

        <Button type="submit" size="xl" disabled={loading} className="mt-2">
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Primeira vez por aqui?{' '}
        <Link to="/cadastro" className="font-medium text-primary">
          Criar conta grátis
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
