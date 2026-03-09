// =============================================
// app/page.tsx — 車主端首頁
// Layer B：主系統層（Splash 結束後顯示）
// S: 只負責組合佈局，邏輯在各元件內
// =============================================
'use client'

import Link from 'next/link'
import { useGetParkingLots } from '@/hooks/useGetParkingLots'
import ChargingCard from '@/components/ChargingCard'
import StatsGrid from '@/components/StatsGrid'
import ParkingLotList from '@/components/ParkingLotList'
import RecentHistory from '@/components/RecentHistory'

export default function HomePage() {
  const { lots, loading } = useGetParkingLots()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        borderBottom: '1px solid var(--border)',
        padding: '14px 24px',
      }} className="glass">
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>⚡</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '0.06em',
            }}>
              EV PARK
            </span>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard" style={{
              fontSize: '0.8rem',
              color: 'var(--text-tertiary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              管理後台
            </Link>

            {/* 用戶頭像 */}
            <div style={{
              width: '34px', height: '34px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1px solid var(--border-focus)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#fff',
            }}>
              王
            </div>
          </div>
        </div>
      </header>

      {/* ── 主內容：左右分層（lg 以上）── */}
      <main
        className="page-enter"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '28px 24px 100px',
        }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .home-grid {
              display: grid !important;
              grid-template-columns: 2fr 1fr !important;
              gap: 24px !important;
              align-items: start;
            }
          }
        `}</style>

        <div className="home-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── 左欄：主視覺區 ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 充電狀態大卡 */}
            <ChargingCard />

            {/* 停車場列表 */}
            <ParkingLotList lots={lots} loading={loading} />
          </div>

          {/* ── 右欄：次要資訊 ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 統計概覽 */}
            <StatsGrid />

            {/* 最近紀錄 */}
            <RecentHistory />
          </div>

        </div>
      </main>
    </div>
  )
}
