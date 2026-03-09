// =============================================
// 管理員後台主頁 — 只負責狀態管理與版面組合
// 視覺元件已拆至 components/，常數拆至 lib/spotStatus.ts
// =============================================
'use client'

import { useState, useCallback } from 'react'
import { useGetParkingLots } from '@/hooks/useGetParkingLots'
import { useGetParkingSpots } from '@/hooks/useGetParkingSpots'
import { ParkingSpot, SpotStatus, Alert } from '@/types'

import CountUp from '@/components/CountUp'
import ToastContainer from '@/components/ToastContainer'
import ChargingArc from '@/components/ChargingArc'
import Sparkline from '@/components/Sparkline'
import DragBadge from '@/components/DragBadge'
import SpotCard from '@/components/SpotCard'
import { SPOT_STATUS_CONFIG, DRAG_BADGES } from '@/lib/spotStatus'

export default function DashboardPage() {
  const { lots } = useGetParkingLots()
  const [selLot, setSelLot] = useState('')
  const activeLotId = selLot || lots[0]?.id || ''
  const { spots, updateSpot } = useGetParkingSpots(activeLotId || null)
  const [alerts, setAlerts] = useState<Alert[]>([])

  // ── 統計數字 ──────────────────────────────
  const st = {
    available:   spots.filter(s => s.status === 'available').length,
    charging:    spots.filter(s => s.status === 'charging').length,
    occupied:    spots.filter(s => s.status === 'occupied').length,
    maintenance: spots.filter(s => s.status === 'maintenance').length,
  }
  const total = spots.length
  const kwh = st.charging * 22 * 2
  const rev = kwh * 2.08 + st.occupied * 30
  const activeLot = lots.find(l => l.id === activeLotId)

  // 趨勢假資料（實際上線換 DB 歷史紀錄）
  const kwhTrend = [180, 210, 195, 240, 220, 280, kwh || 260]
  const revTrend = [380, 420, 395, 480, 445, 560, rev || 520]

  // ── 拖拉更新狀態 ──────────────────────────
  const handleDrop = useCallback(async (spotId: string, newStatus: SpotStatus) => {
    await updateSpot(spotId, newStatus)
    const spot = spots.find(s => s.id === spotId)

    // 維修時自動產生告警
    if (newStatus === 'maintenance') {
      setAlerts(prev => [...prev, {
        id: `a-${Date.now()}`,
        type: 'charger_error',
        spot_id: spotId,
        spot_number: spot?.spot_number ?? '--',
        message: `車位 ${spot?.spot_number} 標記維修，請派員檢查。`,
        severity: 'high',
        created_at: new Date().toISOString(),
        resolved: false,
      }])
    }

    // 模擬超時告警（30% 機率）
    if (newStatus === 'occupied' && Math.random() > 0.7) {
      setAlerts(prev => [...prev, {
        id: `a-${Date.now()}-2`,
        type: 'overstay',
        spot_id: spotId,
        spot_number: spot?.spot_number ?? '--',
        message: `車位 ${spot?.spot_number} 超過預約時間。`,
        severity: 'medium',
        created_at: new Date().toISOString(),
        resolved: false,
      }])
    }
  }, [spots, updateSpot])

  const dismiss = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id))

  // ── 統計卡資料 ────────────────────────────
  const statCards = [
    { label: 'Total Stations', value: total,                          sub: activeLot?.name ?? '', color: '#22d3ee', trend: [10,10,12,11,12,total,total] },
    { label: 'Sessions Today', value: st.charging + st.occupied + 8, sub: '今日充電次數',          color: '#a78bfa', trend: [5,8,6,9,7,11,st.charging+st.occupied+8] },
    { label: 'Energy Used',    value: kwh || 132,                     sub: '今日 kWh',             color: '#34d399', trend: kwhTrend, suffix: ' kWh' },
    { label: 'Revenue',        value: rev || 365,                     sub: '今日營收',             color: '#fb923c', trend: revTrend, prefix: 'NT$' },
  ]

  return (
    <div className="min-h-screen text-white" style={{ background: '#07090f' }}>
      <ToastContainer alerts={alerts} onDismiss={dismiss} />

      {/* ── Header ── */}
      <header className="px-8 py-4 flex items-center justify-between sticky top-0 z-20"
        style={{
          background: 'rgba(7,9,15,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base"
            style={{
              background: 'linear-gradient(135deg, #22d3ee, #0891b2)',
              boxShadow: '0 0 18px rgba(34,211,238,0.35)',
            }}>⚡</div>
          <div>
            <p className="font-bold text-white text-sm leading-none">EV Park</p>
            {/* secondary 0.75 */}
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>管理後台</p>
          </div>
        </div>

        {/* 停車場切換 */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {lots.map(lot => (
            <button key={lot.id} onClick={() => setSelLot(lot.id)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={activeLotId === lot.id ? {
                background: 'rgba(34,211,238,0.15)',
                color: '#22d3ee',
                border: '1px solid rgba(34,211,238,0.3)',
                boxShadow: '0 0 10px rgba(34,211,238,0.15)',
              } : {
                color: 'rgba(255,255,255,0.65)',
                border: '1px solid transparent',
              }}>
              {lot.name.replace('電動車', '').replace('停車場', '')}
            </button>
          ))}
        </div>

        {/* 右側工具列 */}
        <div className="flex items-center gap-3">
          {/* tertiary 0.5，輔助資訊 */}
          <p className="text-xs font-medium hidden md:block" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {activeLot?.address}
          </p>
          <a href="/"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
            前台
          </a>
          <button
            className="relative w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)' }}>
            🔔
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"
                style={{ boxShadow: '0 0 6px #ef4444' }} />
            )}
          </button>
        </div>
      </header>

      <main className="px-8 py-5 space-y-4 max-w-screen-xl mx-auto">

        {/* ── 第一排 ── */}
        <div className="grid grid-cols-12 gap-4">

          {/* 充電儀表大卡 */}
          <div className="col-span-4 rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(34,211,238,0.08) 0%, rgba(7,9,15,0) 70%)',
              border: '1px solid rgba(34,211,238,0.15)',
            }}>
            {/* 背景光暈 */}
            <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
              style={{ background: '#22d3ee' }} />

            <p className="text-sm font-semibold mb-5" style={{ color: 'rgba(255,255,255,0.75)' }}>
              充電站狀態
            </p>

            <div className="flex items-center justify-around mb-5">
              <ChargingArc value={st.available}   max={total} label="空閒"   color="#4ade80" size={110} strokeWidth={7} />
              <ChargingArc value={st.charging}    max={total} label="充電中" color="#22d3ee" size={110} strokeWidth={7} />
              <ChargingArc value={st.occupied}    max={total} label="使用中" color="#fb923c" size={110} strokeWidth={7} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { label: 'Online',  value: total - st.maintenance, color: '#4ade80' },
                { label: 'In Use',  value: st.charging + st.occupied, color: '#fb923c' },
                { label: 'Offline', value: st.maintenance, color: '#f87171' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: item.color }}>
                    <CountUp target={item.value} />
                  </p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4 個統計卡 */}
          <div className="col-span-8 grid grid-cols-2 gap-4">
            {statCards.map((card, i) => (
              <div key={i} className="rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* 右下角趨勢線 */}
                <div className="absolute bottom-2 right-3 opacity-30 pointer-events-none">
                  <Sparkline data={card.trend} color={card.color} />
                </div>
                {/* label：secondary 0.75 */}
                <p className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.75)' }}>{card.label}</p>
                {/* 數字：primary + accent color */}
                <p className="text-3xl font-bold tabular-nums mt-3" style={{ color: card.color }}>
                  {(card as { prefix?: string }).prefix}
                  <CountUp target={card.value} />
                  {(card as { suffix?: string }).suffix ?? ''}
                </p>
                {/* 說明：tertiary 0.5 */}
                <p className="text-xs font-medium mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {card.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 第二排 ── */}
        <div className="grid grid-cols-12 gap-4">

          {/* 車位地圖 */}
          <div className="col-span-8 rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-white text-sm">車位地圖</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  拖拉左側標籤到車位更新狀態
                </p>
              </div>
              {/* 圖例 */}
              <div className="flex items-center gap-4">
                {Object.entries(SPOT_STATUS_CONFIG).map(([k, cfg]) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full"
                      style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }} />
                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {cfg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              {/* 拖拉標籤列 */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {DRAG_BADGES.map(d => <DragBadge key={d.status} {...d} />)}
              </div>
              {/* 車位格子 */}
              <div className="flex-1 grid grid-cols-4 md:grid-cols-6 gap-2">
                {spots.map(spot => <SpotCard key={spot.id} spot={spot} onDrop={handleDrop} />)}
              </div>
            </div>
          </div>

          {/* 右側：告警 + 充電紀錄 */}
          <div className="col-span-4 flex flex-col gap-4">

            {/* 告警卡 */}
            <div className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${alerts.length > 0 ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: alerts.length > 0 ? '0 0 20px rgba(248,113,113,0.05)' : 'none',
              }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-white text-sm">告警</p>
                {alerts.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: 'rgba(248,113,113,0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(248,113,113,0.3)',
                    }}>
                    {alerts.length} 筆
                  </span>
                )}
              </div>

              {alerts.length === 0 ? (
                <div className="flex flex-col items-center py-5 gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'rgba(74,222,128,0.1)' }}>✓</div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    系統運作正常
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {alerts.map(a => (
                    <div key={a.id} className="flex gap-2 p-3 rounded-xl"
                      style={{
                        background: a.severity === 'high' ? 'rgba(248,113,113,0.06)' : 'rgba(251,146,60,0.06)',
                        border: `1px solid ${a.severity === 'high' ? 'rgba(248,113,113,0.2)' : 'rgba(251,146,60,0.2)'}`,
                      }}>
                      <span className="text-sm flex-shrink-0">{a.severity === 'high' ? '🚨' : '⚠️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white leading-relaxed">{a.message}</p>
                        <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {new Date(a.created_at).toLocaleTimeString('zh-TW')}
                        </p>
                      </div>
                      <button onClick={() => dismiss(a.id)}
                        className="text-lg leading-none flex-shrink-0 font-bold"
                        style={{ color: 'rgba(255,255,255,0.5)' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 最近充電紀錄 */}
            <div className="rounded-2xl p-5 flex-1"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-bold text-white text-sm mb-4">最近充電</p>
              <div className="space-y-3">
                {[
                  { spot: 'A-01', kwh: 24.5, cost: 51,  time: '09:30' },
                  { spot: 'A-03', kwh: 18.2, cost: 89,  time: '08:15' },
                  { spot: 'C-02', kwh: 31.0, cost: 64,  time: '昨天'  },
                  { spot: 'A-06', kwh: 12.8, cost: 27,  time: '昨天'  },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 pb-3"
                    style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}>⚡</div>
                    <div className="flex-1 min-w-0">
                      {/* 車位號碼：primary */}
                      <p className="text-sm font-semibold text-white">車位 {r.spot}</p>
                      {/* 時間 + kWh：secondary 0.75 */}
                      <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {r.time} · {r.kwh} kWh
                      </p>
                    </div>
                    {/* 費用：accent color */}
                    <span className="text-sm font-bold tabular-nums" style={{ color: '#22d3ee' }}>
                      NT${r.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-4" />
      </main>
    </div>
  )
}
