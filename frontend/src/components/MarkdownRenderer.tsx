import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="text-2xl font-semibold text-text-primary mt-6 mb-3" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-xl font-semibold text-text-primary mt-5 mb-2" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-semibold text-text-primary mt-4 mb-2" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-base font-semibold text-text-primary mt-3 mb-1" {...props}>{children}</h4>
  ),
  p: ({ children, ...props }) => (
    <p className="text-text-primary leading-relaxed mb-3 last:mb-0" {...props}>{children}</p>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-primary hover:underline underline-offset-2 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.startsWith('language-') || className?.startsWith('hljs')
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className="bg-[#f2f3f5] text-[#d63384] px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => (
    <pre
      className="bg-[#f6f8fa] rounded-xl p-4 overflow-x-auto mb-3 text-sm border border-border"
      {...props}
    >
      {children}
    </pre>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside space-y-1 mb-3 text-text-primary ml-1 marker:text-text-tertiary" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside space-y-1 mb-3 text-text-primary ml-1 marker:text-text-tertiary" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-text-primary leading-relaxed" {...props}>{children}</li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-primary/30 bg-primary-light/30 px-4 py-2 my-3 rounded-r-lg"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-3">
      <table className="w-full border-collapse border border-border" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="border-b border-border" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }) => (
    <th className="text-left text-text-primary font-semibold px-3 py-2 bg-[#f2f3f5] border border-border" {...props}>{children}</th>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-b border-border even:bg-[#f9fafb]" {...props}>{children}</tr>
  ),
  td: ({ children, ...props }) => (
    <td className="text-text-primary px-3 py-2 border border-border" {...props}>{children}</td>
  ),
  hr: (props) => (
    <hr className="border-border my-4" {...props} />
  ),
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
