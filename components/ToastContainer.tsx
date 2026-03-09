// =============================================
// ToastContainer — 右上角彈出告警，5 秒自動消失
// 管理後台 Agent 偵測到異常就推進來
// =============================================
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Alert } from '@/types'

interface ToastContainerProps {
  alerts: Alert[]
  onDismiss: (id: string) => void
}

// 嚴重程度對應樣式
const severityStyle = {
  low: {
    bg: 'bg-yellow-900/80',
    border: 'border-yellow-500',
    icon: '⚠️',
    text: 'text-yellow-200',
    bar: 'bg-yellow-500',
  },
  medium: {
    bg: 'bg-orange-900/80',
    border: 'border-orange-500',
    icon: '🔔',
    text: 'text-orange-200',
    bar: 'bg-orange-500',
  },
  high: {
    bg: 'bg-red-900/80',
    border: 'border-red-500',
    icon: '🚨',
    text: 'text-red-200',
    bar: 'bg-red-500',
  },
}

// 單一 Toast 元件
function Toast({ alert, onDismiss }: { alert: Alert; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)
  const style = severityStyle[alert.severity]

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onDismiss(alert.id), 300)
  }, [alert.id, onDismiss])

  // 5 秒後自動消失
  useEffect(() => {
    const timer = setTimeout(dismiss, 5000)
    return () => clearTimeout(timer)
  }, [dismiss])

  return (
    <div
      className={`
        ${style.bg} ${style.border} border rounded-lg p-4
        backdrop-blur-sm shadow-2xl max-w-sm w-full
        ${exiting ? 'toast-exit' : 'toast-enter'}
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${style.text}`}>
            車位 {alert.spot_number} —{' '}
            {alert.type === 'overstay' ? '超時未離場' :
             alert.type === 'charger_error' ? '充電樁異常' :
             alert.type === 'spot_conflict' ? '車位衝突' : '付款失敗'}
          </p>
          <p className="text-gray-400 text-xs mt-1 truncate">{alert.message}</p>
        </div>
        <button
          onClick={dismiss}
          className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* 進度條：顯示剩餘顯示時間 */}
      <div className="mt-3 h-0.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${style.bar} rounded-full`}
          style={{ animation: 'shrink-width 5s linear forwards', width: '100%' }}
        />
      </div>
    </div>
  )
}

// 容器：固定在右上角，最多顯示 3 筆
export default function ToastContainer({ alerts, onDismiss }: ToastContainerProps) {
  const visible = alerts.slice(-3)
  if (visible.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {visible.map(alert => (
        <div key={alert.id} className="pointer-events-auto">
          <Toast alert={alert} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}