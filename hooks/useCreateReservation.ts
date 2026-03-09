// =============================================
// useCreateReservation — 建立預約並寫入 Supabase
// =============================================
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Reservation } from '@/types'

interface CreateReservationInput {
  spotId: string
  lotId: string
  startTime: string  // ISO UTC string
  endTime: string
  userId?: string    // Phase 2 加 Auth 後必填
}

export function useCreateReservation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createReservation = async (input: CreateReservationInput): Promise<Reservation | null> => {
    setLoading(true)
    setError(null)

    try {
      // 計算預估費用（簡單版：固定 NT$30/小時，Phase 2 改用 TOU 計費）
      const hours =
        (new Date(input.endTime).getTime() - new Date(input.startTime).getTime()) /
        (1000 * 60 * 60)
      const totalFee = Math.round(hours * 30)

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          user_id: input.userId ?? '00000000-0000-0000-0000-000000000001', // Demo 用固定 user
          spot_id: input.spotId,
          lot_id: input.lotId,
          start_time: input.startTime,
          end_time: input.endTime,
          status: 'pending',
          total_fee: totalFee,
        })
        .select()
        .single()

      if (error) throw error

      // 預約成功後把車位狀態改成 occupied
      await supabase
        .from('parking_spots')
        .update({ status: 'occupied' })
        .eq('id', input.spotId)

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '預約失敗，請稍後再試')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createReservation, loading, error }
}