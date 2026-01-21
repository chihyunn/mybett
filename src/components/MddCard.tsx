'use client';

interface MaxDrawdownData {
  maxDrawdown: number;
  maxDrawdownPercent: number;
  peakAmount: number;
  troughAmount: number;
  recoveryStatus: 'recovered' | 'recovering' | 'none';
  currentDrawdown: number;
  currentDrawdownPercent: number;
}

interface MddCardProps {
  data: MaxDrawdownData;
}

export default function MddCard({ data }: MddCardProps) {
  const mddPercent = Math.abs(data.maxDrawdownPercent * 100);
  const currentDdPercent = Math.abs(data.currentDrawdownPercent * 100);

  // Severity color based on MDD percentage
  const getSeverityColor = (percent: number) => {
    if (percent >= 20) return 'text-red-600 bg-red-50';
    if (percent >= 10) return 'text-orange-600 bg-orange-50';
    if (percent >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusBadge = () => {
    switch (data.recoveryStatus) {
      case 'recovered':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            회복 완료
          </span>
        );
      case 'recovering':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
            회복 중
          </span>
        );
      default:
        return null;
    }
  };

  if (data.maxDrawdown === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-500 mb-1">Max Drawdown</div>
        <div className="text-2xl font-bold text-green-600">0%</div>
        <div className="text-xs text-gray-400 mt-1">손실 기록 없음</div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow p-4 ${getSeverityColor(mddPercent)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium opacity-80">Max Drawdown</div>
        {getStatusBadge()}
      </div>

      <div className="text-3xl font-bold">
        -{mddPercent.toFixed(1)}%
      </div>

      <div className="text-sm mt-1 opacity-80">
        ${Math.abs(data.maxDrawdown).toLocaleString()} 손실
      </div>

      <div className="mt-3 pt-3 border-t border-current opacity-20" />

      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
        <div>
          <div className="opacity-60">최고점</div>
          <div className="font-medium">${data.peakAmount.toLocaleString()}</div>
        </div>
        <div>
          <div className="opacity-60">최저점</div>
          <div className="font-medium">${data.troughAmount.toLocaleString()}</div>
        </div>
      </div>

      {data.currentDrawdown < 0 && (
        <div className="mt-3 pt-2 border-t border-current opacity-20">
          <div className="text-xs opacity-60">현재 드로우다운</div>
          <div className="text-sm font-medium">
            -{currentDdPercent.toFixed(1)}% (${Math.abs(data.currentDrawdown).toLocaleString()})
          </div>
        </div>
      )}
    </div>
  );
}
