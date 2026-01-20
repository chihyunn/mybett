'use client';

import { useState } from 'react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">결과 입력</h2>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">베팅 정보</div>
          <div className="font-medium">
            {bet.teamA.name} vs {bet.teamB.name}
          </div>
          <div className="text-sm text-gray-500">
            {betTeamName} · {bet.betType.name}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              경기 결과
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setResult(1)}
                className={`py-3 px-4 rounded-md font-medium transition-colors ${
                  result === 1
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎉 승리
              </button>
              <button
                type="button"
                onClick={() => setResult(0)}
                className={`py-3 px-4 rounded-md font-medium transition-colors ${
                  result === 0
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                😢 패배
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              실제 베팅 금액 ($)
            </label>
            <input
              type="number"
              value={actualAmount}
              onChange={(e) => setActualAmount(e.target.value)}
              placeholder="베팅 금액 입력"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {bet.recommendedAmount && (
              <p className="mt-1 text-xs text-gray-500">
                추천 금액: ${bet.recommendedAmount}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={result === null || !actualAmount || submitting}
              className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '처리 중...' : '결과 저장'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
