'use client'

import { useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useCreateReservation } from '@/hooks/useCreateReservation'

export default function ReservePage() {
  const { spotId } = useParams<{ spotId: string }>()
  const searchParams = useSearchParams()
  const lotId = searchParams.get('lotId') ?? ''
  const router = useRouter()

  const { createReservation, loading, error } = useCreateReservation()

  // 預約時間狀態
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    // 基本驗證，避免空白送出
    if (!startTime || !endTime) {
      alert('請選擇開始和結束時間')
      return
    }
    if (new Date(startTime) >= new Date(endTime)) {
      alert('結束時間必須晚於開始時間')
      return
    }

    const result = await createReservation({
      spot_id: spotId,
      lot_id: lotId,
      start_time: new Date(startTime).toISOString(), // 轉成 UTC 存入 DB
      end_time: new Date(endTime).toISOString(),
    })

    if (result) setSuccess(true)
  }

  // 預約成功畫面
  if (success) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-5xl">✅</div>
      <h2 className="text-xl font-bold text-gray-800">預約成功！</h2>
      <p className="text-gray-500 text-sm">車位已為您保留</p>
      <button
        onClick={() => router.push('/')}
        className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
      >
        返回首頁
      </button>
    </div>
  )

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 mb-6 hover:text-gray-800"
      >
        ← 返回車位地圖
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">確認預約</h1>
      <p className="text-gray-500 text-sm mb-8">選擇停車時段</p>

      {/* 時間選擇 */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始時間
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            結束時間
          </label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition"
        >
          {loading ? '處理中...' : '確認預約'}
        </button>
      </div>
    </main>
  )
}