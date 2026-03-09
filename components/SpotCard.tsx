// ─── 車位格子 ─────────────────────────────────
// 用途：地圖上每個車位的卡片，支援 drag-over 視覺反饋

import { useState } from 'react'
import { ParkingSpot, SpotStatus } from '@/types'
import { SPOT_STATUS_CONFIG } from '@/lib/spotStatus'

interface SpotCardProps {
  spot: ParkingSpot
  /** 拖拉放下後的回呼：(spotId, newStatus) */
  onDrop: (id: string, s: SpotStatus) => void
}

export default function SpotCard({ spot, onDrop }: SpotCardProps) {
  const [over, setOver] = useState(false)
  const cfg = SPOT_STATUS_CONFIG[spot.status]

  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault()
        setOver(false)
        const s = e.dataTransfer.getData('newStatus') as SpotStatus
        if (s) onDrop(spot.id, s)
      }}
      className="relative rounded-xl p-2.5 transition-all duration-200"
      style={{
        background: over ? 'rgba(34,211,238,0.14)' : cfg.bg,
        border: `1px solid ${over ? '#22d3ee' : cfg.border}`,
        // 充電中加光暈
        boxShadow: spot.status === 'charging'
          ? '0 0 14px rgba(34,211,238,0.2), inset 0 0 10px rgba(34,211,238,0.05)'
          : 'none',
      }}
    >
      {/* 車位號碼：primary */}
      <p className="text-white text-xs font-bold">{spot.spot_number}</p>

      {/* 狀態文字：accent color */}
      <p className="text-xs mt-1 font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>

      {/* 功率：secondary 0.55，輔助資訊 */}
      {spot.charger_power && (
        <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {spot.charger_power}
        </p>
      )}

      {/* 充電中閃電icon */}
      {spot.status === 'charging' && (
        <span className="absolute top-1.5 right-1.5 text-xs charging-dot" style={{ color: '#22d3ee' }}>
          ⚡
        </span>
      )}

      {/* 拖拉 hover 覆蓋層 */}
      {over && (
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(34,211,238,0.08)' }}
        >
          <span className="text-sm font-bold" style={{ color: '#22d3ee' }}>↓</span>
        </div>
      )}
    </div>
  )
}
