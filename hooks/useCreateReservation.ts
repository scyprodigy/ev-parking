import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Reservation } from '@/types'

// Pick 只取預約需要的欄位，其他欄位由系統自動填入
type CreateReservationInput = Pick<
  Reservation,
  'spot_id' | 'lot_id' | 'start_time' | 'end_time'
>

export function useCreateReservation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 呼叫這個函數來建立一筆預約
  async function createReservation(input: CreateReservationInput) {
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        ...input,
        status: 'pending',  // 預設狀態：待確認
        total_fee: 0,       // 費用由後端計算，初始為 0
      })
      .select()
      .single() // 只回傳一筆
      
    setLoading(false)
    if (error) { setError(error.message); return null }
    return data
  }

  return { createReservation, loading, error }
}