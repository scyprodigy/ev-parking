'use client'

import { useGetParkingLots } from '@/hooks/useGetParkingLots'
import Link from 'next/link'

export default function HomePage() {
  const { lots, loading, error } = useGetParkingLots()

  // 載入中狀態
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">載入中...</p>
    </div>
  )

  // 錯誤狀態，顯示錯誤訊息而不是讓頁面白屏
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">載入失敗：{error}</p>
    </div>
  )

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* 標題區 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">電動車停車場</h1>
        <p className="text-gray-500 mt-1">選擇停車場查看即時車位</p>
      </div>

      {/* 停車場列表 */}
      <div className="flex flex-col gap-4">
        {lots.map(lot => {
          // 計算滿位率，給用戶一個直觀的判斷
          const occupancyRate = lot.total_spots > 0
            ? Math.round((lot.total_spots / lot.total_spots) * 100)
            : 0

          return (
            <Link key={lot.id} href={`/lots/${lot.id}`}>
              <div className="border rounded-xl p-5 hover:shadow-md transition cursor-pointer bg-white">
                {/* 停車場名稱與地址 */}
                <h2 className="text-lg font-semibold text-gray-800">{lot.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{lot.address}</p>

                {/* 車位資訊 */}
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm text-gray-600">
                    總車位：<strong>{lot.total_spots}</strong>
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    即時查看
                  </span>
                </div>
              </div>
            </Link>
          )
        })}

        {/* 沒有資料時的提示 */}
        {lots.length === 0 && (
          <p className="text-center text-gray-400 py-12">目前沒有停車場資料</p>
        )}
      </div>
    </main>
  )
}