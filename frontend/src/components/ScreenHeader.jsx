import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Cabeçalho de tela interna: botão de voltar + título.
 * `backTo` define o destino; sem ele, volta no histórico.
 */
function ScreenHeader({ title, backTo, action, className }) {
  const navigate = useNavigate()

  function handleBack() {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <header className={cn('flex items-center gap-2 px-3 pb-2 pt-5', className)}>
      <button
        type="button"
        onClick={handleBack}
        className="rounded-full p-2 text-text-secondary transition-colors hover:bg-secondary"
        aria-label="Voltar"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 text-title">{title}</h1>
      {action}
    </header>
  )
}

export default ScreenHeader
