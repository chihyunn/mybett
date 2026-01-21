'use client';

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
        <span className="text-xs" style={{ color: 'var(--muted)' }}>시작: ${initialAmount.toLocaleString()}</span>
      </div>
      <div className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
        ${currentAmount.toLocaleString()}
      </div>
      <div className={`text-sm mt-2 ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {difference >= 0 ? '▲' : '▼'} ${Math.abs(difference).toLocaleString()} ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)
      </div>
    </div>
  );
}
