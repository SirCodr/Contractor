const UNITS = [
  '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis',
  'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
]
const TENS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const HUNDREDS = ['', 'cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']

function toText(n: number): string {
  if (n === 0) return ''
  if (n <= 20) return UNITS[n]
  if (n < 30) return 'veinti' + UNITS[n - 20]
  if (n < 100) {
    const t = Math.floor(n / 10)
    const u = n % 10
    return u === 0 ? TENS[t] : `${TENS[t]} y ${UNITS[u]}`
  }
  if (n === 100) return 'cien'
  if (n < 200) return 'ciento ' + toText(n - 100)
  if (n < 1000) {
    const h = Math.floor(n / 100)
    const r = n % 100
    return r === 0 ? HUNDREDS[h] : `${HUNDREDS[h]} ${toText(r)}`
  }
  if (n < 2000) {
    const r = n - 1000
    return r === 0 ? 'mil' : `mil ${toText(r)}`
  }
  if (n < 1_000_000) {
    const t = Math.floor(n / 1000)
    const r = n % 1000
    return r === 0 ? `${toText(t)} mil` : `${toText(t)} mil ${toText(r)}`
  }
  const m = Math.floor(n / 1_000_000)
  const r = n % 1_000_000
  const mText = m === 1 ? 'un millón' : `${toText(m)} millones`
  return r === 0 ? mText : `${mText} ${toText(r)}`
}

export function numberToSpanishText(n: number): string {
  if (n === 0) return 'CERO'
  return toText(Math.round(n)).toUpperCase()
}

export function replaceVariables(template: string, variables: Record<string, string>): string {
  // First: resolve conditional blocks {{#key}}content{{/key}}
  // If the variable is non-empty, render the inner content (with variable replaced).
  // If empty or missing, collapse the whole block to nothing.
  let result = template.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_match, key, inner) => {
      const value = variables[key]
      if (!value) return ''
      return inner.replace(/\{\{(\w+)\}\}/g, (_m: string, k: string) => variables[k] ?? _m)
    },
  )
  // Then: replace remaining simple {{key}} placeholders
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] ?? match)
  return result
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO').format(amount)
}

export function extractVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g)
  return [...new Set([...matches].map((m) => m[1]))]
}
