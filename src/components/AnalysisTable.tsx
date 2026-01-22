'use client';

import { formatEdgePercent } from '@/lib/edge';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getErrorColor = (error: number) => {
    if (Math.abs(error) < 0.02) return isDark ? '#4ade80' : '#16a34a';
    if (Math.abs(error) < 0.05) return isDark ? '#fbbf24' : '#ca8a04';
    return isDark ? '#f87171' : '#dc2626';
  };

  const getErrorLabel = (error: number) => {
    if (error > 0.02) return '낙관적 예측';
    if (error < -0.02) return '보수적 예측';
    return '정확함';
  };

  if (view === 'team') {
    if (teamAnalysis.length === 0) {
      return (
        <div className="text-center py-8" style={{ color: 'var(--muted)' }}>
          분석할 베팅 기록이 없습니다
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table
          className="min-w-full"
          style={{ borderCollapse: 'separate', borderSpacing: 0 }}
        >
          <thead style={{ background: isDark ? '#1f2937' : '#f9fafb' }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>팀</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>베팅수</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>예상 우위</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>실제 결과</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>예측 오차</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>승률</th>
            </tr>
          </thead>
          <tbody style={{ background: 'var(--card-bg)' }}>
            {teamAnalysis.map((team, idx) => (
              <tr
                key={team.teamId}
                style={{
                  borderBottom: idx < teamAnalysis.length - 1 ? '1px solid var(--card-border)' : 'none',
                }}
              >
                <td className="px-4 py-3">
                  <div className="font-medium" style={{ color: 'var(--foreground)' }}>{team.teamName}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{team.sportName}</div>
                </td>
                <td className="px-4 py-3 text-center text-sm" style={{ color: 'var(--foreground)' }}>{team.betCount}</td>
                <td className="px-4 py-3 text-center">
                  <span style={{ color: team.avgPredictedEdge >= 0.05 ? (isDark ? '#4ade80' : '#16a34a') : 'var(--foreground)' }}>
                    {formatEdgePercent(team.avgPredictedEdge)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span style={{ color: team.avgRealizedEdge >= 0 ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}>
                    {formatEdgePercent(team.avgRealizedEdge)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span style={{ color: getErrorColor(team.edgeError) }}>
                    {formatEdgePercent(team.edgeError)}
                  </span>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{getErrorLabel(team.edgeError)}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span style={{ color: team.winRate >= 0.5 ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}>
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
      <div className="text-center py-8" style={{ color: 'var(--muted)' }}>
        분석할 베팅 기록이 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className="min-w-full"
        style={{ borderCollapse: 'separate', borderSpacing: 0 }}
      >
        <thead style={{ background: isDark ? '#1f2937' : '#f9fafb' }}>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>베팅 타입</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>베팅수</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>예상 우위</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>실제 결과</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>예측 오차</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--card-border)' }}>승률</th>
          </tr>
        </thead>
        <tbody style={{ background: 'var(--card-bg)' }}>
          {betTypeAnalysis.map((bt, idx) => (
            <tr
              key={bt.betTypeCode}
              style={{
                borderBottom: idx < betTypeAnalysis.length - 1 ? '1px solid var(--card-border)' : 'none',
              }}
            >
              <td className="px-4 py-3">
                <div className="font-medium" style={{ color: 'var(--foreground)' }}>{bt.betTypeName}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{bt.betTypeCode}</div>
              </td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: 'var(--foreground)' }}>{bt.betCount}</td>
              <td className="px-4 py-3 text-center">
                <span style={{ color: bt.avgPredictedEdge >= 0.05 ? (isDark ? '#4ade80' : '#16a34a') : 'var(--foreground)' }}>
                  {formatEdgePercent(bt.avgPredictedEdge)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span style={{ color: bt.avgRealizedEdge >= 0 ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}>
                  {formatEdgePercent(bt.avgRealizedEdge)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span style={{ color: getErrorColor(bt.edgeError) }}>
                  {formatEdgePercent(bt.edgeError)}
                </span>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{getErrorLabel(bt.edgeError)}</div>
              </td>
              <td className="px-4 py-3 text-center">
                <span style={{ color: bt.winRate >= 0.5 ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}>
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
