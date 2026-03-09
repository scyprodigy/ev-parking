// =============================================
// app/layout.tsx — 全域 Layout
// 字型用 <link> 引入（避免 Tailwind v4 @import 衝突）
// SplashScreen Layer A 掛在最頂層
// =============================================
import type { Metadata } from 'next'
import './globals.css'
import SplashScreen from '@/components/layout/SplashScreen'

export const metadata: Metadata = {
  title: 'EV Park — 智慧電動車停車場',
  description: '電動車停車場即時監控、預約、充電管理平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        {/* Google Fonts：Syne（標題）+ DM Sans（內文）+ JetBrains Mono（數字/代碼）*/}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>
        {/* Layer A：入場動畫（首次進入才顯示，sessionStorage 控制）*/}
        <SplashScreen />
        {/* Layer B / C：主系統 */}
        {children}
      </body>
    </html>
  )
}
