import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { getCurrentUser } from '@/services/authService'

function initialsOf(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/**
 * Barra superior: logo Fintrek, sino de notificações e avatar com as
 * iniciais do usuário (leva às configurações).
 */
function TopBar({ notificationCount = 0 }) {
  const user = getCurrentUser()

  return (
    <header className="flex items-center justify-between px-5 pb-2 pt-5">
      <Link to="/" className="text-lg font-bold tracking-tight text-primary">
        Fintrek
      </Link>

      <div className="flex items-center gap-3">
        <Link
          to="/mais/alertas"
          className="relative rounded-full p-2 text-text-secondary transition-colors hover:bg-secondary"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.625rem] font-bold text-danger-foreground">
              {notificationCount}
            </span>
          )}
        </Link>

        <Link
          to="/mais/configuracoes"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
          aria-label="Meu perfil"
        >
          {initialsOf(user?.name)}
        </Link>
      </div>
    </header>
  )
}

export default TopBar
