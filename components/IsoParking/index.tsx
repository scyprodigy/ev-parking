'use client'

// =============================================
// IsoParking — 等角停車場即時動畫
// 接收真實 ParkingSpot[] 資料，動畫車子自動對應車位狀態
// 動態 SVG 座標必須 inline（等角換算），靜態樣式在 .module.css
// =============================================

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ParkingSpot } from '@/types'
import styles from './IsoParking.module.css'

// ─── 等角座標系統 ──────────────────────────────
const HW = 44, HH = 22          // iso tile 半寬/半高
const OX = 350, OY = 115        // 畫面原點（SVG 內部）
const CAR_H = 8                  // 車子立體高度（像素）

/** 格子 (col, row) → SVG (x, y) */
const toScreen = (col: number, row: number) => ({
  x: OX + (col - row) * HW,
  y: OY + (col + row) * HH,
})

/** iso 菱形頂點字串 */
const tilePts = (col: number, row: number) => {
  const { x, y } = toScreen(col, row)
  return `${x},${y - HH} ${x + HW},${y} ${x},${y + HH} ${x - HW},${y}`
}

/** iso 矩形四個頂點（車子 / 建物用） */
const isoCorners = (col: number, row: number, w: number, h: number) =>
  ([-w, -h], [w, -h], [w, h], [-w, h] as [number, number][]).map(([dc, dr]) => [
    OX + (col + dc - (row + dr)) * HW,
    OY + (col + dc + (row + dr)) * HH,
  ] as [number, number])

// 正確寫法（TypeScript tuple）
const isoCorners2 = (col: number, row: number, w: number, h: number): [number, number][] => {
  const offsets: [number, number][] = [[-w, -h], [w, -h], [w, h], [-w, h]]
  return offsets.map(([dc, dr]) => [
    OX + (col + dc - (row + dr)) * HW,
    OY + (col + dc + (row + dr)) * HH,
  ])
}

const pStr = (pts: [number, number][]) => pts.map(p => p.join(',')).join(' ')

// ─── 場景設定 ──────────────────────────────────
const ROAD_ROW = 3

/** 車位格子在 iso 地圖上的位置（最多10格，對應真實 spots 陣列） */
const SPOT_POSITIONS = [
  { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 },
  { col: 4, row: 2 }, { col: 5, row: 2 },
  { col: 1, row: 4 }, { col: 2, row: 4 }, { col: 3, row: 4 },
  { col: 4, row: 4 }, { col: 5, row: 4 },
]

/** 背景建築物（純裝飾） */
const BLDG_DATA = [
  { col: 0, h: 52, c: '#0d1f35' }, { col: 1, h: 78, c: '#091a2e' },
  { col: 2, h: 42, c: '#0e2038' }, { col: 3, h: 88, c: '#071525' },
  { col: 4, h: 58, c: '#0d1f35' }, { col: 5, h: 34, c: '#111a2e' },
]

const CAR_COLORS = ['#22d3ee', '#a78bfa', '#4ade80', '#fb923c', '#f472b6', '#fbbf24']

// ─── 動畫車輛型別 ──────────────────────────────
interface AnimCar {
  id: number
  spotIdx: number   // 對應 SPOT_POSITIONS 的 index
  color: string
  phase: number     // 0進場 1入位 2充電 3出位 4離場
  t: number         // 0–1 插值進度
  speed: number
}

let uid = 0

// ─── 子元件：建築物 ────────────────────────────
function Building({ col, h, c }: { col: number; h: number; c: string }) {
  const bw = 0.42, bh = 0.42
  const base = isoCorners2(col, 0, bw, bh)
  const top = base.map(([x, y]) => [x, y - h] as [number, number])
  const rightFace: [number, number][] = [base[1], base[2], top[2], top[1]]
  const leftFace: [number, number][]  = [base[3], base[2], top[2], top[3]]
  const { x: bx, y: by } = toScreen(col, 0)
  const windowRows = h > 60 ? [0.28, 0.52, 0.74] : [0.35, 0.65]

  return (
    <g>
      <polygon points={pStr(rightFace)} fill={c} opacity={0.65} />
      <polygon points={pStr(leftFace)}  fill={c} opacity={0.82} />
      <polygon points={pStr(top)}       fill={c} />
      {windowRows.map((fy, i) => (
        <rect key={i} x={bx - 6} y={by - h * fy - 3} width={12} height={4} rx={1}
          fill={`rgba(255,240,${140 + i * 20},0.28)`} />
      ))}
      {h > 65 && (
        <line x1={bx} y1={by - h} x2={bx} y2={by - h - 12}
          stroke="rgba(34,211,238,0.4)" strokeWidth={1.5} />
      )}
    </g>
  )
}

