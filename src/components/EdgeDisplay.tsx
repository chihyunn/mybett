'use client';

import { calculatePredictedEdge, formatEdgePercent } from '@/lib/edge';
import { useTheme } from '@/contexts/ThemeContext';

interface EdgeDisplayProps {
  pAgent: number | null;
  pMarket: number | null;
}

export default function EdgeDisplay({ pAgent, pMarket }: EdgeDisplayProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (pAgent === null || pMarket === null) {
    return (
      <div
        className="p-4 rounded-lg"
        style={{
          background: 'var(--background)',
          border: '1px solid var(--card-border)',
        }}
      >
        <div className="text-sm text-center" style={{ color: 'var(--muted)' }}>
          확률을 입력하면 Edge가 계산됩니다
        </div>
      </div>
    );
  }

  const edge = calculatePredictedEdge(pAgent, pMarket);
  const edgePercent = edge * 100;

  const getEdgeStyle = () => {
    if (edge < 0) {
      return {
        background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
        color: isDark ? '#f87171' : '#dc2626',
      };
    }
    if (edge < 0.05) {
      return {
        background: isDark ? 'rgba(234, 179, 8, 0.15)' : '#fefce8',
        border: `1px solid ${isDark ? 'rgba(234, 179, 8, 0.3)' : '#fef08a'}`,
        color: isDark ? '#fbbf24' : '#ca8a04',
      };
    }
    if (edge < 0.10) {
      return {
        background: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
        border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0'}`,
        color: isDark ? '#4ade80' : '#16a34a',
      };
    }
    return {
      background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
      border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0'}`,
      color: isDark ? '#34d399' : '#059669',
    };
  };

  const getEdgeLabel = () => {
    if (edge < 0) return '음수 Edge';
    if (edge < 0.05) return 'Edge 부족';
    if (edge < 0.10) return '적정 Edge';
    return '높은 Edge';
  };

  return (
    <div className="p-4 rounded-lg" style={getEdgeStyle()}>
      <div className="text-center">
        <div className="text-sm font-medium mb-1">예측 에지 (Δp)</div>
        <div className="text-3xl font-bold">{formatEdgePercent(edge)}</div>
        <div className="text-sm mt-1">{getEdgeLabel()}</div>
        <div className="text-xs mt-2 opacity-75">
          Δp = {(pAgent * 100).toFixed(1)}% - {(pMarket * 100).toFixed(1)}% = {edgePercent.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
