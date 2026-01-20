'use client';

interface ProbabilityInputProps {
  pAgent: string;
  pMarket: string;
  onPAgentChange: (value: string) => void;
  onPMarketChange: (value: string) => void;
  disabled?: boolean;
}

export default function ProbabilityInput({
  pAgent,
  pMarket,
  onPAgentChange,
  onPMarketChange,
  disabled,
}: ProbabilityInputProps) {
  const validateInput = (value: string): string | null => {
    if (value === '') return null;
    const num = parseFloat(value);
    if (isNaN(num)) return '숫자를 입력하세요';
    if (num < 0 || num > 1) return '0~1 범위로 입력하세요';
    return null;
  };

  const pAgentError = validateInput(pAgent);
  const pMarketError = validateInput(pMarket);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          에이전트 확률 (P_agent)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={pAgent}
            onChange={(e) => onPAgentChange(e.target.value)}
            disabled={disabled}
            placeholder="0.00 ~ 1.00"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
              pAgentError
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {pAgent && !pAgentError && (
            <span className="absolute right-3 top-2 text-gray-500">
              ({(parseFloat(pAgent) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
        {pAgentError && (
          <p className="mt-1 text-sm text-red-500">{pAgentError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">내 에이전트의 예측 승리 확률</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          시장 확률 (P_market)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={pMarket}
            onChange={(e) => onPMarketChange(e.target.value)}
            disabled={disabled}
            placeholder="0.00 ~ 1.00"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
              pMarketError
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {pMarket && !pMarketError && (
            <span className="absolute right-3 top-2 text-gray-500">
              ({(parseFloat(pMarket) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
        {pMarketError && (
          <p className="mt-1 text-sm text-red-500">{pMarketError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">베팅 시장의 내재 확률</p>
      </div>
    </div>
  );
}
