'use client';

import { formatEdgePercent } from '@/lib/edge';

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
  if (bets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        베팅 기록이 없습니다
      </div>
    );
  }

  const getResultBadge = (result: number | null) => {
    if (result === null) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">대기중</span>;
    }
    if (result === 1) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">승리</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">패배</span>;
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">매치업</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">베팅</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Δp</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Δr</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">결과</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">손익</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">액션</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bets.map((bet) => (
            <tr key={bet.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">
                  {bet.teamA.name} vs {bet.teamB.name}
                </div>
                <div className="text-xs text-gray-500">
                  {bet.sport.name} · {formatDate(bet.createdAt)}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-900">
                  {bet.selectedTeam === 'A' ? bet.teamA.name : bet.teamB.name}
                </div>
                <div className="text-xs text-gray-500">{bet.betType.name}</div>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-sm font-medium ${bet.predictedEdge >= 0.05 ? 'text-green-600' : bet.predictedEdge >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {formatEdgePercent(bet.predictedEdge)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {bet.realizedEdge !== null ? (
                  <span className={`text-sm font-medium ${bet.realizedEdge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatEdgePercent(bet.realizedEdge)}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {getResultBadge(bet.result)}
              </td>
              <td className="px-4 py-3 text-right">
                {bet.profitLoss !== null ? (
                  <span className={`text-sm font-medium ${bet.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {bet.profitLoss >= 0 ? '+' : ''}${bet.profitLoss.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {bet.result === null ? (
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => onResultInput(bet)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                    >
                      결과 입력
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(bet.id)}
                        className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">완료</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
