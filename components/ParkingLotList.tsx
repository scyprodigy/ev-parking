// ─── 附近停車場列表 ───────────────────────────
// 用途：首頁從 Supabase 拉停車場，點擊進入車位地圖

import Link from 'next/link'
import { ParkingLot } from '@/types'

interface ParkingLotListProps {
  lots: ParkingLot[]
  loading: boolean
}

export default function ParkingLotList({ lots, loading }: ParkingLotListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-slate-900">附近停車場</h2>
        <span className="text-xs text-slate-400">{lots.length} 個場地</span>
      </div>

      {/* 載入中骨架 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {lots.map(lot => (
            <Link
              key={lot.id}
              href={`/lots/${lot.id}`}
              className="block bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all spot-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{lot.name}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{lot.address}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      有空位
                    </span>
                    <span className="text-xs text-slate-400">共 {lot.total_spots} 個車位</span>
                  </div>
                </div>
                <div className="text-slate-300 text-2xl">›</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
