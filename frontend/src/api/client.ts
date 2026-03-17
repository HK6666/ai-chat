import type { Conversation, Message } from '../types'

const BASE = '/api'

export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${BASE}/conversations`)
  if (!res.ok) throw new Error('Failed to fetch conversations')
  return res.json()
}

export async function createConversation(title?: string): Promise<Conversation> {
  const res = await fetch(`${BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('Failed to create conversation')
  return res.json()
}

export async function getConversation(
  id: number
): Promise<Conversation & { messages: Message[] }> {
  const res = await fetch(`${BASE}/conversations/${id}`)
  if (!res.ok) throw new Error('Failed to fetch conversation')
  return res.json()
}

export async function renameConversation(id: number, title: string): Promise<void> {
  await fetch(`${BASE}/conversations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
}

export async function deleteConversation(id: number): Promise<void> {
  await fetch(`${BASE}/conversations/${id}`, { method: 'DELETE' })
}

export async function checkAuth(): Promise<{ required: boolean; model?: string }> {
  const res = await fetch(`${BASE}/auth/check`)
  return res.json()
}

export async function verifyPassword(password: string): Promise<{ valid: boolean }> {
  const res = await fetch(`${BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  return res.json()
}
