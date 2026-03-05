'use client'

import { useState } from 'react'
import type { ChatMessage } from '@/types'

// 接收停車場即時資料，讓 Agent 回答有根據
interface AgentChatProps {
  context?: string
}

export function AgentChat({ context }: AgentChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim() || loading) return

    // 把用戶訊息加進對話紀錄
    const userMessage: ChatMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      // 呼叫我們的 API route，把完整對話紀錄和即時資料一起送過去
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          context, // 即時車位資料，讓 AI 回答有根據
        }),
      })

      const data = await res.json()

      // 把 AI 回覆加進對話紀錄
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply ?? data.error }
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '抱歉，連線發生問題，請稍後再試。' }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Enter 鍵送出
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* 右下角浮動按鈕，所有頁面都看得到 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition text-2xl z-50"
      >
        {isOpen ? '✕' : '⚡'}
      </button>

      {/* 對話框 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border z-50 flex flex-col overflow-hidden">
          {/* 標題列 */}
          <div className="bg-green-500 text-white px-4 py-3">
            <p className="font-semibold text-sm">停車小幫手</p>
            <p className="text-xs opacity-80">AI 智能助理</p>
          </div>

          {/* 對話訊息區 */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-72">
            {/* 預設歡迎訊息 */}
            {messages.length === 0 && (
              <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-600 self-start">
                你好！我是停車小幫手，可以幫你查詢車位或充電樁資訊 ⚡
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 text-sm max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-green-500 text-white self-end'      // 用戶訊息靠右
                    : 'bg-gray-100 text-gray-800 self-start'  // AI 回覆靠左
                }`}
              >
                {msg.content}
              </div>
            ))}

            {/* 載入中動畫 */}
            {loading && (
              <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-400 self-start">
                思考中...
              </div>
            )}
          </div>

          {/* 輸入區 */}
          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="問我任何停車問題..."
              className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
            >
              送出
            </button>
          </div>
        </div>
      )}
    </>
  )
}