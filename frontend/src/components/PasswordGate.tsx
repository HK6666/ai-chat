import { useState } from 'react'
import { verifyPassword } from '../api/client'

interface PasswordGateProps {
  onVerified: () => void
}

export default function PasswordGate({ onVerified }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!password.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const { valid } = await verifyPassword(password)
      if (valid) {
        localStorage.setItem('chat_auth', 'true')
        onVerified()
      } else {
        setError('密码错误')
      }
    } catch {
      setError('验证失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-10 shadow-lg border border-border/50">
        <h1 className="mb-6 text-center text-2xl font-bold text-text-primary">
          AI{' '}
          <span className="bg-gradient-to-r from-primary to-[#6366f1] bg-clip-text text-transparent">
            Chat
          </span>
        </h1>

        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <svg
              className="h-8 w-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <p className="mb-4 text-center text-sm text-text-secondary">请输入访问密码</p>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="密码"
          className="mb-3 w-full rounded-xl border border-border bg-page px-4 py-3 text-center text-text-primary placeholder-text-placeholder outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        {error && (
          <p className="mb-3 text-center text-sm text-danger">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? '验证中...' : '进入'}
        </button>

        <p className="mt-6 text-center text-xs text-text-tertiary">
          仅限家庭成员访问
        </p>
      </div>
    </div>
  )
}
