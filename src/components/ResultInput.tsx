'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Bet {
  id: string;
  teamA: { name: string };
  teamB: { name: string };
  selectedTeam: 'A' | 'B';
  betType: { name: string };
  recommendedAmount: number | null;
}

interface ResultInputProps {
  bet: Bet;
  onSubmit: (betId: string, result: 0 | 1, actualAmount: number) => Promise<void>;
  onCancel: () => void;
}

export default function ResultInput({ bet, onSubmit, onCancel }: ResultInputProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [result, setResult] = useState<0 | 1 | null>(null);
  const [actualAmount, setActualAmount] = useState(bet.recommendedAmount?.toString() || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const betTeamName = bet.selectedTeam === 'A' ? bet.teamA.name : bet.teamB.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (result === null || !actualAmount) return;

    const amount = parseInt(actualAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('유효한 금액을 입력하세요');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(bet.id, result, amount);
    } catch (err) {
      setError(err instanceof Error ? err.message : '결과 입력 실패');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div
        className="rounded-t-2xl sm:rounded-lg shadow-xl max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--card-bg)',
          paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>결과 입력</h2>

        <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>베팅 정보</div>
          <div className="font-medium" style={{ color: 'var(--foreground)' }}>
            {bet.teamA.name} vs {bet.teamB.name}
          </div>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            {betTeamName} · {bet.betType.name}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              경기 결과
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResult(1)}
                className={`py-4 px-4 rounded-lg font-medium transition-colors text-base ${
                  result === 1 ? 'bg-green-600 text-white' : ''
                }`}
                style={result !== 1 ? {
                  background: isDark ? '#374151' : '#f3f4f6',
                  color: 'var(--foreground)',
                } : undefined}
              >
                승리
              </button>
              <button
                type="button"
                onClick={() => setResult(0)}
                className={`py-4 px-4 rounded-lg font-medium transition-colors text-base ${
                  result === 0 ? 'bg-red-600 text-white' : ''
                }`}
                style={result !== 0 ? {
                  background: isDark ? '#374151' : '#f3f4f6',
                  color: 'var(--foreground)',
                } : undefined}
              >
                패배
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              실제 베팅 금액 ($)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={actualAmount}
              onChange={(e) => setActualAmount(e.target.value)}
              placeholder="베팅 금액 입력"
              className="w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--foreground)',
              }}
            />
            {bet.recommendedAmount && (
              <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                추천 금액: ${bet.recommendedAmount}
              </p>
            )}
          </div>

          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
                color: isDark ? '#f87171' : '#b91c1c',
              }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={result === null || !actualAmount || submitting}
              className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed transition-colors text-base"
              style={{
                opacity: result === null || !actualAmount || submitting ? 0.5 : 1,
                background: result === null || !actualAmount || submitting ? (isDark ? '#374151' : '#d1d5db') : undefined,
              }}
            >
              {submitting ? '처리 중...' : '결과 저장'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="py-3.5 px-5 font-medium rounded-lg disabled:opacity-50 transition-colors text-base"
              style={{
                background: isDark ? '#374151' : '#e5e7eb',
                color: isDark ? '#d1d5db' : '#374151',
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
