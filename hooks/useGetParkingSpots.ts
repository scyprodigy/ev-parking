import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { transformParkingSpot } from '@/lib/transformers'
import type { ParkingSpot } from '@/types'

// 接收 lotId，只拿該停車場的車位
export function useGetParkingSpots(lotId: string) {
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // lotId 不存在就不查詢
    if (!lotId) return
    
    async function fetch() {
      const { data, error } = await supabase
        .from('parking_spots')
        .select('*')
        .eq('lot_id', lotId)   // 只拿這個停車場的車位
        .order('spot_number')  // 依車位號碼排序
        
      if (error) { setError(error.message); return }
      setSpots((data ?? []).map(transformParkingSpot))
      setLoading(false)
    }
    fetch()
  }, [lotId]) // lotId 變了就重新查詢

  return { spots, loading, error }
}