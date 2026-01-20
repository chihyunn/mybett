'use client';

interface BalanceCardProps {
  initialAmount: number;
  currentAmount: number;
}

export default function BalanceCard({ initialAmount, currentAmount }: BalanceCardProps) {
  const difference = currentAmount - initialAmount;
  const percentChange = initialAmount > 0 ? ((difference / initialAmount) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">현재 밸런스</h3>
        <span className="text-xs text-gray-400">시작: ${initialAmount.toLocaleString()}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">
        ${currentAmount.toLocaleString()}
      </div>
      <div className={`text-sm mt-2 ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {difference >= 0 ? '▲' : '▼'} ${Math.abs(difference).toLocaleString()} ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)
      </div>
    </div>
  );
}
