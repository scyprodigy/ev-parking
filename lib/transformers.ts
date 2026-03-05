import type { ParkingLot, ParkingSpot, Reservation, SpotStatus, SpotType, ReservationStatus } from '@/types'

// 任何從外部或 DB 來的原始資料，用 unknown 接，不假設格式
// 這層的工作：清洗、補預設值、統一格式

export function transformParkingLot(raw: unknown): ParkingLot {
  const r = raw as Record<string, unknown>
  return {
    id: String(r.id ?? ''),
    name: String(r.name ?? '未命名停車場'),
    address: String(r.address ?? '地址未提供'),
    total_spots: Number(r.total_spots) || 0,
    created_at: String(r.created_at ?? new Date().toISOString()),
  }
}

export function transformParkingSpot(raw: unknown): ParkingSpot {
  const r = raw as Record<string, unknown>
  // status 如果是不認識的值，預設 available，不讓 UI 炸掉
  const validStatus: SpotStatus[] = ['available', 'occupied', 'charging', 'maintenance']
  const validType: SpotType[] = ['standard', 'charging', 'disabled']
  return {
    id: String(r.id ?? ''),
    lot_id: String(r.lot_id ?? ''),
    spot_number: String(r.spot_number ?? ''),
    type: validType.includes(r.type as SpotType) ? (r.type as SpotType) : 'standard',
    charger_power: r.charger_power ? String(r.charger_power) : null,
    status: validStatus.includes(r.status as SpotStatus) ? (r.status as SpotStatus) : 'available',
    updated_at: String(r.updated_at ?? new Date().toISOString()),
  }
}

export function transformReservation(raw: unknown): Reservation {
  const r = raw as Record<string, unknown>
  const validStatus: ReservationStatus[] = ['pending', 'active', 'completed', 'cancelled']
  return {
    id: String(r.id ?? ''),
    user_id: String(r.user_id ?? ''),
    spot_id: String(r.spot_id ?? ''),
    lot_id: String(r.lot_id ?? ''),
    start_time: String(r.start_time ?? ''),
    end_time: String(r.end_time ?? ''),
    status: validStatus.includes(r.status as ReservationStatus) ? (r.status as ReservationStatus) : 'pending',
    total_fee: Number(r.total_fee) || 0,
    created_at: String(r.created_at ?? new Date().toISOString()),
  }
}