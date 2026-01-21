'use client';

import { formatEdgePercent } from '@/lib/edge';

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
  const { totalBets, avgPredictedEdge, avgRealizedEdge, edgeError, winRate, totalProfit } = analysis;

  const getErrorStatus = () => {
    if (Math.abs(edgeError) < 0.02) return { text: '정확함', color: 'text-green-600', bg: 'bg-green-50' };
    if (edgeError > 0) return { text: '낙관적 예측', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: '보수적 예측', color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  const errorStatus = getErrorStatus();

  if (totalBets === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
        완료된 베팅이 없어 포트폴리오 분석을 제공할 수 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Total Bets */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-sm text-gray-500 mb-1">총 베팅</div>
        <div className="text-2xl font-bold text-gray-900">{totalBets}</div>
      </div>

      {/* Win Rate */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-sm text-gray-500 mb-1">승률</div>
        <div className={`text-2xl font-bold ${winRate >= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
          {(winRate * 100).toFixed(1)}%
        </div>
      </div>

      {/* Avg Predicted Edge */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-sm text-gray-500 mb-1">예상 우위</div>
        <div className="text-2xl font-bold text-gray-900">
          {formatEdgePercent(avgPredictedEdge)}
        </div>
      </div>

      {/* Avg Realized Edge */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-sm text-gray-500 mb-1">실제 결과</div>
        <div className={`text-2xl font-bold ${avgRealizedEdge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatEdgePercent(avgRealizedEdge)}
        </div>
      </div>

      {/* Edge Error */}
      <div className={`p-4 rounded-lg shadow ${errorStatus.bg}`}>
        <div className="text-sm text-gray-500 mb-1">예측 오차</div>
        <div className={`text-2xl font-bold ${errorStatus.color}`}>
          {formatEdgePercent(edgeError)}
        </div>
        <div className={`text-xs ${errorStatus.color}`}>{errorStatus.text}</div>
      </div>

      {/* Total Profit */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-sm text-gray-500 mb-1">누적 손익</div>
        <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
