'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AnalysisTable from '@/components/AnalysisTable';
import PortfolioSummary from '@/components/PortfolioSummary';

interface Sport {
  id: string;
  name: string;
}

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

interface PortfolioAnalysis {
  totalBets: number;
  avgPredictedEdge: number;
  avgRealizedEdge: number;
  edgeError: number;
  winRate: number;
  totalProfit: number;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportId, setSportId] = useState<string>('');
  const [minBets, setMinBets] = useState<number>(1);
  const [view, setView] = useState<'team' | 'betType'>('team');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [teamAnalysis, setTeamAnalysis] = useState<TeamAnalysis[]>([]);
  const [betTypeAnalysis, setBetTypeAnalysis] = useState<BetTypeAnalysis[]>([]);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis>({
    totalBets: 0,
    avgPredictedEdge: 0,
    avgRealizedEdge: 0,
    edgeError: 0,
    winRate: 0,
    totalProfit: 0,
  });

  // Fetch sports for filter
  useEffect(() => {
    async function fetchSports() {
      try {
        const res = await fetch('/api/sports');
        const data = await res.json();
        setSports(data);
      } catch (error) {
        console.error('Failed to fetch sports:', error);
      }
    }
    fetchSports();
  }, []);

  // Fetch analysis data
  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (sportId) params.set('sportId', sportId);
      params.set('minBets', minBets.toString());

      const res = await fetch(`/api/analysis?${params}`);
      if (!res.ok) throw new Error('분석 데이터를 불러오지 못했습니다');
      const data = await res.json();

      setTeamAnalysis(data.teamAnalysis);
      setBetTypeAnalysis(data.betTypeAnalysis);
      setPortfolioAnalysis(data.portfolioAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로딩 실패');
      console.error('Failed to fetch analysis:', err);
    } finally {
      setLoading(false);
    }
  }, [sportId, minBets]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">에지 분석</h1>

        {/* Portfolio Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">전체 포트폴리오</h2>
          {loading ? (
            <div className="animate-pulse grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <PortfolioSummary analysis={portfolioAnalysis} />
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                스포츠 필터
              </label>
              <select
                value={sportId}
                onChange={(e) => setSportId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">전체</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                최소 베팅 수
              </label>
              <select
                value={minBets}
                onChange={(e) => setMinBets(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="1">1회 이상</option>
                <option value="5">5회 이상</option>
                <option value="10">10회 이상</option>
                <option value="20">20회 이상</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setView('team')}
                className={`px-4 py-2 rounded-md font-medium ${
                  view === 'team'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                팀별 분석
              </button>
              <button
                onClick={() => setView('betType')}
                className={`px-4 py-2 rounded-md font-medium ${
                  view === 'betType'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                베팅타입별 분석
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <span>⚠️</span>
              <span>{error}</span>
              <button
                onClick={fetchAnalysis}
                className="ml-auto px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Analysis Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              {view === 'team' ? '팀별 에지 분석' : '베팅타입별 에지 분석'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              오차 = 평균 Δp - 평균 Δr (양수: 과대평가, 음수: 과소평가)
            </p>
          </div>

          {loading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <AnalysisTable
              teamAnalysis={teamAnalysis}
              betTypeAnalysis={betTypeAnalysis}
              view={view}
            />
          )}
        </div>
      </div>
    </div>
  );
}
