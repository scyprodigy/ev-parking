// =============================================
// Groq 客戶端 — 只在 Server Side 使用（API Route）
// =============================================
import Groq from 'groq-sdk'

// GROQ_API_KEY 只放 server side，不暴露給瀏覽器
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

// 使用的模型：LLaMA 3 70B — 免費且極速
export const GROQ_MODEL = 'llama-3.3-70b-versatile'