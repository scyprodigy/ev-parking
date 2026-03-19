import Groq from 'groq-sdk';

/** * 在 Next.js 中，process.env 會自動載入 .env.local，
 * 無需手動 import dotenv。這樣可以避免 Vercel 編譯失敗。
 */

const apiKey = process.env.GROQ_API_KEY;

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY 未設定')
}

if (!apiKey) {
  console.error('Error: GROQ_API_KEY is not defined.');
  // 在 Vercel 編譯期間不應 process.exit，除非這只是本地腳本
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    // process.exit(1); 
  }
}

const groq = new Groq({
  apiKey: apiKey || '', 
});

async function testConnection() {
  try {
    console.log('Sending test request to Groq...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello, this is a test connection.' }],
      model: 'llama3-8b-8192', 
    });
    console.log('Response from Groq:', chatCompletion.choices[0]?.message?.content);
    console.log('SUCCESS: Connection to Groq API is working!');
  } catch (error: any) {
    console.error('FAILURE: Could not connect to Groq API.');
    console.error('Error details:', error.message);
    if (error.status) console.error('Status Code:', error.status);
  }
}

// 只有直接執行此檔案時才執行測試
if (require.main === module || !process.env.NEXT_PHASE) {
  testConnection();
}
