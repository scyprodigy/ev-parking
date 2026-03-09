// =============================================
// AgentChat — AI 對話框
// 含快捷問題 chip，支援深色/淺色模式
// =============================================
'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AgentChatProps {
  lotId?: string
  darkMode?: boolean
}

// 快捷問題 chip（引導用戶知道能問什麼）
const QUICK_QUESTIONS = [
  '現在有空位嗎？',
  '充電樁狀態如何？',
  '今日用電量？',
  '哪個車位最省錢？',
]

export default function AgentChat({ lotId, darkMode = false }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '您好！我是停車場 AI 助理，您可以問我車位狀態、充電資訊或費用估算。',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自動滾到最新訊息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage = { role: 'user' as const, content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, lotId }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message ?? data.error ?? '無法取得回應' },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '連線異常，請稍後再試。' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const bg = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
  const msgBg = darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'
  const inputBg = darkMode
    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
    : 'bg-gray-50 border-gray-200 text-gray-900'

  return (
    <>
      {/* 浮動按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center text-2xl z-40 hover:bg-blue-700 transition-all hover:scale-110"
        style={{ boxShadow: '0 0 24px rgba(59,130,246,0.5)' }}
      >
        {isOpen ? '×' : '🤖'}
      </button>

      {/* 對話框 */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 w-80 h-96 rounded-2xl border shadow-2xl flex flex-col z-40 ${bg}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              AI 助理
            </span>
            <span className="text-xs text-gray-500 ml-auto">RAG 即時資料</span>
          </div>

          {/* 訊息列表 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : msgBg
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {/* 載入中動畫 */}
            {loading && (
              <div className="flex justify-start">
                <div className={`rounded-xl px-4 py-2 text-sm ${msgBg}`}>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 快捷問題 chip */}
          <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full border border-blue-500 text-blue-400 hover:bg-blue-900/30 transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          {/* 輸入框 */}
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="輸入問題..."
              className={`flex-1 text-sm px-3 py-2 rounded-xl border outline-none focus:border-blue-500 ${inputBg}`}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  )
}