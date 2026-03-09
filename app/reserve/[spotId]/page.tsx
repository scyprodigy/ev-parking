// =============================================
// 預約頁面 — 選時間、確認費用、送出預約
// =============================================
'use client'

import { useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useGetParkingSpots } from '@/hooks/useGetParkingSpots'
import { useCreateReservation } from '@/hooks/useCreateReservation'
import { calculateTOUCost } from '@/lib/transformers'

export default function ReservePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const spotId = params.spotId as string
  const lotId = searchParams.get('lotId') ?? ''

  const { spots } = useGetParkingSpots(lotId)
  const { createReservation, loading } = useCreateReservation()

  const [hours, setHours] = useState(2)
  const [success, setSuccess] = useState(false)

  const spot = spots.find(s => s.id === spotId)

  // 計算預估費用（台電 TOU 電價）
  const now = new Date()
  const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000)
  const estimatedKwh = spot?.charger_power
    ? parseFloat(spot.charger_power) * hours
    : 0
  const { totalCost } = calculateTOUCost(estimatedKwh, now, endTime)

  const handleReserve = async () => {
    const reservation = await createReservation({
      spotId,
      lotId,
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
    })
    if (reservation) setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-xl page-enter">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">預約成功！</h2>
          <p className="text-slate-500 mb-6">車位 {spot?.spot_number} 已為您保留</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
          >
            返回首頁
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-slate-500 text-xl">←</button>
          <h1 className="font-bold text-slate-900">確認預約</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4 page-enter">
        {/* 車位資訊卡 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {spot?.spot_number ?? '--'}
            </div>
            <div>
              <p className="font-semibold text-slate-900">車位 {spot?.spot_number}</p>
              <p className="text-sm text-slate-400">
                {spot?.type === 'charging' ? `充電車位 · ${spot.charger_power}` : '標準車位'}
              </p>
            </div>
            <div className="ml-auto">
              <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                可預約
              </span>
            </div>
          </div>
        </div>

        {/* 時間選擇 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">停留時間</h3>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setHours(h => Math.max(1, h - 1))}
              className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold hover:bg-slate-200 transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900">{hours}</p>
              <p className="text-slate-400 text-sm">小時</p>
            </div>
            <button
              onClick={() => setHours(h => Math.min(12, h + 1))}
              className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold hover:bg-slate-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* 費用明細 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">費用估算</h3>
          <div className="space-y-2">
            {spot?.charger_power && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">預估充電量</span>
                  <span className="text-slate-900">{estimatedKwh.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">電費（離峰 NT$2.08/kWh）</span>
                  <span className="text-slate-900">NT${totalCost}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">停車費（NT$30/小時）</span>
              <span className="text-slate-900">NT${hours * 30}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between font-bold">
              <span className="text-slate-900">預估總計</span>
              <span className="text-blue-600 text-lg">NT${totalCost + hours * 30}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            * 費用以實際結帳時電表為準，台電 TOU 電價可能有差異
          </p>
        </div>

        {/* 確認按鈕 */}
        <button
          onClick={handleReserve}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg"
          style={{ boxShadow: '0 8px 24px rgba(59,130,246,0.4)' }}
        >
          {loading ? '處理中...' : '確認預約'}
        </button>

        <div className="h-10" />
      </main>
    </div>
  )
}