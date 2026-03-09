// =============================================
// Transformer 層 — 系統邊界，清洗外部髒資料
// 核心業務邏輯永遠只看從這裡出來的乾淨資料
// 換廠商只改這裡，不動其他地方
// =============================================

import { ParkingSpot, SpotStatus, SpotType, ChargerPower } from '@/types'

// ─── 車牌正規化 ───────────────────────────────
// 外部來源：ABC-1234 / abc1234 / AB C1234 多種寫法
// 輸出：統一大寫無分隔符，例如 ABC1234
export function normalizePlate(raw: string): string {
  return raw.toUpperCase().replace(/[\s\-_]/g, '')
}

// ─── 車牌 Hash（個資保護）────────────────────
// 個資法：車牌是個人資料，DB 不存明文
// 實際環境用 bcrypt，Demo 用簡單 hash
export function hashPlate(plate: string): string {
  const normalized = normalizePlate(plate)
  // 實際上線改用 server-side bcrypt
  return btoa(normalized).replace(/=/g, '')
}

// ─── OCPP 充電樁狀態映射 ─────────────────────
// 各廠商 OCPP 版本不同，狀態碼不統一
// Adapter 把外部狀態碼統一映射成內部 SpotStatus
const OCPP_STATUS_MAP: Record<string, SpotStatus> = {
  Available: 'available',
  Occupied: 'occupied',
  Charging: 'charging',
  Faulted: 'maintenance',
  Unavailable: 'maintenance',
  Reserved: 'occupied',
  // 不同廠商的變體
  AVAILABLE: 'available',
  IN_USE: 'charging',
  FAULT: 'maintenance',
}

export function mapOCPPStatus(ocppStatus: string): SpotStatus {
  return OCPP_STATUS_MAP[ocppStatus] ?? 'maintenance'
}

// ─── 功率單位正規化 ───────────────────────────
// 外部來源：7000W / 7kw / 7KW / 7 kW 各種寫法
// 輸出：內部標準格式 '7kW'
export function normalizePower(raw: string | number | null): ChargerPower {
  if (!raw) return null
  const str = String(raw).toLowerCase().replace(/\s/g, '')
  if (str.includes('150')) return '150kW'
  if (str.includes('50')) return '50kW'
  if (str.includes('22')) return '22kW'
  if (str.includes('7')) return '7kW'
  return null
}

// ─── ERP 日期格式轉換 ─────────────────────────
// 台灣既有 ERP/SAP 常用民國年（例如 1140307）
// 轉換成 ISO 8601 UTC 格式
export function convertROCDate(rocDate: string | number): string {
  const str = String(rocDate)
  if (str.length === 7) {
    // 格式：YYYMMDD（民國年）
    const year = parseInt(str.slice(0, 3)) + 1911
    const month = str.slice(3, 5)
    const day = str.slice(5, 7)
    return `${year}-${month}-${day}T00:00:00Z`
  }
  // 已是西元年直接回傳
  return new Date(str).toISOString()
}

// ─── 車位資料驗證 ─────────────────────────────
// 確保從外部系統進來的車位資料格式正確
export function validateSpot(raw: Partial<ParkingSpot>): boolean {
  const validStatuses: SpotStatus[] = ['available', 'occupied', 'charging', 'maintenance']
  const validTypes: SpotType[] = ['standard', 'charging', 'disabled']
  
  if (!raw.id || !raw.lot_id) return false
  if (raw.status && !validStatuses.includes(raw.status)) return false
  if (raw.type && !validTypes.includes(raw.type)) return false
  return true
}

// ─── 台電 TOU 電價計算 ────────────────────────
// 尖峰：NT$4.91/kWh（07:00-09:00, 17:00-22:00 週一至週五）
// 離峰：NT$2.08/kWh（其他時段）
// 資料來源：台電113年10月電價表
export function calculateTOUCost(
  kwhUsed: number,
  startTime: Date,
  endTime: Date
): { peakKwh: number; offpeakKwh: number; totalCost: number } {
  const hour = startTime.getHours()
  const isWeekday = startTime.getDay() >= 1 && startTime.getDay() <= 5
  const isPeak = isWeekday && ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 22))
  
  const peakKwh = isPeak ? kwhUsed : 0
  const offpeakKwh = isPeak ? 0 : kwhUsed
  const totalCost = peakKwh * 4.91 + offpeakKwh * 2.08
  
  return { peakKwh, offpeakKwh, totalCost: Math.round(totalCost) }
}

// ─── 碳排放計算 ───────────────────────────────
// 台電 2023 碳排係數：0.494 kgCO₂/度
// 用於 ESG 報告（上市公司需要）
export function calculateCarbon(kwhUsed: number): number {
  return Math.round(kwhUsed * 0.494 * 100) / 100
}