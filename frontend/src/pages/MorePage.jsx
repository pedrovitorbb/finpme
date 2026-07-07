import { Link } from 'react-router-dom'
import { HandCoins, MessageCircle, Building2, Landmark, Settings, ChevronRight } from 'lucide-react'

const TOOLS = [
  {
    to: '/mais/devedores',
    icon: HandCoins,
    title: 'Cobrar devedor',
    subtitle: 'Anote quem te deve e mande lembretes',
  },
  {
    to: '/mais/alertas',
    icon: MessageCircle,
    title: 'Alertas no WhatsApp',
    subtitle: 'Resumos e avisos direto no seu celular',
  },
  {
    to: '/mais/configuracoes',
    icon: Building2,
    title: 'Minha empresa',
    subtitle: 'Dados do seu negócio e regime',
  },
  {
    to: '/mais',
    icon: Landmark,
    title: 'Conectar banco',
    subtitle: 'Importe lançamentos automaticamente (em breve)',
    disabled: true,
  },
  {
    to: '/mais/configuracoes',
    icon: Settings,
    title: 'Configurações',
    subtitle: 'Conta, plano e segurança',
  },
]

function MorePage() {
  return (
    <div className="px-5 pt-6">
      <h1 className="text-title">Mais</h1>

      <ul className="mt-5 divide-y rounded-lg border bg-surface">
        {TOOLS.map(({ to, icon: Icon, title, subtitle, disabled }) => (
          <li key={title}>
            <Link
              to={to}
              className={
                disabled
                  ? 'pointer-events-none flex items-center gap-3.5 p-4 opacity-50'
                  : 'flex items-center gap-3.5 p-4 transition-colors hover:bg-secondary/50'
              }
              aria-disabled={disabled}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon size={19} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{title}</span>
                <span className="block text-xs text-text-muted">{subtitle}</span>
              </span>
              <ChevronRight size={18} className="text-text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MorePage
