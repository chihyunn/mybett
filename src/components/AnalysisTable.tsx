'use client';

import { formatEdgePercent } from '@/lib/edge';

interface TeamAnalysis {
  teamId: string;
  teamName: string;
  sportName: string;
  betCount: number;
  avgPredictedEdge: number;
  avgRealizedEdge: number;
  edgeError: number;
  winRate: number;
}

interface BetTypeAnalysis {
  betTypeCode: string;
  betTypeName: string;
  betCount: number;
  avgPredictedEdge: number;
  avgRealizedEdge: number;
  edgeError: number;
  winRate: number;
}

interface AnalysisTableProps {
  teamAnalysis: TeamAnalysis[];
  betTypeAnalysis: BetTypeAnalysis[];
  view: 'team' | 'betType';
}

export default function AnalysisTable({ teamAnalysis, betTypeAnalysis, view }: AnalysisTableProps) {
  const getErrorColor = (error: number) => {
    if (Math.abs(error) < 0.02) return 'text-green-600';
    if (Math.abs(error) < 0.05) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getErrorLabel = (error: number) => {
    if (error > 0.02) return '낙관적 예측';
    if (error < -0.02) return '보수적 예측';
    return '정확함';
  };

  if (view === 'team') {
    if (teamAnalysis.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          분석할 베팅 기록이 없습니다
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">팀</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">베팅수</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">예상 우위</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">실제 결과</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">예측 오차</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">승률</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamAnalysis.map((team) => (
              <tr key={team.teamId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{team.teamName}</div>
                  <div className="text-xs text-gray-500">{team.sportName}</div>
                </td>
                <td className="px-4 py-3 text-center text-sm">{team.betCount}</td>
                <td className="px-4 py-3 text-center">
                  <span className={team.avgPredictedEdge >= 0.05 ? 'text-green-600' : 'text-gray-600'}>
                    {formatEdgePercent(team.avgPredictedEdge)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={team.avgRealizedEdge >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatEdgePercent(team.avgRealizedEdge)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={getErrorColor(team.edgeError)}>
                    {formatEdgePercent(team.edgeError)}
                  </span>
                  <div className="text-xs text-gray-400">{getErrorLabel(team.edgeError)}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={team.winRate >= 0.5 ? 'text-green-600' : 'text-red-600'}>
                    {(team.winRate * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Bet Type view
  if (betTypeAnalysis.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        분석할 베팅 기록이 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">베팅 타입</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">베팅수</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">예상 우위</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">실제 결과</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">예측 오차</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">승률</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {betTypeAnalysis.map((bt) => (
            <tr key={bt.betTypeCode} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{bt.betTypeName}</div>
                <div className="text-xs text-gray-500">{bt.betTypeCode}</div>
              </td>
              <td className="px-4 py-3 text-center text-sm">{bt.betCount}</td>
              <td className="px-4 py-3 text-center">
                <span className={bt.avgPredictedEdge >= 0.05 ? 'text-green-600' : 'text-gray-600'}>
                  {formatEdgePercent(bt.avgPredictedEdge)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={bt.avgRealizedEdge >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatEdgePercent(bt.avgRealizedEdge)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={getErrorColor(bt.edgeError)}>
                  {formatEdgePercent(bt.edgeError)}
                </span>
                <div className="text-xs text-gray-400">{getErrorLabel(bt.edgeError)}</div>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={bt.winRate >= 0.5 ? 'text-green-600' : 'text-red-600'}>
                  {(bt.winRate * 100).toFixed(0)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