// ─── 子元件：車子 ──────────────────────────────
function CarShape({ col, row, color, glowing }: {
  col: number; row: number; color: string; glowing: boolean
}) {
  const cw = 0.37, ch = 0.21
  const top = isoCorners2(col, row, cw, ch)
  const rightFace: [number, number][] = [top[1], top[2], [top[2][0], top[2][1] + CAR_H], [top[1][0], top[1][1] + CAR_H]]
  const leftFace: [number, number][]  = [top[3], top[2], [top[2][0], top[2][1] + CAR_H], [top[3][0], top[3][1] + CAR_H]]
  const ws = isoCorners2(col + 0.08, row, cw * 0.45, ch * 0.65)

  return (
    <g style={glowing ? { filter: `drop-shadow(0 0 10px ${color})` } : undefined}>
      <polygon points={pStr(rightFace)} fill={color} opacity={0.5} />
      <polygon points={pStr(leftFace)}  fill={color} opacity={0.38} />
      <polygon points={pStr(top)}       fill={color} />
      <polygon points={pStr(ws)}        fill="rgba(200,240,255,0.32)" />
    </g>
  )
}

// ─── 主元件 ────────────────────────────────────
interface IsoParkingProps {
  spots: ParkingSpot[]
  lotId: string
}

export default function IsoParking({ spots, lotId }: IsoParkingProps) {
  const router = useRouter()
  const [cars, setCars] = useState<AnimCar[]>([])
  const spotsRef = useRef(spots)
  useEffect(() => { spotsRef.current = spots }, [spots])

  // ── 動畫主迴圈 ──────────────────────────────
  useEffect(() => {
    let raf: number
    const step = () => {
      setCars(prev => {
        const next: AnimCar[] = []
        for (const car of prev) {
          const t = car.t + car.speed
          if (t >= 1) {
            const phase = car.phase + 1
            if (phase > 4) continue    // 車子離開，移除
            // 充電階段速度放慢（停留約 5 秒）
            const speed = phase === 2 ? 1 / 300 : 0.022
            next.push({ ...car, phase, t: 0, speed })
          } else {
            next.push({ ...car, t })
          }
        }
        return next
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  // spots 存 ref，讓 spawnOne 讀最新資料，不加進 deps
  const spotsDataRef = useRef<ParkingSpot[]>(spots)
  useEffect(() => { spotsDataRef.current = spots }, [spots])

  // ── 根據真實 spots 生成動畫車子 ──────────────
  // deps 只用 spots.length（穩定數字），避免 array size 變化錯誤
  useEffect(() => {
    if (spots.length === 0) return

    const spawnOne = (currentCars: AnimCar[]) => {
      const activeSpotsIdx = spotsDataRef.current
        .slice(0, SPOT_POSITIONS.length)
        .map((s, i) => ({ spot: s, idx: i }))
        .filter(({ spot }) => spot.status === 'occupied' || spot.status === 'charging')
      if (activeSpotsIdx.length === 0) return

      const animatedIdx = new Set(currentCars.map(c => c.spotIdx))
      const candidates = activeSpotsIdx.filter(({ idx }) => !animatedIdx.has(idx))
      if (candidates.length === 0) return

      const target = candidates[Math.floor(Math.random() * candidates.length)]
      const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]
      setCars(prev => [...prev, { id: uid++, spotIdx: target.idx, color, phase: 0, t: 0, speed: 0.022 }])
    }

    setCars(prev => { spawnOne(prev); return prev })
    const t1 = setTimeout(() => setCars(prev => { spawnOne(prev); return prev }), 400)
    const t2 = setTimeout(() => setCars(prev => { spawnOne(prev); return prev }), 800)
    const interval = setInterval(() => setCars(prev => { spawnOne(prev); return prev }), 1500)

    return () => { clearInterval(interval); clearTimeout(t1); clearTimeout(t2) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots.length])

  // ── 車子座標插值 ─────────────────────────────
  const getCarPos = (car: AnimCar) => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const lp = (p1: { col: number; row: number }, p2: { col: number; row: number }) => ({
      col: lerp(p1.col, p2.col, car.t),
      row: lerp(p1.row, p2.row, car.t),
    })
    const pos = SPOT_POSITIONS[car.spotIdx]
    const road = { col: pos.col, row: ROAD_ROW }
    const spot = { col: pos.col, row: pos.row }
    switch (car.phase) {
      case 0: return lp({ col: -0.5, row: ROAD_ROW }, road)
      case 1: return lp(road, spot)
      case 2: return spot
      case 3: return lp(spot, road)
      case 4: return lp(road, { col: 7.5, row: ROAD_ROW })
      default: return spot
    }
  }

  // iso 深度排序（後面先畫）
  const sortedCars = [...cars].sort((a, b) => {
    const pa = getCarPos(a), pb = getCarPos(b)
    return (pa.col + pa.row) - (pb.col + pb.row)
  })

  // ── 統計 ─────────────────────────────────────
  const stCount = {
    available:   spots.filter(s => s.status === 'available').length,
    charging:    spots.filter(s => s.status === 'charging').length,
    occupied:    spots.filter(s => s.status === 'occupied').length,
    maintenance: spots.filter(s => s.status === 'maintenance').length,
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>⚡ EV PARK</p>
      <p className={styles.subtitle}>LIVE MAP</p>

      <svg width="100%" height={420} viewBox="120 60 460 340" className={styles.svg}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%"   stopColor="rgba(34,211,238,0.07)" />
            <stop offset="100%" stopColor="rgba(7,9,15,0)" />
          </radialGradient>
        </defs>
        <rect x={120} y={60} width={460} height={340} fill="url(#bgGlow)" />

        {/* 背景地面 row 0–1 */}
        {[0, 1].flatMap(row =>
          [0,1,2,3,4,5,6].map(col => (
            <polygon key={`bg-${col}-${row}`} points={tilePts(col, row)}
              fill="#090f1a" stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
          ))
        )}

        {/* 建築物 */}
        {BLDG_DATA.map(b => <Building key={b.col} {...b} />)}

        {/* 後排停車格地面 row 2 */}
        {[0,1,2,3,4,5,6].map(col => (
          <polygon key={`r2-${col}`} points={tilePts(col, 2)}
            fill={col >= 1 && col <= 5 ? '#0e1b2a' : '#090f1a'}
            stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        ))}

        {/* 後排停車格 + 點擊 */}
        {SPOT_POSITIONS.filter(p => p.row === 2).map((pos, i) => {
          const spot = spots[i]
          const { x, y } = toScreen(pos.col, pos.row)
          const isAvailable = spot?.status === 'available'
          const isCharging  = spot?.status === 'charging'
          const glow = isCharging ? '#22d3ee' : spot?.status === 'occupied' ? '#fb923c' : null
          return (
            <g key={`spot-r2-${i}`}
              onClick={() => isAvailable && spot && router.push(`/reserve/${spot.id}?lotId=${lotId}`)}
              style={{ cursor: isAvailable ? 'pointer' : 'default' }}>
              <polygon points={tilePts(pos.col, pos.row)}
                fill={isCharging ? '#0a2030' : spot?.status === 'occupied' ? '#1a1528' : '#111e2e'}
                stroke={glow ?? 'rgba(255,255,255,0.09)'}
                strokeWidth={glow ? 1.5 : 0.7}
                style={glow ? { filter: `drop-shadow(0 0 7px ${glow}55)` } : undefined} />
              <line x1={x - HW * 0.68} y1={y + HH * 0.08} x2={x - HW * 0.2} y2={y + HH * 0.88}
                stroke="rgba(255,255,255,0.11)" strokeWidth={0.8} />
              <line x1={x + HW * 0.2} y1={y - HH * 0.88} x2={x + HW * 0.68} y2={y - HH * 0.08}
                stroke="rgba(255,255,255,0.11)" strokeWidth={0.8} />
              {isCharging && (
                <text x={x} y={y + 5} textAnchor="middle" fontSize={12} fill="#22d3ee"
                  style={{ filter: 'drop-shadow(0 0 5px #22d3ee)' }}>⚡</text>
              )}
              {isAvailable && (
                <text x={x} y={y + 5} textAnchor="middle" fontSize={9}
                  fill="rgba(74,222,128,0.7)">+</text>
              )}
            </g>
          )
        })}

        {/* 道路 row 3 */}
        {[0,1,2,3,4,5,6].map(col => {
          const { x, y } = toScreen(col, 3)
          return (
            <g key={`road-${col}`}>
              <polygon points={tilePts(col, 3)} fill="#0c1420"
                stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
              <line x1={x - HW * 0.22} y1={y} x2={x + HW * 0.22} y2={y}
                stroke="rgba(255,255,180,0.1)" strokeWidth={1} strokeDasharray="3 5" />
            </g>
          )
        })}

        {/* ENTRY / EXIT */}
        {(() => { const { x, y } = toScreen(-0.5, ROAD_ROW); return (
          <text key="entry" x={x + 4} y={y + 16} fill="rgba(34,211,238,0.45)" fontSize={7.5}
            fontFamily="monospace" fontWeight="bold" letterSpacing={1}>ENTRY</text>
        )})()}
        {(() => { const { x, y } = toScreen(6.5, ROAD_ROW); return (
          <text key="exit" x={x - 14} y={y + 16} fill="rgba(34,211,238,0.45)" fontSize={7.5}
            fontFamily="monospace" fontWeight="bold" letterSpacing={1}>EXIT</text>
        )})()}

        {/* 前排停車格地面 row 4 */}
        {[0,1,2,3,4,5,6].map(col => (
          <polygon key={`r4-${col}`} points={tilePts(col, 4)}
            fill={col >= 1 && col <= 5 ? '#0e1b2a' : '#090f1a'}
            stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        ))}

        {/* 前排停車格 + 點擊 */}
        {SPOT_POSITIONS.filter(p => p.row === 4).map((pos, i) => {
          const realIdx = i + 5
          const spot = spots[realIdx]
          const { x, y } = toScreen(pos.col, pos.row)
          const isAvailable = spot?.status === 'available'
          const isCharging  = spot?.status === 'charging'
          const glow = isCharging ? '#22d3ee' : spot?.status === 'occupied' ? '#fb923c' : null
          return (
            <g key={`spot-r4-${i}`}
              onClick={() => isAvailable && spot && router.push(`/reserve/${spot.id}?lotId=${lotId}`)}
              style={{ cursor: isAvailable ? 'pointer' : 'default' }}>
              <polygon points={tilePts(pos.col, pos.row)}
                fill={isCharging ? '#0a2030' : spot?.status === 'occupied' ? '#1a1528' : '#111e2e'}
                stroke={glow ?? 'rgba(255,255,255,0.09)'}
                strokeWidth={glow ? 1.5 : 0.7}
                style={glow ? { filter: `drop-shadow(0 0 7px ${glow}55)` } : undefined} />
              <line x1={x - HW * 0.68} y1={y + HH * 0.08} x2={x - HW * 0.2} y2={y + HH * 0.88}
                stroke="rgba(255,255,255,0.11)" strokeWidth={0.8} />
              <line x1={x + HW * 0.2} y1={y - HH * 0.88} x2={x + HW * 0.68} y2={y - HH * 0.08}
                stroke="rgba(255,255,255,0.11)" strokeWidth={0.8} />
              {isCharging && (
                <text x={x} y={y + 5} textAnchor="middle" fontSize={12} fill="#22d3ee"
                  style={{ filter: 'drop-shadow(0 0 5px #22d3ee)' }}>⚡</text>
              )}
              {isAvailable && (
                <text x={x} y={y + 5} textAnchor="middle" fontSize={9}
                  fill="rgba(74,222,128,0.7)">+</text>
              )}
            </g>
          )
        })}

        {/* 前方地面 row 5 */}
        {[0,1,2,3,4,5,6].map(col => (
          <polygon key={`r5-${col}`} points={tilePts(col, 5)}
            fill="#090f1a" stroke="rgba(255,255,255,0.025)" strokeWidth={0.5} />
        ))}

        {/* 充電柱（充電中車位才顯示） */}
        {SPOT_POSITIONS.map((pos, i) => {
          const spot = spots[i]
          if (spot?.status !== 'charging') return null
          const { x, y } = toScreen(pos.col, pos.row)
          return (
            <g key={`post-${i}`}>
              <line x1={x + HW * 0.55} y1={y - HH * 0.1} x2={x + HW * 0.55} y2={y - 18}
                stroke="#22d3ee" strokeWidth={2} opacity={0.65} />
              <circle cx={x + HW * 0.55} cy={y - 20} r={3.5} fill="#22d3ee"
                style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }} />
            </g>
          )
        })}

        {/* 動畫車子（深度排序後渲染） */}
        {sortedCars.map(car => {
          const pos = getCarPos(car)
          return (
            <CarShape key={car.id} col={pos.col} row={pos.row}
              color={car.color} glowing={car.phase === 2} />
          )
        })}
      </svg>

      {/* 統計列 */}
      <div className={styles.statsBar}>
        {([
          { label: 'AVAILABLE', value: stCount.available,   color: '#4ade80' },
          { label: 'CHARGING',  value: stCount.charging,    color: '#22d3ee' },
          { label: 'OCCUPIED',  value: stCount.occupied,    color: '#fb923c' },
        ] as const).map(s => (
          <div key={s.label} className={styles.statItem}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
