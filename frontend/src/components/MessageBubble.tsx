import type { Message } from '../types'
import MarkdownRenderer from './MarkdownRenderer'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export default function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 animate-fade-in">
        <div className="max-w-[75%]">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-tr-md px-4 py-3">
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-semibold mt-1">
          你
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mt-1">
        AI
      </div>
      <div className="max-w-[85%] text-gray-200">
        <MarkdownRenderer content={message.content} />
        {isStreaming && message.content && (
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse ml-1 align-middle" />
        )}
      </div>
    </div>
  )
}
