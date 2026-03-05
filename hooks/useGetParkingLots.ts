import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { transformParkingLot } from '@/lib/transformers'
import type { ParkingLot } from '@/types'

export function useGetParkingLots() {
  // 停車場列表、載入狀態、錯誤訊息
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      // 從 Supabase 拿所有停車場
      const { data, error } = await supabase.from('parking_lots').select('*')
      
      // 有錯誤就記錄，不繼續執行
      if (error) { setError(error.message); return }
      
      // 資料過 transformer 清洗後才存進 state
      setLots((data ?? []).map(transformParkingLot))
      setLoading(false)
    }
    fetch()
  }, []) // 空陣列代表只在元件載入時執行一次

  return { lots, loading, error }
}