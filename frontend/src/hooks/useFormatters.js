const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function toDate(value) {
  if (value instanceof Date) return value
  // Datas ISO sem hora ("2026-07-07") são interpretadas como UTC pelo
  // construtor — parse manual para manter o dia certo no fuso local.
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(value)
}

export function formatCurrency(value) {
  return currencyFormatter.format(value ?? 0)
}

export function formatDate(date) {
  if (!date) return ''
  return toDate(date).toLocaleDateString('pt-BR')
}

export function formatMonth(month, year) {
  return `${MONTH_NAMES[month - 1]} ${year}`
}

export function formatFriendlyDate(date) {
  if (!date) return ''
  const target = toDate(date)
  const today = new Date()
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((startOfDay(today) - startOfDay(target)) / 86_400_000)

  if (diffDays <= 0) {
    if (diffDays === 0) return 'hoje'
    if (diffDays === -1) return 'amanhã'
    return `em ${-diffDays} dias`
  }
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `há ${diffDays} dias`
  return formatDate(target)
}

export function useFormatters() {
  return { formatCurrency, formatDate, formatMonth, formatFriendlyDate }
}
