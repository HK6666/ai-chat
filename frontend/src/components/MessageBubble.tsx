import { useState } from 'react'
import type { Message } from '../types'
import MarkdownRenderer from './MarkdownRenderer'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

function ThinkingBlock({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const isThinking = isStreaming && !content

  return (
    <div className="mb-3 animate-fade-in">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
      >
        {/* Brain icon */}
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
        {isThinking ? (
          <span className="flex items-center gap-1">
            思考中
            <span className="inline-flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-text-tertiary animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-text-tertiary animate-pulse" style={{ animationDelay: '200ms' }} />
              <span className="w-1 h-1 rounded-full bg-text-tertiary animate-pulse" style={{ animationDelay: '400ms' }} />
            </span>
          </span>
        ) : (
          <span>已深度思考</span>
        )}
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && content && (
        <div className="mt-2 pl-5 border-l-2 border-border text-text-tertiary text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  )
}

export default function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 animate-fade-in">
        <div className="max-w-[70%]">
          <div className="bg-primary text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
            <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
          </div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-semibold mt-1">
          你
        </div>
      </div>
    )
  }

  const hasThinking = !!(message.thinking || (isStreaming && !message.content))

  return (
    <div className="flex justify-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold mt-1">
        AI
      </div>
      <div className="max-w-[80%] text-text-primary">
        {hasThinking && (
          <ThinkingBlock
            content={message.thinking || ''}
            isStreaming={isStreaming && !message.content}
          />
        )}
        {message.content ? (
          <MarkdownRenderer content={message.content} />
        ) : null}
        {isStreaming && message.content && (
          <span className="inline-flex items-center gap-1 ml-1 align-middle">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>
    </div>
  )
}
