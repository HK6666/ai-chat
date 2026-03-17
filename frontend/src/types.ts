export interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id?: number
  conversation_id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
  thinking?: string
  created_at?: string
}
