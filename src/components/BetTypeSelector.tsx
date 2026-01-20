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
      <div className="animate-pulse space-y-2">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const selectedBetType = betTypes.find((bt) => bt.id === betTypeId);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          베팅 타입
        </label>
        <select
          value={betTypeId}
          onChange={(e) => onBetTypeChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">베팅 타입 선택...</option>
          {betTypes.map((bt) => (
            <option key={bt.id} value={bt.id}>
              {bt.name} ({bt.code})
            </option>
          ))}
        </select>
        {selectedBetType?.description && (
          <p className="mt-1 text-xs text-gray-500">{selectedBetType.description}</p>
        )}
      </div>

      {betTypeId && teamAName && teamBName && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            베팅 대상 팀
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelectedTeamChange('A')}
              disabled={disabled}
              className={`py-3 px-4 rounded-md font-medium transition-colors ${
                selectedTeam === 'A'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {teamAName}
            </button>
            <button
              type="button"
              onClick={() => onSelectedTeamChange('B')}
              disabled={disabled}
              className={`py-3 px-4 rounded-md font-medium transition-colors ${
                selectedTeam === 'B'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {teamBName}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
