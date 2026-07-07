import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Card simples de métrica: label pequena em cima, valor em destaque embaixo.
 * `value` pode ser um nó pronto (ex: <MoneyDisplay />) ou texto.
 */
function StatCard({ label, value, hint, className }) {
  return (
    <Card className={cn('shadow-none', className)}>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className="text-lg font-semibold tabular-nums">{value}</span>
        {hint && <span className="text-xs text-text-muted">{hint}</span>}
      </CardContent>
    </Card>
  )
}

export default StatCard
