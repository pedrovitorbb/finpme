import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

function colorForPct(pct) {
  if (pct >= 95) return 'bg-danger'
  if (pct >= 85) return 'bg-warning'
  if (pct >= 70) return 'bg-warning/80'
  return 'bg-success'
}

/**
 * Barra de progresso do limite de faturamento, com cor por faixa:
 * verde <70%, amarelo 70–85%, laranja 85–95%, vermelho >95%.
 */
function RadarBar({ label, percent, caption, className }) {
  const pct = Math.max(0, Math.round(percent ?? 0))

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold tabular-nums">{Math.min(pct, 999)}%</span>
      </div>
      <Progress value={pct} indicatorClassName={colorForPct(pct)} />
      {caption && <p className="text-sm text-text-secondary">{caption}</p>}
    </div>
  )
}

export default RadarBar
