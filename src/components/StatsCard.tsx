'use client';

interface StatsCardProps {
  totalBets: number;
  wins: number;
  losses: number;
}

export default function StatsCard({ totalBets, wins, losses }: StatsCardProps) {
  const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;
  const pending = totalBets - wins - losses;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-4">베팅 통계</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">{totalBets}</div>
          <div className="text-xs text-gray-500">총 베팅</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
            {winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">승률</div>
        </div>
      </div>

      <div className="flex gap-2 text-sm">
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
          승 {wins}
        </span>
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
          패 {losses}
        </span>
        {pending > 0 && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
            대기 {pending}
          </span>
        )}
      </div>
    </div>
  );
}
