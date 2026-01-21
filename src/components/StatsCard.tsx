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
    <div
      className="p-6 rounded-lg shadow"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--muted)' }}>베팅 통계</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{totalBets}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>총 베팅</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
            {winRate.toFixed(1)}%
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>승률</div>
        </div>
      </div>

      <div className="flex gap-2 text-sm">
        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
          승 {wins}
        </span>
        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
          패 {losses}
        </span>
        {pending > 0 && (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
            대기 {pending}
          </span>
        )}
      </div>
    </div>
  );
}
