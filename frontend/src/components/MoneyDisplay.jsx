import { cn } from '@/lib/utils'
import { formatCurrency } from '@/hooks/useFormatters'

const SIZES = {
  sm: 'text-sm font-medium',
  md: 'text-base font-medium',
  lg: 'text-2xl font-semibold',
  display: 'text-display tracking-tight',
}

/**
 * Exibição padronizada de valores em reais.
 * `tone`: "default" | "success" | "danger" | "auto" (verde se positivo,
 * vermelho se negativo). `signed` prefixa +/− para reforçar a direção.
 */
function MoneyDisplay({ value, size = 'md', tone = 'default', signed = false, className }) {
  const amount = value ?? 0
  const resolvedTone = tone === 'auto' ? (amount < 0 ? 'danger' : 'success') : tone

  const toneClass = {
    default: 'text-foreground',
    success: 'text-success',
    danger: 'text-danger',
  }[resolvedTone]

  const sign = signed && amount !== 0 ? (amount > 0 ? '+' : '−') : ''

  return (
    <span className={cn('tabular-nums', SIZES[size], toneClass, className)}>
      {sign}
      {formatCurrency(Math.abs(amount))}
    </span>
  )
}

export default MoneyDisplay
