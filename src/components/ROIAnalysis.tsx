'use client';

import { useState, useEffect } from 'react';
import AnimatedNumber from './AnimatedNumber';

interface ROIData {
  category: string;
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWagered: number;
  totalProfit: number;
  roi: number;
}

interface ROIResponse {
  overall: ROIData;
  bySport: ROIData[];
  byBetType: ROIData[];
}

export default function ROIAnalysis() {
  const [data, setData] = useState<ROIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'sport' | 'betType'>('sport');

  useEffect(() => {
    async function fetchROI() {
      try {
        const res = await fetch('/api/analysis/roi');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch ROI:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchROI();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-lg" style={{ background: 'var(--card-border)' }}></div>
        <div className="h-64 rounded-lg" style={{ background: 'var(--card-border)' }}></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--muted)' }}>
        ROI 데이터를 불러올 수 없습니다
      </div>
    );
  }

  const displayData = view === 'sport' ? data.bySport : data.byBetType;

  return (
    <div className="space-y-6">
      {/* Overall ROI Card */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: data.overall.roi >= 0
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
          border: `1px solid ${data.overall.roi >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        }}
      >
        <div className="text-center mb-4">
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
            전체 ROI
          </h3>
          <div className={`text-5xl font-bold ${data.overall.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <AnimatedNumber
              value={data.overall.roi}
              decimals={2}
              duration={1200}
              prefix={data.overall.roi >= 0 ? '+' : ''}
              suffix="%"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              <AnimatedNumber value={data.overall.totalBets} />
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>총 베팅</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              $<AnimatedNumber value={data.overall.totalWagered} />
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>총 베팅액</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${data.overall.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.overall.totalProfit >= 0 ? '+' : '-'}$<AnimatedNumber value={Math.abs(data.overall.totalProfit)} />
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>총 수익</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${data.overall.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
              <AnimatedNumber value={data.overall.winRate} decimals={1} suffix="%" />
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>승률</div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('sport')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            view === 'sport'
              ? 'bg-blue-600 text-white'
              : ''
          }`}
          style={view !== 'sport' ? { background: 'var(--card-bg)', color: 'var(--muted)' } : undefined}
        >
          스포츠별 ROI
        </button>
        <button
          onClick={() => setView('betType')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            view === 'betType'
              ? 'bg-blue-600 text-white'
              : ''
          }`}
          style={view !== 'betType' ? { background: 'var(--card-bg)', color: 'var(--muted)' } : undefined}
        >
          타입별 ROI
        </button>
      </div>

      {/* ROI Breakdown */}
      <div className="space-y-3">
        {displayData.length === 0 ? (
          <div className="p-8 text-center rounded-lg" style={{ background: 'var(--card-bg)', color: 'var(--muted)' }}>
            데이터가 없습니다
          </div>
        ) : (
          displayData.map((item, index) => (
            <ROIBar key={item.category} data={item} rank={index + 1} />
          ))
        )}
      </div>
    </div>
  );
}

function ROIBar({ data, rank }: { data: ROIData; rank: number }) {
  const maxROI = 50; // Scale for visual bar
  const barWidth = Math.min(Math.abs(data.roi), maxROI) / maxROI * 100;
  const isPositive = data.roi >= 0;

  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: rank <= 3 ? 'var(--accent)' : 'var(--card-border)',
              color: rank <= 3 ? 'white' : 'var(--muted)'
            }}
          >
            {rank}
          </span>
          <span className="font-medium" style={{ color: 'var(--foreground)' }}>
            {data.category}
          </span>
        </div>
        <div className={`text-xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <AnimatedNumber
            value={data.roi}
            decimals={2}
            prefix={isPositive ? '+' : ''}
            suffix="%"
          />
        </div>
      </div>

      {/* ROI Bar */}
      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--background)' }}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div>
          <span style={{ color: 'var(--muted)' }}>베팅: </span>
          <span style={{ color: 'var(--foreground)' }}>{data.totalBets}</span>
        </div>
        <div>
          <span style={{ color: 'var(--muted)' }}>승률: </span>
          <span className={data.winRate >= 50 ? 'text-green-500' : 'text-red-500'}>
            {data.winRate.toFixed(1)}%
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--muted)' }}>베팅액: </span>
          <span style={{ color: 'var(--foreground)' }}>${data.totalWagered.toLocaleString()}</span>
        </div>
        <div>
          <span style={{ color: 'var(--muted)' }}>수익: </span>
          <span className={data.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}>
            {data.totalProfit >= 0 ? '+' : ''}${data.totalProfit.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
