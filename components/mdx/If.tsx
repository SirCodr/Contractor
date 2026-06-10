/**
 * Componente MDX: If
 * Renderiza children solo si el scope[var] es truthy.
 * Si el valor está vacío, no renderiza nada.
 */
interface IfProps {
  var: string
  children: React.ReactNode
}

export function If({ var: varName, children }: IfProps) {
  // En runtime, next-mdx-remote inyectará la lógica de condicional.
  // Este stub se reemplaza con lógica en el compilador.
  return <>{children}</>
}
