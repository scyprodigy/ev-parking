// =============================================
// ChargingArc — 充電進度圓弧（合併版）
// 支援兩種用法：
//   1. percentage 模式（首頁）：傳 percentage，顏色自動判斷
//   2. gauge 模式（後台）：傳 value + max + color + label
// =============================================
'use client'

interface ChargingArcProps {
  // ── 模式一：百分比（首頁用）──
  percentage?: number         // 0–100，不傳則用 value/max 換算

  // ── 模式二：數值儀表（後台用）──
  value?: number
  max?: number

  // ── 共用設定 ──
  label?: string              // 中心下方文字，預設「充電中」
  color?: string              // 指定顏色；不給則根據 percentage 自動決定
  size?: number               // SVG 尺寸，預設 160
  strokeWidth?: number        // 線寬，預設 12
  darkMode?: boolean          // 深色背景用
}

export default function ChargingArc({
  percentage,
  value,
  max,
  label,
  color,
  size = 160,
  strokeWidth = 12,
  darkMode = false,
}: ChargingArcProps) {
  // 換算最終百分比：優先用 percentage，其次用 value/max
  const pct = percentage !== undefined
    ? Math.min(Math.max(percentage, 0), 100)
    : Math.min((value ?? 0) / (max || 1), 1) * 100

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.75     // 畫 270 度，底部留空
  const offset = arcLength - (arcLength * pct) / 100

  const cx = size / 2
  const cy = size / 2

  // 自動顏色（只在未指定 color 時使用）
  const autoColor = (() => {
    if (pct < 20) return '#ef4444'   // 紅：電量低
    if (pct < 50) return '#f97316'   // 橘：中等
    if (pct < 80) return '#3b82f6'   // 藍：正常充電
    return '#22c55e'                  // 綠：接近滿
  })()

  const arcColor = color ?? autoColor

  // 中心顯示的文字
  const centerText = value !== undefined
    ? String(value)               // gauge 模式：顯示數值
    : `${Math.round(pct)}%`       // 百分比模式：顯示 %

  const centerLabel = label ?? '充電中'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(135deg)' }}
      >
        {/* 底層軌道 */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* 進度弧 */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.5s ease',
            filter: `drop-shadow(0 0 8px ${arcColor})`,
          }}
        />
      </svg>

      {/* 中心數字 + label */}
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="font-bold tabular-nums"
          style={{
            fontSize: size * 0.18,
            color: color
              ? arcColor                                       // gauge 模式用 accent color
              : (darkMode ? '#e2e8f0' : '#0f172a'),           // 百分比模式用文字色
            lineHeight: 1,
          }}
        >
          {centerText}
        </span>
        <span
          className="text-xs mt-1 font-medium"
          style={{ color: darkMode ? 'rgba(255,255,255,0.75)' : '#64748b' }}
        >
          {centerLabel}
        </span>
      </div>
    </div>
  )
}
