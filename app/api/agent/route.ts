// =============================================
// Groq RAG Agent API Route
// RAG：每次回答前先從 DB 拉即時資料注入 prompt
// 防幻覺：AI 只能根據提供的資料回答
// =============================================
import { NextRequest, NextResponse } from 'next/server'
import { groq, GROQ_MODEL } from '@/lib/groq'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { message, lotId } = await req.json()

    // ─── RAG：從 DB 拉即時資料 ─────────────────
    // 拉目前車位狀態（即時資料注入 prompt）
    let spotsData = '無法取得車位資料'
    let lotsData = '無法取得停車場資料'

    const { data: spots } = await supabase
      .from('parking_spots')
      .select('spot_number, type, charger_power, status')
      .eq('lot_id', lotId ?? '')
      .limit(50)

    const { data: lots } = await supabase
      .from('parking_lots')
      .select('name, address, total_spots')

    if (spots) {
      const available = spots.filter(s => s.status === 'available').length
      const charging = spots.filter(s => s.status === 'charging').length
      const occupied = spots.filter(s => s.status === 'occupied').length
      const maintenance = spots.filter(s => s.status === 'maintenance').length

      spotsData = `
目前車位狀態（即時）：
- 空閒：${available} 個
- 充電中：${charging} 個
- 使用中（未充電）：${occupied} 個
- 維修中：${maintenance} 個
- 總計：${spots.length} 個

各車位詳細：
${spots.map(s => `  車位 ${s.spot_number}:${s.status}，類型 ${s.type}，充電功率 ${s.charger_power ?? '無'}`).join('\n')}
      `.trim()
    }

    if (lots) {
      lotsData = lots.map(l => `${l.name}(${l.address}) 共 ${l.total_spots} 個車位`).join('\n')
    }

    // ─── System Prompt（防幻覺邊界）──────────────
    const systemPrompt = `
你是電動車停車場的 AI 助理。

【重要規則】
1. 你只能根據下方「即時資料」回答停車場相關問題
2. 日常閒聊（打招呼、天氣、感謝等）正常友善回應
3. 用戶問停車場相關問題但資料中找不到時，回覆「系統目前沒有這項資料，請聯繫管理員」
4. 不要建議資料以外的車位選項
5. 回答簡短自然，用繁體中文

【即時資料】
停車場資訊：
${lotsData}

${spotsData}

台電 TOU 電價（供計費參考）：
- 尖峰（週一至週五 07:00-09:00, 17:00-22:00）：NT$4.91/kWh
- 離峰（其他時段）：NT$2.08/kWh
    `.trim()

    // ─── 呼叫 Groq LLaMA 3 ────────────────────
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 300,
      temperature: 0.3, // 低溫：讓回答更確定、不亂飄
    })

    const reply = completion.choices[0]?.message?.content ?? '無法取得回應'

    return NextResponse.json({ message: reply })
  } catch (error) {
    console.error('Agent error:', error)
    return NextResponse.json({ error: '服務暫時無法使用' }, { status: 500 })
  }
}