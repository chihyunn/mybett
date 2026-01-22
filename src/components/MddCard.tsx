'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface MaxDrawdownData {
  maxDrawdown: number;
  maxDrawdownPercent: number;
  peakAmount: number;
  troughAmount: number;
  recoveryStatus: 'recovered' | 'recovering' | 'none';
  currentDrawdown: number;
  currentDrawdownPercent: number;
}

interface MddCardProps {
  data: MaxDrawdownData;
}

export default function MddCard({ data }: MddCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mddPercent = Math.abs(data.maxDrawdownPercent * 100);
  const currentDdPercent = Math.abs(data.currentDrawdownPercent * 100);

  // Severity color based on MDD percentage
  const getSeverityStyle = (percent: number) => {
    if (percent >= 20) return {
      color: isDark ? '#f87171' : '#dc2626',
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
    };
    if (percent >= 10) return {
      color: isDark ? '#fb923c' : '#ea580c',
      bg: isDark ? 'rgba(249, 115, 22, 0.15)' : '#fff7ed',
    };
    if (percent >= 5) return {
      color: isDark ? '#fbbf24' : '#ca8a04',
      bg: isDark ? 'rgba(234, 179, 8, 0.15)' : '#fefce8',
    };
    return {
      color: isDark ? '#4ade80' : '#16a34a',
      bg: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
    };
  };

  const getStatusBadge = () => {
    switch (data.recoveryStatus) {
      case 'recovered':
        return (
          <span
            className="px-2 py-0.5 text-xs font-medium rounded-full"
            style={{
              background: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
              color: isDark ? '#4ade80' : '#15803d',
            }}
          >
            회복 완료
          </span>
        );
      case 'recovering':
        return (
          <span
            className="px-2 py-0.5 text-xs font-medium rounded-full"
            style={{
              background: isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef9c3',
              color: isDark ? '#fbbf24' : '#a16207',
            }}
          >
            회복 중
          </span>
        );
      default:
        return null;
    }
  };

  if (data.maxDrawdown === 0) {
    return (
      <div
        className="rounded-lg p-4"
        style={{
          background: 'var(--card-bg)',
          boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div className="text-sm mb-1" style={{ color: 'var(--muted)' }}>Max Drawdown</div>
        <div className="text-2xl font-bold" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>0%</div>
        <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>손실 기록 없음</div>
      </div>
    );
  }

  const severityStyle = getSeverityStyle(mddPercent);

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: severityStyle.bg,
        color: severityStyle.color,
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium" style={{ opacity: 0.8 }}>Max Drawdown</div>
        {getStatusBadge()}
      </div>

      <div className="text-3xl font-bold">
        -{mddPercent.toFixed(1)}%
      </div>

      <div className="text-sm mt-1" style={{ opacity: 0.8 }}>
        ${Math.abs(data.maxDrawdown).toLocaleString()} 손실
      </div>

      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${severityStyle.color}33` }} />

      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
        <div>
          <div style={{ opacity: 0.6 }}>최고점</div>
          <div className="font-medium">${data.peakAmount.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ opacity: 0.6 }}>최저점</div>
          <div className="font-medium">${data.troughAmount.toLocaleString()}</div>
        </div>
      </div>

      {data.currentDrawdown < 0 && (
        <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${severityStyle.color}33` }}>
          <div className="text-xs" style={{ opacity: 0.6 }}>현재 드로우다운</div>
          <div className="text-sm font-medium">
            -{currentDdPercent.toFixed(1)}% (${Math.abs(data.currentDrawdown).toLocaleString()})
          </div>
        </div>
      )}
    </div>
  );
}
