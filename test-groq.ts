
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
import path from 'path';

// 載入 .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GROQ_API_KEY;
console.log('Using API Key:', apiKey ? (apiKey.substring(0, 10) + '...') : 'MISSING');

if (!apiKey) {
  console.error('Error: GROQ_API_KEY is not defined in .env.local');
  process.exit(1);
}

const groq = new Groq({
  apiKey: apiKey,
});

async function testConnection() {
  try {
    console.log('Sending test request to Groq...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello, this is a test connection.' }],
      model: 'llama3-8b-8192', // 使用較小的模型測試
    });
    console.log('Response from Groq:', chatCompletion.choices[0]?.message?.content);
    console.log('SUCCESS: Connection to Groq API is working!');
  } catch (error: any) {
    console.error('FAILURE: Could not connect to Groq API.');
    console.error('Error details:', error.message);
    if (error.status) console.error('Status Code:', error.status);
  }
}

testConnection();
