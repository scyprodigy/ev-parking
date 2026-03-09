'use client'

// =============================================
// SplashScreen — 全屏入場動畫
// Layer A：speed.jpg 停留 5s → 向上滑出
// 每次重整都執行
// =============================================

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // 5s 後觸發向上滑出動畫（0.75s）
    const t1 = setTimeout(() => setExiting(true), 5000)
    // 動畫結束後卸載元件
    const t2 = setTimeout(() => setVisible(false), 6200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div
      className={exiting ? 'splash-exit' : ''}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        background: '#0e1520',
      }}
    >
      {/* 背景圖：頂視角 Kia EV，斜光條紋 */}
      <div className="splash-bg" style={{ position: 'absolute', inset: 0 }}>
        <Image
          src="/speed.jpg"
          alt=""
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
        />
        {/* 漸層遮罩：讓底部融入深色背景 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(14,21,32,0.1) 0%, rgba(14,21,32,0.5) 55%, rgba(14,21,32,0.97) 100%)',
        }} />
      </div>

      {/* 文字區塊 */}
      <div className="splash-text" style={{
        position: 'absolute',
        bottom: '12%',
        left: 0, right: 0,
        textAlign: 'center',
        padding: '0 24px',
      }}>
        {/* Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '28px', lineHeight: 1 }}>⚡</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            fontWeight: 800,
            color: '#f0f4ff',
            letterSpacing: '0.12em',
          }}>
            EV PARK
          </span>
        </div>

        {/* 副標 */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.6rem, 2vw, 0.75rem)',
          color: 'rgba(0, 212, 255, 0.75)',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          Smart Charging · 智慧電動車停車場
        </p>

        {/* 細線裝飾 */}
        <div style={{
          width: '48px', height: '1px',
          background: 'var(--accent)',
          margin: '16px auto 0',
          boxShadow: '0 0 12px var(--accent)',
        }} />
      </div>
    </div>
  )
}
