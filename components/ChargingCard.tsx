// ─── 充電中大卡片 ─────────────────────────────
// 用途：車主首頁最上方的充電狀態卡片
// 狀態：Demo 模擬充電進度，上線後換成 Supabase realtime

'use client'

import { useState, useEffect } from 'react'
import ChargingArc from '@/components/ChargingArc'
import CountUp from '@/components/CountUp'

export default function ChargingCard() {
  const [chargingPercent, setChargingPercent] = useState(67)
  const [kwhUsed, setKwhUsed] = useState(18.4)

  // 模擬充電進度緩慢增加（Demo 用，3 秒一次）
  useEffect(() => {
    const timer = setInterval(() => {
      setChargingPercent(prev => Math.min(prev + 0.1, 100))
      setKwhUsed(prev => prev + 0.01)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const estimatedCost = Math.round(kwhUsed * 2.08)

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-2xl">
      {/* 頂部：地點 + 剩餘時間 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-blue-200 text-sm">目前充電中</p>
          <p className="font-bold text-xl">信義電動車停車場</p>
          <p className="text-blue-200 text-sm">車位 A-03 · 22kW 快充</p>
        </div>
        <div className="bg-white/10 rounded-2xl px-3 py-1.5">
          <p className="text-xs text-blue-200">剩餘時間</p>
          <p className="font-bold text-white">47 分鐘</p>
        </div>
      </div>

      {/* 底部：圓弧 + 數據 */}
      <div className="flex items-center justify-between">
        <ChargingArc percentage={chargingPercent} size={140} darkMode />

        <div className="space-y-4 flex-1 ml-6">
          <div>
            <p className="text-blue-200 text-xs">已充電量</p>
            <p className="text-2xl font-bold text-white">
              <CountUp target={kwhUsed} decimals={1} suffix=" kWh" />
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">預估費用</p>
            <p className="text-2xl font-bold text-white">
              NT$<CountUp target={estimatedCost} />
            </p>
          </div>
          {/* 離峰電價標籤 */}
          <div className="inline-flex items-center gap-1 bg-green-500/20 rounded-full px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-300 text-xs">離峰電價中</span>
          </div>
        </div>
      </div>
    </div>
  )
}
