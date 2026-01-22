'use client';

import { useState } from 'react';
import { recommendBetAmount, getRecommendationMessage, calculateKellyBetAmounts } from '@/lib/betting';
import { calculatePredictedEdge } from '@/lib/edge';
import { useTheme } from '@/contexts/ThemeContext';

interface StreakWarning {
  globalStreak: number;
  teamStreak?: number;
  teamName?: string;
}

interface BetRecommendationProps {
  pAgent: number | null;
  pMarket: number | null;
  balance: number;
  streakWarning?: StreakWarning;
}

export default function BetRecommendation({
  pAgent,
  pMarket,
  balance,
  streakWarning,
}: BetRecommendationProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mode, setMode] = useState<'fixed' | 'kelly'>('fixed');

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
          Edge가 계산되면 베팅 추천이 표시됩니다
        </div>
      </div>
    );
  }

  const edge = calculatePredictedEdge(pAgent, pMarket);

  // Calculate streak penalty
  let streakPenalty = 0;
  let streakMessage = '';

  if (streakWarning) {
    // Global losing streak: -2% penalty
    if (streakWarning.globalStreak <= -3) {
      streakPenalty += 0.02;
      streakMessage = `🔥 ${Math.abs(streakWarning.globalStreak)}연패 중 (-2%)`;
    }
    // Team losing streak: additional -1% penalty
    if (streakWarning.teamStreak && streakWarning.teamStreak <= -3) {
      streakPenalty += 0.01;
      streakMessage += streakMessage ? ' + ' : '';
      streakMessage += `${streakWarning.teamName} ${Math.abs(streakWarning.teamStreak)}연패 (-1%)`;
    }
  }

  // Apply penalty to balance for calculation (effectively reducing bet size)
  const adjustedBalance = balance * (1 - streakPenalty / 0.04); // Scale penalty

  const recommended = recommendBetAmount(edge, adjustedBalance);
  const originalRecommended = recommendBetAmount(edge, balance);
  const message = getRecommendationMessage(edge);
  const kelly = calculateKellyBetAmounts(pAgent, pMarket, adjustedBalance);

  const isRecommended = edge >= 0;
  const hasStreakPenalty = streakPenalty > 0;

  const getContainerStyle = () => {
    if (isRecommended) {
      return {
        background: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
        border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'}`,
      };
    }
    if (edge < 0) {
      return {
        background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
      };
    }
    return {
      background: 'var(--background)',
      border: '1px solid var(--card-border)',
    };
  };

  return (
    <div className="p-4 rounded-lg" style={getContainerStyle()}>
      {/* Mode Toggle */}
      <div className="flex justify-center gap-1 mb-3">
        <button
          type="button"
          onClick={() => setMode('fixed')}
          className={`px-2 py-1 text-xs rounded ${mode === 'fixed' ? 'bg-blue-600 text-white' : ''}`}
          style={mode !== 'fixed' ? {
            background: isDark ? '#374151' : '#e5e7eb',
            color: 'var(--muted)',
          } : undefined}
        >
          고정 금액
        </button>
        <button
          type="button"
          onClick={() => setMode('kelly')}
          className={`px-2 py-1 text-xs rounded ${mode === 'kelly' ? 'bg-purple-600 text-white' : ''}`}
          style={mode !== 'kelly' ? {
            background: isDark ? '#374151' : '#e5e7eb',
            color: 'var(--muted)',
          } : undefined}
        >
          Kelly
        </button>
      </div>

      <div className="text-center">
        {mode === 'fixed' ? (
          // Fixed Amount Mode
          <>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>베팅 추천</div>
            {recommended !== null ? (
              <>
                <div className="text-3xl font-bold" style={{ color: isDark ? '#60a5fa' : '#2563eb' }}>
                  ${recommended.toLocaleString()}
                </div>
                <div className="text-sm mt-1" style={{ color: isDark ? '#93c5fd' : '#1d4ed8' }}>{message}</div>
                {hasStreakPenalty && originalRecommended && (
                  <div
                    className="mt-2 p-2 rounded text-xs"
                    style={{
                      background: isDark ? 'rgba(249, 115, 22, 0.2)' : '#ffedd5',
                      color: isDark ? '#fb923c' : '#c2410c',
                    }}
                  >
                    <div className="font-medium">{streakMessage}</div>
                    <div style={{ color: isDark ? '#fdba74' : '#ea580c' }}>
                      원래: ${originalRecommended.toLocaleString()} → 조정: ${recommended.toLocaleString()}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-xl font-bold" style={{ color: 'var(--muted)' }}>베팅 비추천</div>
                <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{message}</div>
              </>
            )}
          </>
        ) : (
          // Kelly Mode
          <>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Kelly Criterion
              <span className="ml-1" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>
                ({(kelly.kellyPercent * 100).toFixed(1)}%)
              </span>
            </div>

            {kelly.kellyPercent > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded p-2" style={{ background: 'var(--card-bg)' }}>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>1/4 Kelly</div>
                    <div className="text-sm font-bold text-green-500">
                      ${kelly.quarterKelly.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>안전</div>
                  </div>
                  <div className="rounded p-2 ring-2 ring-purple-400" style={{ background: 'var(--card-bg)' }}>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>1/2 Kelly</div>
                    <div className="text-lg font-bold" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>
                      ${kelly.halfKelly.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>추천</div>
                  </div>
                  <div className="rounded p-2" style={{ background: 'var(--card-bg)' }}>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>Full Kelly</div>
                    <div className="text-sm font-bold text-red-500">
                      ${kelly.fullKelly.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>공격</div>
                  </div>
                </div>
                <div className="text-xs" style={{ color: isDark ? '#c4b5fd' : '#6d28d9' }}>
                  Kelly: {(kelly.kellyPercent * 100).toFixed(1)}% of bankroll
                </div>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold" style={{ color: 'var(--muted)' }}>베팅 비추천</div>
                <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                  Edge ≤ 0: Kelly = 0%
                </div>
              </>
            )}
          </>
        )}

        <div className="mt-3 pt-3 text-xs" style={{ borderTop: '1px solid var(--card-border)', color: 'var(--muted)' }}>
          밸런스: ${balance.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
