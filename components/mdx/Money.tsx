/**
 * Componente MDX: Money
 * Formatea un número como moneda es-CO (pesos colombianos).
 */
interface MoneyProps {
  value: number
}

export function Money({ value }: MoneyProps) {
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
  return <>{formatted}</>
}
