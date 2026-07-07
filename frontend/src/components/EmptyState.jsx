import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Estado vazio: ícone, frase curta e (opcional) botão de ação.
 */
function EmptyState({ icon: Icon, message, actionLabel, onAction, className }) {
  return (
    <div className={cn('flex flex-col items-center gap-4 px-8 py-14 text-center', className)}>
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-text-muted">
          <Icon className="h-7 w-7" strokeWidth={1.8} />
        </span>
      )}
      <p className="text-sm leading-relaxed text-text-secondary">{message}</p>
      {actionLabel && (
        <Button size="lg" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
