'use client';

import { useEffect, useState } from 'react';

interface BetType {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

interface BetTypeSelectorProps {
  betTypeId: string;
  selectedTeam: 'A' | 'B' | '';
  teamAName?: string;
  teamBName?: string;
  onBetTypeChange: (betTypeId: string) => void;
  onSelectedTeamChange: (team: 'A' | 'B') => void;
  disabled?: boolean;
}

const BET_TYPE_STYLES: Record<string, { icon: string; color: string }> = {
  ML: { icon: '🎯', color: 'emerald' },
  SPREAD: { icon: '📊', color: 'purple' },
  TOTAL: { icon: '📈', color: 'amber' },
};

export default function BetTypeSelector({
  betTypeId,
  selectedTeam,
  teamAName,
  teamBName,
  onBetTypeChange,
  onSelectedTeamChange,
  disabled,
}: BetTypeSelectorProps) {
  const [betTypes, setBetTypes] = useState<BetType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBetTypes() {
      try {
        const res = await fetch('/api/bet-types');
        const data = await res.json();
        setBetTypes(data);
      } catch (error) {
        console.error('Failed to fetch bet types:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBetTypes();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 flex-1 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const selectedBetType = betTypes.find((bt) => bt.id === betTypeId);

  return (
    <div className="space-y-4">
      {/* Bet Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          베팅 타입
        </label>
        <div className="flex gap-2">
          {betTypes.map((bt) => {
            const isSelected = betTypeId === bt.id;
            const style = BET_TYPE_STYLES[bt.code] || { icon: '🎲', color: 'gray' };

            return (
              <button
                key={bt.id}
                type="button"
                onClick={() => onBetTypeChange(bt.id)}
                disabled={disabled}
                className={`
                  flex-1 py-3 px-3 rounded-lg font-medium transition-all duration-200
                  flex items-center justify-center gap-2
                  ${
                    isSelected
                      ? `bg-${style.color}-500 text-white ring-2 ring-${style.color}-300`
                      : `bg-gray-100 text-gray-700 hover:bg-${style.color}-100`
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                style={
                  isSelected
                    ? {
                        backgroundColor:
                          style.color === 'emerald'
                            ? '#10b981'
                            : style.color === 'purple'
                            ? '#8b5cf6'
                            : '#f59e0b',
                      }
                    : undefined
                }
              >
                <span>{style.icon}</span>
                <span className="text-sm">{bt.code}</span>
              </button>
            );
          })}
        </div>
        {selectedBetType?.description && (
          <p className="mt-2 text-xs text-gray-500 text-center">
            {selectedBetType.description}
          </p>
        )}
      </div>

      {/* Team Selection */}
      {betTypeId && teamAName && teamBName && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            베팅 대상
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSelectedTeamChange('A')}
              disabled={disabled}
              className={`
                py-4 px-4 rounded-xl font-semibold transition-all duration-200
                ${
                  selectedTeam === 'A'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="text-xs text-opacity-70 mb-1">
                {selectedTeam === 'A' ? '✓ 선택됨' : 'HOME'}
              </div>
              <div className="truncate">{teamAName}</div>
            </button>
            <button
              type="button"
              onClick={() => onSelectedTeamChange('B')}
              disabled={disabled}
              className={`
                py-4 px-4 rounded-xl font-semibold transition-all duration-200
                ${
                  selectedTeam === 'B'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="text-xs text-opacity-70 mb-1">
                {selectedTeam === 'B' ? '✓ 선택됨' : 'AWAY'}
              </div>
              <div className="truncate">{teamBName}</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
