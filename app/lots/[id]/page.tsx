'use client'

// =============================================
// lots/[id]/page.tsx — 停車場地圖頁
// 佈局：左 60% IsoParking 地圖 | 右 40% 資訊面板
// Mobile：垂直堆疊
// SOLID：SpotCard / StatsPanel 各自獨立元件
// =============================================

import { useParams, useRouter } from 'next/navigation'
import { useGetParkingSpots } from '@/hooks/useGetParkingSpots'
import { useGetParkingLots } from '@/hooks/useGetParkingLots'
import { ParkingSpot } from '@/types'
import AgentChat from '@/components/AgentChat'
import IsoParking from '@/components/IsoParking'

// ─── 狀態設定 Token ─────────────────────────────
const STATUS_CONFIG = {
  available:   { dot: '#22c55e', label: '空閒',   ring: 'rgba(34,197,94,0.18)'   },
  charging:    { dot: '#00d4ff', label: '充電中', ring: 'rgba(0,212,255,0.18)'   },
  occupied:    { dot: '#f97316', label: '使用中', ring: 'rgba(249,115,22,0.18)'  },
  maintenance: { dot: '#ef4444', label: '維修中', ring: 'rgba(239,68,68,0.18)'   },
} as const

type SpotStatus = keyof typeof STATUS_CONFIG

// ─── 子元件：單一車位卡片 ──────────────────────
// S: 只負責顯示一個車位的狀態
function SpotCard({ spot, onClick }: { spot: ParkingSpot; onClick: () => void }) {
  const cfg = STATUS_CONFIG[spot.status as SpotStatus] ?? STATUS_CONFIG.maintenance
  const isAvailable = spot.status === 'available'
  const isCharging  = spot.status === 'charging'

  return (
    <button
      onClick={isAvailable ? onClick : undefined}
      disabled={!isAvailable}
      className="spot-card surface text-left"
      style={{
        padding: '10px 12px',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        opacity: isAvailable ? 1 : 0.72,
        background: isAvailable ? 'var(--bg-surface)' : 'var(--bg-base)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 充電中：底部 cyan glow 條 */}
      {isCharging && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '2px',
          background: 'var(--accent)',
          boxShadow: '0 0 8px var(--accent)',
        }} />
      )}

      {/* 車位編號 */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        color: 'var(--text-secondary)',
        marginBottom: '4px',
      }}>
        {spot.spot_number}
      </p>

      {/* 狀態點 + 文字 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: cfg.dot,
            boxShadow: isCharging ? `0 0 6px ${cfg.dot}` : 'none',
            flexShrink: 0,
          }}
          className={isCharging ? 'charging-dot' : ''}
        />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {cfg.label}
        </span>
        {isCharging && (
          <span style={{
            fontSize: '0.62rem', color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
            marginLeft: 'auto',
            animation: 'charge-pulse 1.5s ease-in-out infinite',
          }}>⚡</span>
        )}
      </div>

      {/* 充電功率 */}
      {spot.charger_power && (
        <p style={{
          fontSize: '0.65rem',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
          marginTop: '4px',
        }}>
          {spot.charger_power}
        </p>
      )}
    </button>
  )
}

// ─── 子元件：統計面板 ─────────────────────────
// S: 只負責顯示四格統計數字
function StatsPanel({ spots }: { spots: ParkingSpot[] }) {
  const stats = [
    { key: 'available',   label: '空閒',   color: STATUS_CONFIG.available.dot,   ring: STATUS_CONFIG.available.ring   },
    { key: 'charging',    label: '充電中', color: STATUS_CONFIG.charging.dot,    ring: STATUS_CONFIG.charging.ring    },
    { key: 'occupied',    label: '使用中', color: STATUS_CONFIG.occupied.dot,    ring: STATUS_CONFIG.occupied.ring    },
    { key: 'maintenance', label: '維修中', color: STATUS_CONFIG.maintenance.dot, ring: STATUS_CONFIG.maintenance.ring },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
    }}>
      {stats.map(s => {
        const count = spots.filter(sp => sp.status === s.key).length
        return (
          <div key={s.key} className="surface" style={{
            padding: '12px 8px',
            textAlign: 'center',
            background: count > 0 ? s.ring : 'var(--bg-surface)',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: s.color,
              lineHeight: 1,
              marginBottom: '4px',
            }}>
              {count}
            </p>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
              {s.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ─── 子元件：Skeleton loader ──────────────────
function SpotSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          height: '64px',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-raised)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}

// ─── 主頁面 ────────────────────────────────────
export default function LotPage() {
  const params = useParams()
  const router = useRouter()
  const lotId = params.id as string

  const { lots } = useGetParkingLots()
  const { spots, loading } = useGetParkingSpots(lotId)
  const lot = lots.find(l => l.id === lotId)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        borderBottom: '1px solid var(--border)',
        padding: '14px 24px',
      }} className="glass">
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          {/* 返回按鈕 */}
          <button
            onClick={() => router.back()}
            style={{
              width: '32px', height: '32px',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg-raised)',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-focus)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
          >
            ←
          </button>

          {/* 停車場名稱 */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem', fontWeight: 700,
              color: 'var(--text-primary)', margin: 0,
            }}>
              {lot?.name ?? '載入中...'}
            </h1>
            {lot?.address && (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', margin: 0, marginTop: '2px' }}>
                {lot.address}
              </p>
            )}
          </div>

          {/* 即時標籤 */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 6px var(--accent)',
              display: 'inline-block',
              animation: 'charge-pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
            }}>
              LIVE
            </span>
          </div>
        </div>
      </header>

      {/* ── 主內容：左右分層 ── */}
      <main
        className="page-enter"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '24px 24px 100px',
          display: 'grid',
          // Desktop: 左 60% 地圖 | 右 40% 面板
          // Mobile: 單欄
          gridTemplateColumns: '1fr',
          gap: '20px',
        }}
      >
        {/* CSS Grid RWD：lg 以上切換為左右兩欄 */}
        <style>{`
          @media (min-width: 1024px) {
            .lot-grid { grid-template-columns: 3fr 2fr !important; align-items: start; }
          }
        `}</style>

        <div className="lot-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          alignItems: 'start',
        }}>

          {/* ── 左欄：等角地圖（主視覺）── */}
          <div style={{
            borderRadius: 'var(--r-xl)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
          }}>
            {!loading && spots.length > 0 ? (
              <IsoParking spots={spots} lotId={lotId} />
            ) : (
              // 地圖載入佔位
              <div style={{
                height: '420px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
              }}>
                LOADING MAP...
              </div>
            )}
          </div>

          {/* ── 右欄：資訊面板（次要）── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* 統計數字 */}
            <StatsPanel spots={spots} />

            {/* 分隔標題 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '0 2px',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>
                車位列表
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--text-tertiary)',
              }}>
                {spots.length} 位
              </span>
            </div>

            {/* 車位 grid */}
            {loading ? (
              <SpotSkeleton />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
              }}>
                {spots.map(spot => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    onClick={() => router.push(`/reserve/${spot.id}?lotId=${lotId}`)}
                  />
                ))}
              </div>
            )}

            {/* 圖例 */}
            <div className="surface" style={{ padding: '12px 16px' }}>
              <p style={{
                fontSize: '0.65rem',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.15em',
                marginBottom: '10px',
              }}>
                圖例 LEGEND
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: cfg.dot, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {cfg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* AI Agent — 知道當前停車場 */}
      <AgentChat lotId={lotId} />
    </div>
  )
}
