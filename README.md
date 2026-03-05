# ⚡ EV Parking - 智慧電動車停車監測系統

這是一個花了三個小時迅速打造的MVP demo
基於 **Next.js 14** 開發的智慧停車場監測平台，旨在提供即時的電動車位狀態、充電狀態監控以及停車場管理功能。

## 🚀 專案特點
- **即時監控**：即時查看停車位狀態（空閒、使用中、充電中、維修中）。
- **視覺化界面**：簡潔直觀的儀表板，支援響應式設計（手機/電腦皆可看）。
- **AI 助手集成**：整合 Groq SDK 提供智慧化的停車場數據分析與諮詢。
- **雲端部署**：已成功部署於 Vercel，提供穩定的連線服務。

## 🛠️ 技術棧
- **框架**: [Next.js](https://nextjs.org/) (App Router)
- **樣式**: [Tailwind CSS](https://tailwindcss.com/)
- **資料庫/後端**: [Supabase](https://supabase.com/)
- **AI 引擎**: [Groq API](https://groq.com/)
- **部署**: [Vercel](https://vercel.com/)

## 📦 安裝與本地開發

     複製此儲存庫：
     ```bash
     git clone [https://github.com/scyprodigy/ev-parking.git](https://github.com/scyprodigy/ev-parking.git)
     
    安裝依賴：
    npm install
    
    設定環境變數：
    建立 .env.local 檔案並填入以下內容：
    
    NEXT_PUBLIC_SUPABASE_URL=你的Supabase網址
    NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase金鑰
    GROQ_API_KEY=你的Groq金鑰
    
    啟動開發伺服器：
    npm run dev
    

##  🔗 線上展示
    正式環境網址: https://ev-parking.vercel.app
    
    Made by scyprodigy
