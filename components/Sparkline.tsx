// ─── 迷你折線圖（Sparkline）──────────────────
// 用途：統計卡右下角裝飾性趨勢線

interface SparklineProps {
  data: number[]
  color: string
}

export default function Sparkline({ data, color }: SparklineProps) {
  const w = 80
  const h = 28
  const max = Math.max(...data, 1)

  // 將資料點轉成 SVG 座標字串
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 2) - 1}`)
    .join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  )
}
