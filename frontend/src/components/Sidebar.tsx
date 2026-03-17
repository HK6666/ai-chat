import { useState, useEffect, useRef } from 'react'
import type { Conversation } from '../types'

interface SidebarProps {
  conversations: Conversation[]
  activeId: number | null
  onSelect: (id: number) => void
  onNew: () => void
  onDelete: (id: number) => void
  onRename: (id: number, title: string) => void
  isOpen: boolean
  onClose: () => void
}

function groupByDate(convs: Conversation[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const week = new Date(today.getTime() - 7 * 86400000)

  const groups: { label: string; items: Conversation[] }[] = [
    { label: '今天', items: [] },
    { label: '昨天', items: [] },
    { label: '近7天', items: [] },
    { label: '更早', items: [] },
  ]

  for (const conv of convs) {
    const d = new Date(conv.updated_at)
    if (d >= today) groups[0].items.push(conv)
    else if (d >= yesterday) groups[1].items.push(conv)
    else if (d >= week) groups[2].items.push(conv)
    else groups[3].items.push(conv)
  }

  return groups.filter((g) => g.items.length > 0)
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isOpen,
  onClose,
}: SidebarProps) {
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  const groups = groupByDate(conversations)

  useEffect(() => {
    if (renamingId !== null) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [renamingId])

  function startRename(conv: Conversation) {
    setRenamingId(conv.id)
    setRenameValue(conv.title)
  }

  function commitRename() {
    if (renamingId !== null && renameValue.trim()) {
      onRename(renamingId, renameValue.trim())
    }
    setRenamingId(null)
    setRenameValue('')
  }

  function cancelRename() {
    setRenamingId(null)
    setRenameValue('')
  }

  function handleDelete(id: number) {
    if (window.confirm('确定要删除这个对话吗？')) {
      onDelete(id)
    }
  }

  const sidebarContent = (
    <div className="flex h-full w-[260px] flex-col border-r border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-5">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 10h.01" />
            <path d="M12 10h.01" />
            <path d="M16 10h.01" />
          </svg>
          <h1 className="text-lg font-semibold text-text-primary">
            AI Chat
          </h1>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary md:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* New conversation button */}
      <div className="px-3 py-3">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary-hover active:scale-[0.98]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          新建对话
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.label} className="mb-1">
            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
              {group.label}
            </div>
            {group.items.map((conv) => {
              const isActive = conv.id === activeId
              const isRenaming = conv.id === renamingId

              return (
                <div
                  key={conv.id}
                  className={`group relative mb-0.5 flex cursor-pointer items-center rounded-xl px-3 py-2.5 transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-light font-medium text-primary'
                      : 'text-text-primary hover:bg-surface-hover'
                  }`}
                  onClick={() => {
                    if (!isRenaming) onSelect(conv.id)
                  }}
                >
                  {isRenaming ? (
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename()
                        if (e.key === 'Escape') cancelRename()
                      }}
                      onBlur={commitRename}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full rounded-lg border border-primary bg-white px-2 py-0.5 text-sm text-text-primary outline-none ring-1 ring-primary/30 focus:ring-2 focus:ring-primary/40"
                    />
                  ) : (
                    <>
                      <span className="flex-1 truncate text-sm">
                        {conv.title}
                      </span>
                      {/* Action buttons on hover */}
                      <div className="ml-1 flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startRename(conv)
                          }}
                          className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                          title="重命名"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(conv.id)
                          }}
                          className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-red-50 hover:text-danger"
                          title="删除"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {conversations.length === 0 && (
          <div className="mt-8 flex flex-col items-center px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
              <svg
                className="h-6 w-6 text-text-tertiary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">还没有对话</p>
            <p className="mt-1 text-xs text-text-tertiary">点击上方按钮开始新对话</p>
          </div>
        )}
      </div>

      {/* Bottom divider and spacer */}
      <div className="border-t border-border-light px-4 py-3">
        <span className="text-xs text-text-placeholder">AI Chat v1.0</span>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full md:block">{sidebarContent}</aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          isOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop — lighter bg-black/30 */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        {/* Slide-in panel */}
        <div
          className={`absolute inset-y-0 left-0 transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  )
}
