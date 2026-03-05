'use client'
// 在檔案頂部 import 加這行
import { AgentChat } from '@/components/AgentChat'

import { useGetParkingSpots } from '@/hooks/useGetParkingSpots'
import { useParams, useRouter } from 'next/navigation'
import type { ParkingSpot, SpotStatus } from '@/types'

// 每種狀態對應的顏色和標籤
const STATUS_CONFIG: Record<SpotStatus, { color: string; label: string }> = {
  available:   { color: 'bg-green-400', label: '空閒' },
  occupied:    { color: 'bg-red-400',   label: '使用中' },
  charging:    { color: 'bg-blue-400',  label: '充電中' },
  maintenance: { color: 'bg-gray-400',  label: '維修中' },
}

// 單一車位格子元件，只負責顯示
function SpotCell({ spot, onClick }: { spot: ParkingSpot; onClick: () => void }) {
  const config = STATUS_CONFIG[spot.status]
  const isAvailable = spot.status === 'available'

  return (
    <button
      onClick={onClick}
      disabled={!isAvailable} // 非空閒車位不可點
      className={`
        ${config.color} rounded-lg p-3 flex flex-col items-center gap-1
        ${isAvailable ? 'hover:opacity-80 cursor-pointer' : 'opacity-60 cursor-not-allowed'}
        transition
      `}
    >
      {/* 充電車位顯示閃電符號 */}
      <span className="text-white text-lg">
        {spot.type === 'charging' ? '⚡' : '🅿️'}
      </span>
      <span className="text-white text-xs font-bold">{spot.spot_number}</span>
      <span className="text-white text-xs">{config.label}</span>
    </button>
  )
}

export default function LotPage() {
  // 從 URL 拿停車場 ID
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { spots, loading, error } = useGetParkingSpots(id)

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">載入車位中...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">載入失敗：{error}</p>
    </div>
  )

  // 統計各狀態數量，給管理員一個快速總覽
  const available = spots.filter(s => s.status === 'available').length
  const occupied = spots.filter(s => s.status === 'occupied').length
  const charging = spots.filter(s => s.status === 'charging').length

  return (
    <>
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* 返回按鈕 */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 mb-6 hover:text-gray-800"
      >
        ← 返回列表
      </button>

      {/* 狀態統計 */}
      <div className="flex gap-4 mb-6">
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
          空閒 {available}
        </div>
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
          使用中 {occupied}
        </div>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm">
          充電中 {charging}
        </div>
      </div>

      {/* 車位格狀地圖 */}
      <div className="grid grid-cols-4 gap-3">
        {spots.map(spot => (
          <SpotCell
            key={spot.id}
            spot={spot}
            onClick={() => router.push(`/reserve/${spot.id}?lotId=${id}`)}
          />
        ))}
      </div>

      {spots.length === 0 && (
        <p className="text-center text-gray-400 py-12">此停車場尚無車位資料</p>
      )}
    </main>
    
    <AgentChat context={`
        停車場車位狀態：
        空閒：${available} 個
        使用中：${occupied} 個
        充電中：${charging} 個
        總車位：${spots.length} 個
        充電車位：${spots.filter(s => s.type === 'charging').length} 個
      `} />
    </>
  )
}