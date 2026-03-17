import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="text-2xl font-bold text-gray-100 mt-6 mb-3" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-xl font-semibold text-gray-100 mt-5 mb-2" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-semibold text-gray-100 mt-4 mb-2" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-base font-semibold text-gray-100 mt-3 mb-1" {...props}>{children}</h4>
  ),
  p: ({ children, ...props }) => (
    <p className="text-gray-200 leading-relaxed mb-3 last:mb-0" {...props}>{children}</p>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
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
      <code className="bg-card-light px-1.5 py-0.5 rounded text-accent text-sm" {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => (
    <pre
      className="bg-[#0d1117] rounded-lg p-4 overflow-x-auto mb-3 text-sm"
      {...props}
    >
      {children}
    </pre>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside space-y-1 mb-3 text-gray-200 ml-1" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-200 ml-1" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-gray-200 leading-relaxed" {...props}>{children}</li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-indigo-500 bg-card/50 pl-4 py-2 my-3 rounded-r-lg"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-3">
      <table className="w-full border-collapse" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="border-b border-gray-700" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }) => (
    <th className="text-left text-gray-100 font-semibold px-3 py-2" {...props}>{children}</th>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-b border-gray-700/50 even:bg-card-light/30" {...props}>{children}</tr>
  ),
  td: ({ children, ...props }) => (
    <td className="text-gray-200 px-3 py-2" {...props}>{children}</td>
  ),
  hr: (props) => (
    <hr className="border-gray-700 my-4" {...props} />
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
