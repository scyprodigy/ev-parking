// =============================================
// CountUp — 數字從 0 數到目標值的動畫元件
// 管理後台數據卡片用，視覺衝擊力強
// =============================================
'use client'

import { useState, useEffect, useRef } from 'react'

interface CountUpProps {
  target: number       // 目標數字
  duration?: number    // 動畫時長（ms），預設 1500
  decimals?: number    // 小數位數，預設 0
  prefix?: string      // 前綴，例如 'NT$'
  suffix?: string      // 後綴，例如 ' kWh'
  className?: string
}

export default function CountUp({
  target,
  duration = 1500,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const [current, setCurrent] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // 重置並重新開始動畫
    startTimeRef.current = null
    setCurrent(0)

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // easeOutQuart：先快後慢，更自然
      const eased = 1 - Math.pow(1 - progress, 4)
      setCurrent(eased * target)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  const formatted = current.toFixed(decimals)

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  )
}