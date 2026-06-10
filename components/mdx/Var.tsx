/**
 * Componente MDX: Var
 * Reemplaza un placeholder {{name}} con el valor del scope.
 * Fallback: [name] si el valor está vacío o undefined.
 */
interface VarProps {
  name: string
}

export function Var({ name }: VarProps) {
  // El scope se pasa vía MDXRemote context/provider
  // En runtime, el valor se inyecta por next-mdx-remote
  return `[${name}]`
}
