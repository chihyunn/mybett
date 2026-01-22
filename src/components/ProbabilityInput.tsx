'use client';

import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const validateInput = (value: string): string | null => {
    if (value === '') return null;
    const num = parseFloat(value);
    if (isNaN(num)) return '숫자를 입력하세요';
    if (num < 0 || num > 1) return '0~1 범위로 입력하세요';
    return null;
  };

  const pAgentError = validateInput(pAgent);
  const pMarketError = validateInput(pMarket);

  const inputStyle = (hasError: boolean) => ({
    background: disabled ? (isDark ? '#1f2937' : '#f9fafb') : 'var(--card-bg)',
    border: `1px solid ${hasError ? (isDark ? '#ef4444' : '#fca5a5') : 'var(--card-border)'}`,
    color: 'var(--foreground)',
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
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
            className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={inputStyle(!!pAgentError)}
          />
          {pAgent && !pAgentError && (
            <span className="absolute right-3 top-2" style={{ color: 'var(--muted)' }}>
              ({(parseFloat(pAgent) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
        {pAgentError && (
          <p className="mt-1 text-sm text-red-500">{pAgentError}</p>
        )}
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>내 에이전트의 예측 승리 확률</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
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
            className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={inputStyle(!!pMarketError)}
          />
          {pMarket && !pMarketError && (
            <span className="absolute right-3 top-2" style={{ color: 'var(--muted)' }}>
              ({(parseFloat(pMarket) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
        {pMarketError && (
          <p className="mt-1 text-sm text-red-500">{pMarketError}</p>
        )}
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>베팅 시장의 내재 확률</p>
      </div>
    </div>
  );
}
