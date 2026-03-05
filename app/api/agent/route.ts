import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

// 初始化 Groq，讀取環境變數中的 API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json()

    // system prompt 告訴 AI 它的角色和能力範圍
    // context 是從前端傳進來的即時資料（車位狀態、停車場資訊）
    const systemPrompt = `
你是一個電動車停車場的 AI 助理，名字叫「停車小幫手」。
你可以幫助車主查詢車位、推薦停車場、回答充電相關問題。
你也可以幫管理員分析停車場使用狀況。
請用繁體中文回答，語氣親切簡潔。

目前停車場即時資料：
${context ?? '無即時資料'}

注意事項：
- 只回答停車場相關問題
- 推薦車位時優先考慮充電需求
- 不要編造不在資料中的資訊
`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Groq 上最強的免費模型
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500, // 對話回覆不需要太長
      temperature: 0.7, // 適度創意但不亂說
    })

    // 回傳 AI 的回覆內容
    const reply = response.choices[0]?.message?.content ?? '抱歉，我無法回答這個問題。'
    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Groq API error:', error)
    return NextResponse.json(
      { error: '服務暫時無法使用，請稍後再試' },
      { status: 500 }
    )
  }
}