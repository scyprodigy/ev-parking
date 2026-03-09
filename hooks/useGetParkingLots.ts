// =============================================
// useGetParkingLots — 取得所有停車場列表
// Hook 負責資料邏輯，不知道 UI 長什麼樣
// =============================================
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ParkingLot } from '@/types'

export function useGetParkingLots() {
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLots() {
      try {
        const { data, error } = await supabase
          .from('parking_lots')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error
        setLots(data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : '無法取得停車場資料')
      } finally {
        setLoading(false)
      }
    }

    fetchLots()
  }, [])

  return { lots, loading, error }
}