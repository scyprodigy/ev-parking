// =============================================
// useGetParkingSpots — 取得指定停車場的車位列表
// 含 updateSpot 方法，管理後台拖拉用
// =============================================
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ParkingSpot, SpotStatus } from '@/types'

export function useGetParkingSpots(lotId: string | null) {
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 取得車位資料
  const fetchSpots = useCallback(async () => {
    if (!lotId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('parking_spots')
        .select('*')
        .eq('lot_id', lotId)
        .order('spot_number', { ascending: true })

      if (error) throw error
      setSpots(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法取得車位資料')
    } finally {
      setLoading(false)
    }
  }, [lotId])

  useEffect(() => {
    fetchSpots()
  }, [fetchSpots])

  // 更新單一車位狀態（拖拉功能用）
  // 同時更新本地 state，讓 UI 即時反應，不需等待重新拉資料
  const updateSpot = useCallback(async (spotId: string, newStatus: SpotStatus) => {
    // 先更新本地 state（樂觀更新）
    setSpots(prev =>
      prev.map(spot =>
        spot.id === spotId
          ? { ...spot, status: newStatus, updated_at: new Date().toISOString() }
          : spot
      )
    )

    // 再寫入 DB
    const { error } = await supabase
      .from('parking_spots')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', spotId)

    if (error) {
      // 寫入失敗：回滾本地狀態
      await fetchSpots()
      throw error
    }
  }, [fetchSpots])

  return { spots, loading, error, refetch: fetchSpots, updateSpot }
}