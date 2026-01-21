'use client';

import { useState, useEffect, useCallback } from 'react';
import AnalysisTable from '@/components/AnalysisTable';
import PortfolioSummary from '@/components/PortfolioSummary';
import MddCard from '@/components/MddCard';
import ROIAnalysis from '@/components/ROIAnalysis';

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

interface MaxDrawdownData {
  maxDrawdown: number;
  maxDrawdownPercent: number;
  peakAmount: number;
  troughAmount: number;
  recoveryStatus: 'recovered' | 'recovering' | 'none';
  currentDrawdown: number;
  currentDrawdownPercent: number;
}

interface SportBetTypeAnalysis {
  sportId: string;
  sportName: string;
  betTypeCode: string;
  betTypeName: string;
  betCount: number;
  avgPredictedEdge: number;
  avgRealizedEdge: number;
  edgeError: number;
  winRate: number;
  totalProfit: number;
}

export default function AnalysisPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportId, setSportId] = useState<string>('');
  const [minBets, setMinBets] = useState<number>(1);
  const [view, setView] = useState<'team' | 'betType' | 'cross' | 'roi'>('team');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [teamAnalysis, setTeamAnalysis] = useState<TeamAnalysis[]>([]);
  const [betTypeAnalysis, setBetTypeAnalysis] = useState<BetTypeAnalysis[]>([]);
  const [sportBetTypeAnalysis, setSportBetTypeAnalysis] = useState<SportBetTypeAnalysis[]>([]);
  const [maxDrawdown, setMaxDrawdown] = useState<MaxDrawdownData | null>(null);
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
      setMaxDrawdown(data.maxDrawdown);
      setSportBetTypeAnalysis(data.sportBetTypeAnalysis);
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
    <div className="py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">예측 정확도 분석</h1>

        {/* Portfolio Summary + MDD */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">전체 포트폴리오</h2>
          {loading ? (
            <div className="animate-pulse grid grid-cols-2 md:grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              <div className="col-span-2 md:col-span-6">
                <PortfolioSummary analysis={portfolioAnalysis} />
              </div>
              <div className="col-span-2 md:col-span-1">
                {maxDrawdown && <MddCard data={maxDrawdown} />}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 md:mb-6">
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-4 items-end">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                스포츠
              </label>
              <select
                value={sportId}
                onChange={(e) => setSportId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                최소 베팅
              </label>
              <select
                value={minBets}
                onChange={(e) => setMinBets(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="1">1+</option>
                <option value="5">5+</option>
                <option value="10">10+</option>
                <option value="20">20+</option>
              </select>
            </div>

            <div className="col-span-2 flex gap-2">
              <button
                type="button"
                onClick={() => setView('team')}
                className={`flex-1 px-2 py-2 rounded-md text-xs md:text-sm font-medium ${
                  view === 'team'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                팀별
              </button>
              <button
                type="button"
                onClick={() => setView('betType')}
                className={`flex-1 px-2 py-2 rounded-md text-xs md:text-sm font-medium ${
                  view === 'betType'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                타입별
              </button>
              <button
                type="button"
                onClick={() => setView('cross')}
                className={`flex-1 px-2 py-2 rounded-md text-xs md:text-sm font-medium ${
                  view === 'cross'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                종합
              </button>
              <button
                type="button"
                onClick={() => setView('roi')}
                className={`flex-1 px-2 py-2 rounded-md text-xs md:text-sm font-medium ${
                  view === 'roi'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ROI 📈
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

        {/* ROI Analysis */}
        {view === 'roi' ? (
          <ROIAnalysis />
        ) : (
          /* Analysis Table */
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                {view === 'team' ? '팀별 예측 정확도' : view === 'betType' ? '베팅타입별 예측 정확도' : '스포츠 x 베팅타입 분석'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {view === 'cross'
                  ? '스포츠별 베팅타입 조합 성과 분석'
                  : '예측 오차 = 예상 우위 - 실제 결과 (양수: 낙관적 예측, 음수: 보수적 예측)'
                }
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
            ) : view === 'cross' ? (
              <CrossAnalysisTable data={sportBetTypeAnalysis} />
            ) : (
              <AnalysisTable
                teamAnalysis={teamAnalysis}
                betTypeAnalysis={betTypeAnalysis}
                view={view as 'team' | 'betType'}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Cross Analysis Table Component
function CrossAnalysisTable({ data }: { data: SportBetTypeAnalysis[] }) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        분석할 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">스포츠</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">타입</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">베팅수</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">승률</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">예상 우위</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">실제 결과</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">오차</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">수익</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item) => (
            <tr key={`${item.sportId}-${item.betTypeCode}`} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{item.sportName}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                  {item.betTypeName}
                </span>
              </td>
              <td className="px-4 py-3 text-center">{item.betCount}</td>
              <td className="px-4 py-3 text-center">
                <span className={item.winRate >= 0.5 ? 'text-green-600' : 'text-red-600'}>
                  {(item.winRate * 100).toFixed(0)}%
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {(item.avgPredictedEdge * 100).toFixed(1)}%
              </td>
              <td className="px-4 py-3 text-center">
                <span className={item.avgRealizedEdge >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {(item.avgRealizedEdge * 100).toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={item.edgeError > 0 ? 'text-orange-600' : 'text-blue-600'}>
                  {item.edgeError > 0 ? '+' : ''}{(item.edgeError * 100).toFixed(1)}%
                </span>
              </td>
              <td className={`px-4 py-3 text-right font-medium ${item.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.totalProfit >= 0 ? '+' : ''}${item.totalProfit.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
