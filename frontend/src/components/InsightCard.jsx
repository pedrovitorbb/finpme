import { Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Card de dica: label "Dica do dia" (ou customizada) + texto do insight.
 */
function InsightCard({ label = 'Dica do dia', title, message, className }) {
  return (
    <Card className={cn('border-primary/15 bg-primary/[0.04] shadow-none', className)}>
      <CardContent className="flex flex-col gap-1.5 p-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          <Lightbulb className="h-3.5 w-3.5" />
          {label}
        </span>
        {title && <p className="text-sm font-semibold">{title}</p>}
        <p className="text-sm leading-relaxed text-text-secondary">{message}</p>
      </CardContent>
    </Card>
  )
}

export default InsightCard
