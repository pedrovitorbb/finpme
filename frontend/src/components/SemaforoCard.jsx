import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const LEVEL_STYLES = {
  GREEN: { dot: 'bg-success', ring: 'ring-success/20' },
  YELLOW: { dot: 'bg-warning', ring: 'ring-warning/25' },
  RED: { dot: 'bg-danger', ring: 'ring-danger/20' },
}

/**
 * Card do semáforo de saúde: bolinha colorida + frase em linguagem simples.
 * `level`: "GREEN" | "YELLOW" | "RED" (healthLevel do backend).
 */
function SemaforoCard({ level = 'GREEN', message, className }) {
  const styles = LEVEL_STYLES[level] ?? LEVEL_STYLES.GREEN

  return (
    <Card className={cn('shadow-none', className)}>
      <CardContent className="flex items-center gap-3.5 p-4">
        <span
          className={cn('h-3.5 w-3.5 shrink-0 rounded-full ring-4', styles.dot, styles.ring)}
          aria-hidden="true"
        />
        <p className="text-sm font-medium leading-snug">{message}</p>
      </CardContent>
    </Card>
  )
}

export default SemaforoCard
