'use client';

import { formatEdgePercent } from '@/lib/edge';
import { useTheme } from '@/contexts/ThemeContext';

interface PortfolioAnalysis {
  totalBets: number;
  avgPredictedEdge: number;
  avgRealizedEdge: number;
  edgeError: number;
  winRate: number;
  totalProfit: number;
}

interface PortfolioSummaryProps {
  analysis: PortfolioAnalysis;
}

export default function PortfolioSummary({ analysis }: PortfolioSummaryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { totalBets, avgPredictedEdge, avgRealizedEdge, edgeError, winRate, totalProfit } = analysis;

  const getErrorStatus = () => {
    if (Math.abs(edgeError) < 0.02) return {
      text: '정확함',
      color: isDark ? '#4ade80' : '#16a34a',
      bg: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
    };
    if (edgeError > 0) return {
      text: '낙관적 예측',
      color: isDark ? '#fb923c' : '#ea580c',
      bg: isDark ? 'rgba(249, 115, 22, 0.15)' : '#fff7ed',
    };
    return {
      text: '보수적 예측',
      color: isDark ? '#60a5fa' : '#2563eb',
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
    };
  };

  const errorStatus = getErrorStatus();

  const cardStyle = {
    background: 'var(--card-bg)',
    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
  };

  if (totalBets === 0) {
    return (
      <div
        className="p-6 rounded-lg text-center"
        style={{ background: 'var(--background)', color: 'var(--muted)' }}
      >
        완료된 베팅이 없어 포트폴리오 분석을 제공할 수 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Total Bets */}
      <div className="p-4 rounded-lg" style={cardStyle}>
        <div className="text-sm mb-1" style={{ color: 'var(--muted)' }}>총 베팅</div>
        <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{totalBets}</div>
      </div>

      {/* Win Rate */}
      <div className="p-4 rounded-lg" style={cardStyle}>
        <div className="text-sm mb-1" style={{ color: 'var(--muted)' }}>승률</div>
        <div
          className="text-2xl font-bold"
          style={{ color: winRate >= 0.5 ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}
        >
          {(winRate * 100).toFixed(1)}%
        </div>
      </div>

      {/* Avg Predicted Edge */}
      <div className="p-4 rounded-lg" style={cardStyle}>
        <div className="text-sm mb-1" style={{ color: 'var(--muted)' }}>예상 우위</div>
        <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          {formatEdgePercent(avgPredictedEdge)}
        </div>
      </div>

      {/* Avg Realized Edge */}
      <div className="p-4 rounded-lg" style={cardStyle}>
        <div className="text-sm mb-1" style={{ color: 'var(--muted)' }}>실제 결과</div>
        <div
          className="text-2xl font-bold"
          style={{ color: avgRealizedEdge >= 0 ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}
        >
          {formatEdgePercent(avgRealizedEdge)}
        </div>
      </div>

      {/* Edge Error */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: errorStatus.bg,
          boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div className="text-sm mb-1" style={{ color: 'var(--muted)' }}>예측 오차</div>
        <div className="text-2xl font-bold" style={{ color: errorStatus.color }}>
          {formatEdgePercent(edgeError)}
        </div>
        <div className="text-xs" style={{ color: errorStatus.color }}>{errorStatus.text}</div>
      </div>

      {/* Total Profit */}
      <div className="p-4 rounded-lg" style={cardStyle}>
        <div className="text-sm mb-1" style={{ color: 'var(--muted)' }}>누적 손익</div>
        <div
          className="text-2xl font-bold"
          style={{ color: totalProfit >= 0 ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}
        >
          {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
