/**
 * Componente MDX: NumberToText
 * Convierte un número a letras en español.
 * Reusa la función numberToSpanishText de template-engine.
 */
import { numberToSpanishText } from '@/lib/template-engine'

interface NumberToTextProps {
  n: number
}

export function NumberToText({ n }: NumberToTextProps) {
  return <>{numberToSpanishText(n)}</>
}
