'use client';

import { formatEdgePercent } from '@/lib/edge';
import { useTheme } from '@/contexts/ThemeContext';

interface Bet {
  id: string;
  sport: { name: string };
  teamA: { name: string };
  teamB: { name: string };
  selectedTeam: 'A' | 'B';
  betType: { code: string; name: string };
  pAgent: number;
  pMarket: number;
  predictedEdge: number;
  recommendedAmount: number | null;
  actualAmount: number | null;
  result: number | null;
  realizedEdge: number | null;
  profitLoss: number | null;
  createdAt: string;
  settledAt: string | null;
}

interface BetHistoryTableProps {
  bets: Bet[];
  onResultInput: (bet: Bet) => void;
  onDelete?: (betId: string) => void;
}

export default function BetHistoryTable({ bets, onResultInput, onDelete }: BetHistoryTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (bets.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--muted)' }}>
        베팅 기록이 없습니다
      </div>
    );
  }

  const getResultBadge = (result: number | null) => {
    if (result === null) {
      return (
        <span
          className="px-2 py-1 text-xs font-medium rounded"
          style={{
            background: isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef9c3',
            color: isDark ? '#fbbf24' : '#a16207',
          }}
        >
          대기중
        </span>
      );
    }
    if (result === 1) {
      return (
        <span
          className="px-2 py-1 text-xs font-medium rounded"
          style={{
            background: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
            color: isDark ? '#4ade80' : '#15803d',
          }}
        >
          승리
        </span>
      );
    }
    return (
      <span
        className="px-2 py-1 text-xs font-medium rounded"
        style={{
          background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
          color: isDark ? '#f87171' : '#b91c1c',
        }}
      >
        패배
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead style={{ background: 'var(--background)' }}>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>매치업</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>베팅</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>예상 우위</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>실제 결과</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>결과</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>손익</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>액션</th>
          </tr>
        </thead>
        <tbody style={{ background: 'var(--card-bg)' }}>
          {bets.map((bet, index) => (
            <tr key={bet.id} style={{ borderTop: index > 0 ? '1px solid var(--card-border)' : undefined }}>
              <td className="px-4 py-3">
                <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {bet.teamA.name} vs {bet.teamB.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  {bet.sport.name} · {formatDate(bet.createdAt)}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {bet.selectedTeam === 'A' ? bet.teamA.name : bet.teamB.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{bet.betType.name}</div>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-sm font-medium ${bet.predictedEdge >= 0.05 ? 'text-green-500' : bet.predictedEdge >= 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {formatEdgePercent(bet.predictedEdge)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {bet.realizedEdge !== null ? (
                  <span className={`text-sm font-medium ${bet.realizedEdge >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatEdgePercent(bet.realizedEdge)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--muted)' }}>-</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {getResultBadge(bet.result)}
              </td>
              <td className="px-4 py-3 text-right">
                {bet.profitLoss !== null ? (
                  <span className={`text-sm font-medium ${bet.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {bet.profitLoss >= 0 ? '+' : ''}${bet.profitLoss.toLocaleString()}
                  </span>
                ) : (
                  <span style={{ color: 'var(--muted)' }}>-</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {bet.result === null ? (
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => onResultInput(bet)}
                      className="px-3 py-1 text-xs font-medium rounded"
                      style={{
                        background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff',
                        color: isDark ? '#60a5fa' : '#2563eb',
                      }}
                    >
                      결과 입력
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(bet.id)}
                        className="px-2 py-1 text-xs font-medium rounded"
                        style={{
                          background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                          color: isDark ? '#f87171' : '#dc2626',
                        }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>완료</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
