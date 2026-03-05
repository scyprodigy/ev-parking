import Groq from 'groq-sdk'

// 建立 Groq 客戶端，讀取環境變數中的 API key
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})