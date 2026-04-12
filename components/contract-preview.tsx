'use client'

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import { generateContractMarkdown } from '@/lib/markdown-generator'
import type { ContractFormValues } from '@/lib/schemas'

interface ContractPreviewProps {
  values: ContractFormValues
  className?: string
}

export function ContractPreview({ values, className }: ContractPreviewProps) {
  const markdownContent = generateContractMarkdown(values)

  return (
    <div className={`prose prose-sm mx-auto max-w-none ${className || ''}`}>
      <style>{`
        .markdown-preview {
          font-size: 14px;
          line-height: 1.5;
          text-align: justify;
        }
        .markdown-preview h1 {
          font-size: 1.15rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 2rem;
          text-transform: uppercase;
          line-height: 1.4;
        }
        .markdown-preview p {
          margin-bottom: 1rem;
          font-size: 14px;
          line-height: 1.5;
          text-align: justify;
        }
        .markdown-preview strong { font-weight: 700; color: #111; }
      `}</style>
      <div className="markdown-preview p-8 bg-white border border-gray-200 shadow-sm rounded-lg text-black">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  )
}
