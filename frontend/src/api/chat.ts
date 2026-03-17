interface ChatStreamCallbacks {
  onToken: (token: string) => void
  onDone: (data: { conversation_id: number }) => void
  onError: (error: string) => void
}

export function streamChat(
  message: string,
  conversationId: number | null,
  callbacks: ChatStreamCallbacks
): AbortController {
  const controller = new AbortController()

  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversation_id: conversationId }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        callbacks.onError('请求失败')
        return
      }

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.token) callbacks.onToken(data.token)
            if (data.done) callbacks.onDone(data)
            if (data.error) callbacks.onError(data.error)
          } catch {
            // ignore malformed JSON lines
          }
        }
      }
    })
    .catch((err: Error) => {
      if (err.name !== 'AbortError') {
        callbacks.onError(err.message || '网络错误')
      }
    })

  return controller
}
