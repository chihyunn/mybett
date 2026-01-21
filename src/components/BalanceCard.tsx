'use client';

import AnimatedNumber from './AnimatedNumber';

interface BalanceCardProps {
  initialAmount: number;
  currentAmount: number;
}

export default function BalanceCard({ initialAmount, currentAmount }: BalanceCardProps) {
  const difference = currentAmount - initialAmount;
  const percentChange = initialAmount > 0 ? ((difference / initialAmount) * 100) : 0;

  return (
    <div
      className="p-6 rounded-lg shadow"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium" style={{ color: 'var(--muted)' }}>현재 밸런스</h3>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          시작: $<AnimatedNumber value={initialAmount} />
        </span>
      </div>
      <div className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
        $<AnimatedNumber value={currentAmount} duration={1000} />
      </div>
      <div className={`text-sm mt-2 ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {difference >= 0 ? '▲' : '▼'} $<AnimatedNumber value={Math.abs(difference)} /> (
        <AnimatedNumber value={percentChange} decimals={1} prefix={percentChange >= 0 ? '+' : ''} suffix="%" />)
      </div>
    </div>
  );
}
