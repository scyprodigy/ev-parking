'use client'

import Link from 'next/link'

import { useGetParkingLots } from '@/hooks/useGetParkingLots'
import { useGetParkingSpots } from '@/hooks/useGetParkingSpots'
import { useState } from 'react'
import { AgentChat } from '@/components/AgentChat'
import type { ParkingLot } from '@/types'

// 單一停車場的監控區塊
function LotMonitor({ lot }: { lot: ParkingLot }) {
  const { spots, loading } = useGetParkingSpots(lot.id)

  if (loading) return (
    <div className="border rounded-xl p-5 animate-pulse bg-gray-50">
      <p className="text-gray-400 text-sm">載入中...</p>
    </div>
  )

  // 統計各狀態數量
  const available = spots.filter(s => s.status === 'available').length
  const occupied = spots.filter(s => s.status === 'occupied').length
  const charging = spots.filter(s => s.status === 'charging').length
  const maintenance = spots.filter(s => s.status === 'maintenance').length
  const occupancyRate = spots.length > 0
    ? Math.round(((occupied + charging) / spots.length) * 100)
    : 0

  return (
    <div className="border rounded-xl p-5 bg-white">
      {/* 停車場名稱與使用率 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">{lot.name}</h3>
          <p className="text-xs text-gray-500">{lot.address}</p>
        </div>
        {/* 使用率超過 80% 顯示紅色警示 */}
        <span className={`text-sm font-bold px-2 py-1 rounded-lg ${
          occupancyRate >= 80 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        }`}>
          使用率 {occupancyRate}%
        </span>
      </div>

      {/* 車位狀態統計 */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-green-600">{available}</p>
          <p className="text-xs text-gray-500">空閒</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-red-500">{occupied}</p>
          <p className="text-xs text-gray-500">使用中</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-blue-500">{charging}</p>
          <p className="text-xs text-gray-500">充電中</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-gray-400">{maintenance}</p>
          <p className="text-xs text-gray-500">維修中</p>
        </div>
      </div>

      {/* 使用率進度條 */}
      <div className="mt-4">
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              occupancyRate >= 80 ? 'bg-red-400' : 'bg-green-400'
            }`}
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { lots, loading, error } = useGetParkingLots()

  // 管理員 Agent 的 context，包含所有場地摘要
  const agentContext = lots.map(lot =>
    `停車場：${lot.name}，地址：${lot.address}，總車位：${lot.total_spots}`
  ).join('\n')

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">載入中...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">載入失敗：{error}</p>
    </div>
  )

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* 標題 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">管理員後台</h1>
            <p className="text-gray-500 mt-1">即時監控所有停車場狀態</p>
          </div>
          
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
            ← 車主端
            </Link>
        </div>

        {/* 所有停車場監控區塊 */}
        <div className="flex flex-col gap-4">
          {lots.map(lot => (
            <LotMonitor key={lot.id} lot={lot} />
          ))}
        </div>
      </main>

      {/* 管理員 Agent，帶入所有場地資料 */}
      <AgentChat context={agentContext} />
    </>
  )
}