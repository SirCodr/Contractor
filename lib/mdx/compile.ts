/**
 * Compila MDX (source string) → React component function
 * Usa next-mdx-remote/rsc para compilación en servidor.
 * Nota: Variables (scope) no se soportan en next-mdx-remote/rsc.
 * Las variables deben ser proporcionadas a través de React Context o props.
 */
import { compileMDX } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/components/mdx'

interface CompileMdxResult {
  content: React.ReactNode
  frontmatter: Record<string, any>
}

export async function compileMdx(
  source: string,
  _scope?: Record<string, any>,
): Promise<CompileMdxResult> {
  try {
    const { content, frontmatter } = await compileMDX({
      source,
      components: mdxComponents,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          development: process.env.NODE_ENV === 'development',
        },
      },
    })

    return {
      content,
      frontmatter: frontmatter || {},
    }
  } catch (error) {
    console.error('[compileMdx] Error compiling MDX:', error)
    throw error
  }
}
