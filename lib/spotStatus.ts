// ─── 車位狀態設定 ─────────────────────────────
// 集中管理顏色、背景、文字，改色只改這裡

import { SpotStatus } from '@/types'

/** 各狀態對應的顯示設定 */
export const SPOT_STATUS_CONFIG: Record<
  SpotStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  available:   { label: '空閒',   color: '#4ade80', bg: 'rgba(74,222,128,0.07)',  border: 'rgba(74,222,128,0.22)'  },
  charging:    { label: '充電中', color: '#22d3ee', bg: 'rgba(34,211,238,0.09)',  border: 'rgba(34,211,238,0.32)'  },
  occupied:    { label: '使用中', color: '#fb923c', bg: 'rgba(251,146,60,0.07)',  border: 'rgba(251,146,60,0.22)'  },
  maintenance: { label: '維修中', color: '#f87171', bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.2)'  },
}

/** 拖拉面板上的標籤清單 */
export const DRAG_BADGES: { status: SpotStatus; label: string }[] = [
  { status: 'available',   label: '空閒'   },
  { status: 'charging',    label: '充電中' },
  { status: 'occupied',    label: '使用中' },
  { status: 'maintenance', label: '維修'   },
]
