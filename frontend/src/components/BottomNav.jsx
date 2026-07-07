import { NavLink } from 'react-router-dom'
import { Home, PlusCircle, BarChart3, Percent, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/lancar', label: 'Lançar', icon: PlusCircle },
  { to: '/graficos', label: 'Gráficos', icon: BarChart3 },
  { to: '/impostos', label: 'Impostos', icon: Percent },
  { to: '/mais', label: 'Mais', icon: Menu },
]

/**
 * Navegação inferior fixa, mobile-first, com 5 destinos.
 */
function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t bg-surface/95 backdrop-blur">
      <div
        className="grid grid-cols-5"
        style={{ height: 'var(--bottom-nav-height)' }}
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary',
              )
            }
          >
            <Icon className="h-5 w-5" strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
