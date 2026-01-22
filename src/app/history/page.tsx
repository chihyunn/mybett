'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import BetHistoryTable from '@/components/BetHistoryTable';
import ResultInput from '@/components/ResultInput';
import { useTheme } from '@/contexts/ThemeContext';

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

export default function HistoryPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'settled'>('all');
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);

  const fetchBets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/bets';
      if (filter === 'pending') url += '?settled=false';
      else if (filter === 'settled') url += '?settled=true';

      const res = await fetch(url);
      if (!res.ok) throw new Error('베팅 기록을 불러오지 못했습니다');
      const data = await res.json();
      setBets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로딩 실패');
      console.error('Failed to fetch bets:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  const handleResultSubmit = async (betId: string, result: 0 | 1, actualAmount: number) => {
    const res = await fetch(`/api/bets/${betId}/result`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result, actualAmount }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '결과 입력 실패');
    }

    setSelectedBet(null);
    fetchBets();
  };

  const handleDelete = async (betId: string) => {
    if (!confirm('이 예측을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/bets/${betId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '삭제 실패');
      }

      fetchBets();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  const pendingCount = bets.filter((b) => b.result === null).length;
  const settledCount = bets.filter((b) => b.result !== null).length;

  return (
    <div className="py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>베팅 기록</h1>
          <Link
            href="/predict"
            className="px-3 py-2 md:px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            + 새 예측
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : ''
            }`}
            style={filter !== 'all' ? {
              background: 'var(--card-bg)',
              color: 'var(--foreground)',
              border: '1px solid var(--card-border)',
            } : undefined}
          >
            전체 ({bets.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending' ? 'bg-yellow-500 text-white' : ''
            }`}
            style={filter !== 'pending' ? {
              background: 'var(--card-bg)',
              color: 'var(--foreground)',
              border: '1px solid var(--card-border)',
            } : undefined}
          >
            대기중 ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('settled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'settled' ? 'bg-green-600 text-white' : ''
            }`}
            style={filter !== 'settled' ? {
              background: 'var(--card-bg)',
              color: 'var(--foreground)',
              border: '1px solid var(--card-border)',
            } : undefined}
          >
            완료 ({settledCount})
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{
              background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
              border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
            }}
          >
            <div className="flex items-center gap-2" style={{ color: isDark ? '#f87171' : '#b91c1c' }}>
              <span>⚠️</span>
              <span>{error}</span>
              <button
                onClick={fetchBets}
                className="ml-auto px-3 py-1 text-sm rounded"
                style={{
                  background: isDark ? 'rgba(239, 68, 68, 0.25)' : '#fecaca',
                  color: isDark ? '#f87171' : '#b91c1c',
                }}
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Bet History Table */}
        <div
          className="rounded-lg shadow"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          {loading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-12 rounded flex-1" style={{ background: 'var(--card-border)' }}></div>
                    <div className="h-12 rounded w-24" style={{ background: 'var(--card-border)' }}></div>
                    <div className="h-12 rounded w-20" style={{ background: 'var(--card-border)' }}></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <BetHistoryTable
              bets={bets}
              onResultInput={(bet) => setSelectedBet(bet)}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Result Input Modal */}
        {selectedBet && (
          <ResultInput
            bet={selectedBet}
            onSubmit={handleResultSubmit}
            onCancel={() => setSelectedBet(null)}
          />
        )}
      </div>
    </div>
  );
}
