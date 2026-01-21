'use client';

interface ProfitCardProps {
  totalProfit: number;
}

export default function ProfitCard({ totalProfit }: ProfitCardProps) {
  const isProfit = totalProfit >= 0;

  return (
    <div
      className="p-6 rounded-lg shadow"
      style={{
        background: isProfit ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        border: `1px solid ${isProfit ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
      }}
    >
      <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>누적 수익</h3>
      <div className={`text-3xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
        {isProfit ? '+' : ''}${totalProfit.toLocaleString()}
      </div>
      <div className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
        {isProfit ? '수익 중 📈' : '손실 중 📉'}
      </div>
    </div>
  );
}
