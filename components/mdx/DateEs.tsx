/**
 * Componente MDX: DateEs
 * Formatea una fecha ISO a formato español (día de mes del año).
 */
interface DateEsProps {
  date: string
}

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function DateEs({ date }: DateEsProps) {
  if (!date) return null

  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return <>{date}</>

  const monthName = MONTHS_ES[month - 1] ?? ''
  const formatted = `${String(day).padStart(2, '0')} de ${monthName} del ${year}`

  return <>{formatted}</>
}
