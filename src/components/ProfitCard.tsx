'use client';

interface ProfitCardProps {
  totalProfit: number;
}

export default function ProfitCard({ totalProfit }: ProfitCardProps) {
  const isProfit = totalProfit >= 0;

  return (
    <div className={`p-6 rounded-lg shadow ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
      <h3 className="text-sm font-medium text-gray-500 mb-2">누적 수익</h3>
      <div className={`text-3xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
        {isProfit ? '+' : ''}${totalProfit.toLocaleString()}
      </div>
      <div className="text-sm text-gray-500 mt-2">
        {isProfit ? '수익 중 📈' : '손실 중 📉'}
      </div>
    </div>
  );
}
