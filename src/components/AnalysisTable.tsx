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
    if (error > 0.02) return '낙관적';
    if (error < -0.02) return '보수적';
    return '정확';
  };

  // Mobile Card for Team Analysis
  const TeamMobileCard = ({ team }: { team: TeamAnalysis }) => (
    <div
      className="rounded-lg p-4"
      style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-medium" style={{ color: 'var(--foreground)' }}>{team.teamName}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>{team.sportName} · {team.betCount}회</div>
        </div>
        <div className="text-right">
          <span
            className="px-2 py-1 text-xs font-medium rounded"
            style={{
              background: team.winRate >= 0.5 ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7') : (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'),
              color: team.winRate >= 0.5 ? (isDark ? '#4ade80' : '#15803d') : (isDark ? '#f87171' : '#dc2626'),
            }}
          >
            {(team.winRate * 100).toFixed(0)}% 승률
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="py-2 rounded" style={{ background: 'var(--card-bg)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>예상</div>
          <div style={{ color: team.avgPredictedEdge >= 0.05 ? (isDark ? '#4ade80' : '#16a34a') : 'var(--foreground)' }}>
            {formatEdgePercent(team.avgPredictedEdge)}
          </div>
        </div>
        <div className="py-2 rounded" style={{ background: 'var(--card-bg)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>실제</div>
          <div style={{ color: team.avgRealizedEdge >= 0 ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}>
            {formatEdgePercent(team.avgRealizedEdge)}
          </div>
        </div>
        <div className="py-2 rounded" style={{ background: 'var(--card-bg)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>오차</div>
          <div style={{ color: getErrorColor(team.edgeError) }}>
            {formatEdgePercent(team.edgeError)}
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>{getErrorLabel(team.edgeError)}</div>
        </div>
      </div>
    </div>
  );

  // Mobile Card for BetType Analysis
  const BetTypeMobileCard = ({ bt }: { bt: BetTypeAnalysis }) => (
    <div
      className="rounded-lg p-4"
      style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-medium" style={{ color: 'var(--foreground)' }}>{bt.betTypeName}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>{bt.betTypeCode} · {bt.betCount}회</div>
        </div>
        <div className="text-right">
          <span
            className="px-2 py-1 text-xs font-medium rounded"
            style={{
              background: bt.winRate >= 0.5 ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7') : (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'),
              color: bt.winRate >= 0.5 ? (isDark ? '#4ade80' : '#15803d') : (isDark ? '#f87171' : '#dc2626'),
            }}
          >
            {(bt.winRate * 100).toFixed(0)}% 승률
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="py-2 rounded" style={{ background: 'var(--card-bg)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>예상</div>
          <div style={{ color: bt.avgPredictedEdge >= 0.05 ? (isDark ? '#4ade80' : '#16a34a') : 'var(--foreground)' }}>
            {formatEdgePercent(bt.avgPredictedEdge)}
          </div>
        </div>
        <div className="py-2 rounded" style={{ background: 'var(--card-bg)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>실제</div>
          <div style={{ color: bt.avgRealizedEdge >= 0 ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}>
            {formatEdgePercent(bt.avgRealizedEdge)}
          </div>
        </div>
        <div className="py-2 rounded" style={{ background: 'var(--card-bg)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>오차</div>
          <div style={{ color: getErrorColor(bt.edgeError) }}>
            {formatEdgePercent(bt.edgeError)}
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>{getErrorLabel(bt.edgeError)}</div>
        </div>
      </div>
    </div>
  );

  if (view === 'team') {
    if (teamAnalysis.length === 0) {
      return (
        <div className="text-center py-8" style={{ color: 'var(--muted)' }}>
          분석할 베팅 기록이 없습니다
        </div>
      );
    }

    return (
      <>
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-3">
          {teamAnalysis.map((team) => (
            <TeamMobileCard key={team.teamId} team={team} />
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
      </>
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
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-3">
        {betTypeAnalysis.map((bt) => (
          <BetTypeMobileCard key={bt.betTypeCode} bt={bt} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
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
    </>
  );
}
