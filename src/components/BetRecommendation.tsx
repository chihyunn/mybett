'use client';

import { useState } from 'react';
import { recommendBetAmount, getRecommendationMessage, calculateKellyBetAmounts } from '@/lib/betting';
import { calculatePredictedEdge } from '@/lib/edge';

interface BetRecommendationProps {
  pAgent: number | null;
  pMarket: number | null;
  balance: number;
}

export default function BetRecommendation({
  pAgent,
  pMarket,
  balance,
}: BetRecommendationProps) {
  const [mode, setMode] = useState<'fixed' | 'kelly'>('fixed');

  if (pAgent === null || pMarket === null) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          Edge가 계산되면 베팅 추천이 표시됩니다
        </div>
      </div>
    );
  }

  const edge = calculatePredictedEdge(pAgent, pMarket);
  const recommended = recommendBetAmount(edge, balance);
  const message = getRecommendationMessage(edge);
  const kelly = calculateKellyBetAmounts(pAgent, pMarket, balance);

  const isRecommended = edge > 0;

  // Check if balance limited the recommendation
  const baseRecommendation = edge >= 0.10 ? 350 : edge >= 0.05 ? 200 : 0;
  const isBalanceLimited = recommended !== null && recommended < baseRecommendation;

  return (
    <div
      className={`p-4 rounded-lg border ${
        isRecommended
          ? 'bg-blue-50 border-blue-200'
          : edge < 0
          ? 'bg-red-50 border-red-200'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      {/* Mode Toggle */}
      <div className="flex justify-center gap-1 mb-3">
        <button
          onClick={() => setMode('fixed')}
          className={`px-2 py-1 text-xs rounded ${
            mode === 'fixed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          고정 금액
        </button>
        <button
          onClick={() => setMode('kelly')}
          className={`px-2 py-1 text-xs rounded ${
            mode === 'kelly'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Kelly
        </button>
      </div>

      <div className="text-center">
        {mode === 'fixed' ? (
          // Fixed Amount Mode
          <>
            <div className="text-sm font-medium mb-1">베팅 추천</div>
            {recommended !== null && recommended > 0 ? (
              <>
                <div className="text-3xl font-bold text-blue-600">
                  ${recommended.toLocaleString()}
                </div>
                <div className="text-sm mt-1 text-blue-700">{message}</div>
                {isBalanceLimited && (
                  <div className="text-xs mt-2 text-orange-600">
                    ⚠️ 밸런스 제한
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-gray-600">베팅 비추천</div>
                <div className="text-sm mt-1 text-gray-500">{message}</div>
              </>
            )}
          </>
        ) : (
          // Kelly Mode
          <>
            <div className="text-sm font-medium mb-1">
              Kelly Criterion
              <span className="ml-1 text-purple-600">
                ({(kelly.kellyPercent * 100).toFixed(1)}%)
              </span>
            </div>

            {kelly.kellyPercent > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded p-2">
                    <div className="text-xs text-gray-500">1/4 Kelly</div>
                    <div className="text-sm font-bold text-green-600">
                      ${kelly.quarterKelly.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">안전</div>
                  </div>
                  <div className="bg-white rounded p-2 ring-2 ring-purple-400">
                    <div className="text-xs text-gray-500">1/2 Kelly</div>
                    <div className="text-lg font-bold text-purple-600">
                      ${kelly.halfKelly.toLocaleString()}
                    </div>
                    <div className="text-xs text-purple-500">추천</div>
                  </div>
                  <div className="bg-white rounded p-2">
                    <div className="text-xs text-gray-500">Full Kelly</div>
                    <div className="text-sm font-bold text-red-600">
                      ${kelly.fullKelly.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">공격</div>
                  </div>
                </div>
                <div className="text-xs text-purple-700">
                  Kelly: {(kelly.kellyPercent * 100).toFixed(1)}% of bankroll
                </div>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold text-gray-600">베팅 비추천</div>
                <div className="text-sm mt-1 text-gray-500">
                  Edge ≤ 0: Kelly = 0%
                </div>
              </>
            )}
          </>
        )}

        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          밸런스: ${balance.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
