// 停車場
export interface ParkingLot {
  id: string
  name: string
  address: string
  total_spots: number
  created_at: string
}

// 車位狀態類型
export type SpotStatus = 'available' | 'occupied' | 'charging' | 'maintenance'

// 車位類型
export type SpotType = 'standard' | 'charging' | 'disabled'

// 車位
export interface ParkingSpot {
  id: string
  lot_id: string
  spot_number: string
  type: SpotType
  charger_power: string | null
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
  car_plate: string | null
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
  start_time: string
  end_time: string
  status: ReservationStatus
  total_fee: number
  created_at: string
}

// Agent 對話訊息
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// 角色類型獨立出來，之後 hook 和 component 會用到
export type ChatRole = 'user' | 'assistant'

// 從外部或 DB 來的原始資料型別，任何欄位都可能是 null
// 給 transformers.ts 用
export type RawData<T> = {
  [K in keyof T]: T[K] | null | undefined
}