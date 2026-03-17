import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import MessageBubble from './MessageBubble'
import InputBar from './InputBar'

interface ChatAreaProps {
  messages: Message[]
  isStreaming: boolean
  onSend: (msg: string) => void
  onStop?: () => void
}

const suggestions = [
  '帮我写一封邮件',
  '解释量子计算',
  '今晚吃什么？',
  '讲个故事',
]

export default function ChatArea({ messages, isStreaming, onSend, onStop }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, messages.length > 0 ? messages[messages.length - 1]?.content : ''])

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent mb-3">
              Family Chat
            </h1>
            <p className="text-gray-400 text-lg mb-8">有什么我可以帮你的？</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-lg">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSend(s)}
                  className="rounded-xl bg-card-light border border-gray-700/50 hover:border-indigo-500/30 text-gray-300 hover:text-gray-100 px-4 py-2.5 text-sm transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id ?? idx}
                message={msg}
                isStreaming={
                  isStreaming &&
                  msg.role === 'assistant' &&
                  idx === messages.length - 1
                }
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <InputBar
        onSend={onSend}
        disabled={isStreaming}
        isStreaming={isStreaming}
        onStop={onStop}
      />
    </div>
  )
}
