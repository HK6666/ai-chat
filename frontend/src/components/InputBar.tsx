import { useRef, useState, useCallback, useEffect } from 'react'

interface InputBarProps {
  onSend: (message: string) => void
  disabled?: boolean
  isStreaming?: boolean
  onStop?: () => void
  modelName?: string
}

export default function InputBar({ onSend, disabled = false, isStreaming = false, onStop, modelName }: InputBarProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const lineHeight = 24
    const maxHeight = lineHeight * 6
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [text, adjustHeight])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, disabled, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-page px-4 py-4">
      <div className="max-w-3xl mx-auto">
        {modelName && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-text-tertiary">{modelName}</span>
          </div>
        )}
        <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md focus-within:border-primary/50 transition-all px-4 py-3 flex items-end">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-text-primary placeholder-text-placeholder resize-none outline-none text-sm leading-6 max-h-36 py-0"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="flex-shrink-0 bg-danger/10 text-danger rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-danger/20 ml-2"
            >
              停止
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:bg-border disabled:text-text-placeholder transition-colors ml-2 flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
