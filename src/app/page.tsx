'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BalanceCard from '@/components/BalanceCard';
import ProfitCard from '@/components/ProfitCard';
import StatsCard from '@/components/StatsCard';
import BalanceChart from '@/components/BalanceChart';

interface Balance {
  initialAmount: number;
  currentAmount: number;
  totalProfit: number;
  totalBets: number;
  wins: number;
  losses: number;
}

interface RecentBet {
  id: string;
  teamA: { name: string };
  teamB: { name: string };
  result: number | null;
  profitLoss: number | null;
  createdAt: string;
}

interface BalanceHistoryItem {
  id: string;
  amount: number;
  profit: number;
  type: string;
  createdAt: string;
}

interface StreakData {
  globalStreak: number;
  isGlobalWarning: boolean;
}

export default function DashboardPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [recentBets, setRecentBets] = useState<RecentBet[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistoryItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [balanceRes, betsRes, historyRes, streakRes] = await Promise.all([
          fetch('/api/balance'),
          fetch('/api/bets'),
          fetch('/api/balance/history'),
          fetch('/api/analysis/streak'),
        ]);

        const balanceData = await balanceRes.json();
        const betsData = await betsRes.json();
        const historyData = await historyRes.json();
        const streakDataRes = await streakRes.json();

        setBalance(balanceData);
        const betsArray = Array.isArray(betsData) ? betsData : [];
        setRecentBets(betsArray.slice(0, 5));
        setBalanceHistory(Array.isArray(historyData) ? historyData : []);
        setPendingCount(betsArray.filter((b: RecentBet) => b.result === null).length);
        setStreakData(streakDataRes);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-4 md:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 md:h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">대시보드</h1>
              {streakData && streakData.globalStreak >= 3 && (
                <span className="px-3 py-1 text-sm font-bold bg-blue-500 text-white rounded-full animate-pulse">
                  🔥 {streakData.globalStreak}연승
                </span>
              )}
              {streakData && streakData.globalStreak <= -3 && (
                <span className="px-3 py-1 text-sm font-bold bg-red-500 text-white rounded-full animate-pulse">
                  ⚠️ {Math.abs(streakData.globalStreak)}연패
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">에이전트 vs 시장 확률 분석</p>
          </div>
          <Link
            href="/predict"
            className="px-3 py-2 md:px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            + 새 예측
          </Link>
        </div>

        {/* Balance & Stats Cards */}
        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <BalanceCard
              initialAmount={balance.initialAmount}
              currentAmount={balance.currentAmount}
            />
            <ProfitCard totalProfit={balance.totalProfit} />
            <StatsCard
              totalBets={balance.totalBets}
              wins={balance.wins}
              losses={balance.losses}
            />
          </div>
        )}

        {/* Balance History Chart */}
        {balance && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">밸런스 추이</h2>
              <p className="text-sm text-gray-500">시간에 따른 밸런스 변화</p>
            </div>
            <div className="p-4">
              <BalanceChart data={balanceHistory} initialAmount={balance.initialAmount} />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/predict"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-900">예측 입력</div>
            <div className="text-xs text-gray-500">Edge 계산 & 추천</div>
          </Link>

          <Link
            href="/history"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium text-gray-900">베팅 기록</div>
            {pendingCount > 0 && (
              <div className="text-xs text-orange-500">{pendingCount}개 대기중</div>
            )}
          </Link>

          <Link
            href="/analysis"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <div className="text-2xl mb-2">📈</div>
            <div className="font-medium text-gray-900">에지 분석</div>
            <div className="text-xs text-gray-500">Δp vs Δr 비교</div>
          </Link>

          <Link
            href="/history?filter=pending"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <div className="text-2xl mb-2">✏️</div>
            <div className="font-medium text-gray-900">결과 입력</div>
            <div className="text-xs text-gray-500">대기중 베팅 처리</div>
          </Link>
        </div>

        {/* Recent Bets */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">최근 베팅</h2>
            <Link href="/history" className="text-sm text-blue-600 hover:text-blue-800">
              전체 보기 →
            </Link>
          </div>

          {recentBets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              아직 베팅 기록이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentBets.map((bet) => (
                <div key={bet.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">
                      {bet.teamA.name} vs {bet.teamB.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(bet.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <div className="text-right">
                    {bet.result === null ? (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                        대기중
                      </span>
                    ) : bet.result === 1 ? (
                      <div>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          승리
                        </span>
                        <div className="text-sm text-green-600 mt-1">
                          +${bet.profitLoss?.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                          패배
                        </span>
                        <div className="text-sm text-red-600 mt-1">
                          ${bet.profitLoss?.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
