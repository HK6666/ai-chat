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
    <div className="flex h-screen items-center justify-center bg-dark px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl">
        <h1 className="mb-6 bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-center text-2xl font-bold text-transparent">
          Family Chat
        </h1>

        <div className="mb-4 flex justify-center">
          <svg
            className="h-10 w-10 text-gray-500"
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

        <p className="mb-4 text-center text-sm text-gray-400">请输入访问密码</p>

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
          className="mb-3 w-full rounded-xl border border-gray-700 bg-card-light px-4 py-3 text-center text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
        />

        {error && (
          <p className="mb-3 text-center text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? '验证中...' : '进入'}
        </button>
      </div>
    </div>
  )
}
