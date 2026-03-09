// =============================================
// 核心型別定義 — 整個系統共用
// =============================================

// 停車場
export interface ParkingLot {
  id: string
  name: string
  address: string
  total_spots: number
  created_at: string
}

// 車位狀態（固定四種，Agent 直接讀取做決策）
export type SpotStatus = 'available' | 'occupied' | 'charging' | 'maintenance'

// 車位類型
export type SpotType = 'standard' | 'charging' | 'disabled'

// 充電樁功率（kW）
export type ChargerPower = '7kW' | '22kW' | '50kW' | '150kW' | null

// 車位
export interface ParkingSpot {
  id: string
  lot_id: string
  spot_number: string
  type: SpotType
  charger_power: ChargerPower
  status: SpotStatus
  updated_at: string
}

// 用戶角色
export type UserRole = 'driver' | 'manager' | 'admin'

// 用戶
export interface User {
  id: string
  email: string
  name: string
  car_model: string | null
  car_plate_hash: string | null  // 個資：hash 儲存，不存明文
  role: UserRole
  created_at: string
}

// 預約狀態
export type ReservationStatus = 'pending' | 'active' | 'completed' | 'cancelled'

// 預約紀錄
export interface Reservation {
  id: string
  user_id: string
  spot_id: string
  lot_id: string
  start_time: string  // UTC ISO string
  end_time: string
  status: ReservationStatus
  total_fee: number
  created_at: string
}

// 充電紀錄（Phase 2 擴充欄位）
export interface ChargingLog {
  id: string
  reservation_id: string
  spot_id: string
  kwh_used: number
  peak_kwh: number      // 尖峰用電量（台電 TOU 計費用）
  offpeak_kwh: number   // 離峰用電量
  start_time: string
  end_time: string
  cost: number
  carbon_kg: number     // 碳排放量（ESG 報告用）
}

// 定價方案（多租戶 SaaS 用）
export interface PricingSchedule {
  id: string
  tenant_id: string
  name: string
  peak_hours: string[]      // 尖峰時段，例如 ["07:00-09:00", "17:00-22:00"]
  offpeak_hours: string[]
  peak_rate: number         // NT$/kWh 尖峰電價
  offpeak_rate: number      // NT$/kWh 離峰電價
  effective_date: string
}

// 租戶（多場地 SaaS 擴充用）
export interface Tenant {
  id: string
  name: string
  plan: 'starter' | 'pro' | 'enterprise'
  created_at: string
}

// 告警（管理後台即時顯示）
export interface Alert {
  id: string
  type: 'overstay' | 'charger_error' | 'spot_conflict' | 'payment_failed'
  spot_id: string
  spot_number: string
  message: string
  severity: 'low' | 'medium' | 'high'
  created_at: string
  resolved: boolean
}

// Agent 回應格式
export interface AgentResponse {
  message: string
  data?: unknown
  error?: string
}