// ─── 拖拉狀態標籤 ─────────────────────────────
// 用途：拖到車位格子上可更新狀態

import { SpotStatus } from '@/types'
import { SPOT_STATUS_CONFIG } from '@/lib/spotStatus'

interface DragBadgeProps {
  status: SpotStatus
  label: string
}

export default function DragBadge({ status, label }: DragBadgeProps) {
  const cfg = SPOT_STATUS_CONFIG[status]

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('newStatus', status)
        e.dataTransfer.effectAllowed = 'move'
      }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing select-none transition-all hover:brightness-125"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {/* 狀態燈 */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }}
      />
      {/* 標籤文字：互動元素用 accent color */}
      <span className="text-sm font-semibold" style={{ color: cfg.color }}>{label}</span>
    </div>
  )
}
