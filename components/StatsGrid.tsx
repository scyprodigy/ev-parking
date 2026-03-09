// ─── 快速統計三格 ─────────────────────────────
// 用途：首頁本月充電量 / 花費 / 碳減排

import CountUp from '@/components/CountUp'

const STATS = [
  { label: '本月充電', value: 142,  icon: '🔋', suffix: ' kWh' },
  { label: '本月花費', value: 295,  icon: '💰', prefix: 'NT$'  },
  { label: '碳減排',  value: 9.8,  icon: '🌿', suffix: ' kg', decimals: 1 },
]

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STATS.map(stat => (
        <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl mb-2">{stat.icon}</div>
          <p className="text-slate-500 text-xs">{stat.label}</p>
          <p className="font-bold text-slate-900 text-lg">
            {stat.prefix && <span className="text-sm">{stat.prefix}</span>}
            <CountUp target={stat.value} decimals={stat.decimals ?? 0} />
            {stat.suffix && <span className="text-xs font-normal text-slate-400">{stat.suffix}</span>}
          </p>
        </div>
      ))}
    </div>
  )
}
