// =============================================
// Supabase 客戶端 — 單例模式，整個 App 共用
// =============================================
import { createClient } from '@supabase/supabase-js'

// 環境變數從 .env.local 讀取，Vercel 部署時設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 建立單一 Supabase 客戶端實例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)