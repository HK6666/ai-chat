import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import { presets } from '../data/presets'
import type { Preset } from '../data/presets'
import MessageBubble from './MessageBubble'
import InputBar from './InputBar'

interface ChatAreaProps {
  messages: Message[]
  isStreaming: boolean
  onSend: (msg: string) => void
  onStop?: () => void
  modelName?: string
  activePreset: Preset | null
  onSelectPreset: (preset: Preset) => void
}

export default function ChatArea({ messages, isStreaming, onSend, onStop, modelName, activePreset, onSelectPreset }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, messages.length > 0 ? messages[messages.length - 1]?.content : ''])

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full bg-page">
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              你好！
            </h1>
            <p className="text-text-secondary text-base mb-8">
              {activePreset && activePreset.id !== 'default'
                ? `当前角色：${activePreset.emoji} ${activePreset.name}`
                : '选择一个角色，或直接开始对话'}
            </p>

            {/* Preset role cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl w-full mb-6">
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPreset(p)}
                  className={`rounded-xl p-3 border transition-all cursor-pointer text-left ${
                    activePreset?.id === p.id
                      ? 'bg-primary-light border-primary/40 shadow-sm'
                      : 'bg-white border-border hover:border-primary/30 hover:shadow-sm'
                  }`}
                >
                  <div className="text-xl mb-1">{p.emoji}</div>
                  <div className="text-xs font-medium text-text-primary leading-tight">{p.name}</div>
                  <div className="text-[10px] text-text-tertiary mt-0.5 leading-tight">{p.desc}</div>
                </button>
              ))}
            </div>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2 max-w-2xl justify-center">
              {['帮我写一封邮件', '解释量子计算', '今晚吃什么', '讲个故事'].map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => onSend(text)}
                  className="bg-white rounded-full px-4 py-2 border border-border text-sm text-text-secondary hover:border-primary/30 hover:text-primary transition-all cursor-pointer"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
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
        modelName={modelName}
      />
    </div>
  )
}
