// ─── 最近充電紀錄 ─────────────────────────────
// 用途：首頁顯示最近 3 筆充電記錄
// TODO：Phase 2 換成從 Supabase reservations 表查詢

const RECORDS = [
  { date: '3/7', location: '信義停車場 A-03',    kwh: 24.5, cost: 51,  peak: false },
  { date: '3/5', location: '內湖科技園區 B-08',  kwh: 18.2, cost: 89,  peak: true  },
  { date: '3/3', location: '信義停車場 A-12',    kwh: 31.0, cost: 64,  peak: false },
]

export default function RecentHistory() {
  return (
    <div>
      <h2 className="font-bold text-slate-900 mb-3">最近紀錄</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {RECORDS.map((record, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">{record.location}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {record.date} · {record.kwh} kWh · {record.peak ? '⚡尖峰' : '🌙離峰'}
              </p>
            </div>
            <p className="font-semibold text-slate-900">NT${record.cost}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
