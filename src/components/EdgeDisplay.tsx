'use client';

import { calculatePredictedEdge, formatEdgePercent } from '@/lib/edge';

interface EdgeDisplayProps {
  pAgent: number | null;
  pMarket: number | null;
}

export default function EdgeDisplay({ pAgent, pMarket }: EdgeDisplayProps) {
  if (pAgent === null || pMarket === null) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          확률을 입력하면 Edge가 계산됩니다
        </div>
      </div>
    );
  }

  const edge = calculatePredictedEdge(pAgent, pMarket);
  const edgePercent = edge * 100;

  const getEdgeColor = () => {
    if (edge < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (edge < 0.05) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (edge < 0.10) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getEdgeLabel = () => {
    if (edge < 0) return '음수 Edge ⚠️';
    if (edge < 0.05) return 'Edge 부족';
    if (edge < 0.10) return '적정 Edge';
    return '높은 Edge 🔥';
  };

  return (
    <div className={`p-4 rounded-lg border ${getEdgeColor()}`}>
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
