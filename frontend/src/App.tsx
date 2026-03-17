import { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import PasswordGate from './components/PasswordGate'
import {
  getConversations,
  getConversation,
  deleteConversation,
  renameConversation,
  checkAuth,
} from './api/client'
import { streamChat } from './api/chat'
import type { Conversation, Message } from './types'
import type { Preset } from './data/presets'

export default function App() {
  // Auth state
  const [needAuth, setNeedAuth] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // App state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modelName, setModelName] = useState('')
  const [activePreset, setActivePreset] = useState<Preset | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Check auth on mount
  useEffect(() => {
    checkAuth()
      .then(({ required, model }) => {
        if (model) setModelName(model)
        if (!required || localStorage.getItem('chat_auth') === 'true') {
          setAuthed(true)
        } else {
          setNeedAuth(true)
        }
        setAuthChecked(true)
      })
      .catch(() => setAuthChecked(true))
  }, [])

  // Load conversations when authed
  useEffect(() => {
    if (authed) loadConversations()
  }, [authed])

  const loadConversations = async () => {
    try {
      const convs = await getConversations()
      setConversations(convs)
    } catch {
      // silently ignore
    }
  }

  // Select conversation -> load messages
  const handleSelect = async (id: number) => {
    setActiveId(id)
    setActivePreset(null)
    setSidebarOpen(false)
    try {
      const data = await getConversation(id)
      setMessages(data.messages || [])
    } catch {
      // silently ignore
    }
  }

  // New conversation
  const handleNew = () => {
    setActiveId(null)
    setMessages([])
    setActivePreset(null)
    setSidebarOpen(false)
  }

  // Delete conversation
  const handleDelete = async (id: number) => {
    await deleteConversation(id)
    if (activeId === id) {
      setActiveId(null)
      setMessages([])
    }
    loadConversations()
  }

  // Rename conversation
  const handleRename = async (id: number, title: string) => {
    await renameConversation(id, title)
    loadConversations()
  }

  // Send message — pass system_prompt on first message of new conversation
  const handleSend = (content: string) => {
    if (isStreaming) return

    const userMsg: Message = { role: 'user', content }
    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    // Only send system_prompt when creating a new conversation (no activeId)
    const systemPrompt = !activeId && activePreset?.prompt ? activePreset.prompt : undefined

    const controller = streamChat(content, activeId, {
      systemPrompt,
      onThinking: (token) => {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              thinking: (last.thinking || '') + token,
            }
          }
          return updated
        })
      },
      onToken: (token) => {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + token,
            }
          }
          return updated
        })
      },
      onDone: async (data) => {
        setIsStreaming(false)
        if (data.conversation_id) {
          setActiveId(data.conversation_id)
          await loadConversations()
        }
      },
      onError: (error) => {
        setIsStreaming(false)
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: `错误: ${error}`,
            }
          }
          return updated
        })
      },
    })
    abortRef.current = controller
  }

  // Stop streaming
  const handleStop = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  // Auth gate
  if (!authChecked) return null
  if (needAuth && !authed) {
    return (
      <PasswordGate
        onVerified={() => {
          setAuthed(true)
          setNeedAuth(false)
        }}
      />
    )
  }

  return (
    <div className="h-screen bg-page text-text-primary flex overflow-hidden">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 p-2 rounded-xl bg-white border border-border text-text-secondary hover:text-text-primary shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        onRename={handleRename}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          onSend={handleSend}
          onStop={handleStop}
          modelName={modelName}
          activePreset={activePreset}
          onSelectPreset={setActivePreset}
        />
      </main>
    </div>
  )
}
