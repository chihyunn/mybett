'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

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

const BET_TYPE_STYLES: Record<string, { icon: string; activeColor: string }> = {
  ML: { icon: '', activeColor: '#10b981' },
  SPREAD: { icon: '', activeColor: '#8b5cf6' },
  TOTAL: { icon: '', activeColor: '#f59e0b' },
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
            <div key={i} className="h-12 flex-1 rounded-lg" style={{ background: 'var(--card-border)' }}></div>
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
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          베팅 타입
        </label>
        <div className="flex gap-2">
          {betTypes.map((bt) => {
            const isSelected = betTypeId === bt.id;
            const style = BET_TYPE_STYLES[bt.code] || { icon: '', activeColor: '#6b7280' };

            return (
              <button
                key={bt.id}
                type="button"
                onClick={() => onBetTypeChange(bt.id)}
                disabled={disabled}
                className="flex-1 py-3 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={
                  isSelected
                    ? {
                        backgroundColor: style.activeColor,
                        color: 'white',
                        boxShadow: `0 0 0 2px ${style.activeColor}40`,
                      }
                    : {
                        backgroundColor: isDark ? '#374151' : '#f3f4f6',
                        color: 'var(--foreground)',
                      }
                }
              >
                <span className="text-sm">{bt.code}</span>
              </button>
            );
          })}
        </div>
        {selectedBetType?.description && (
          <p className="mt-2 text-xs text-center" style={{ color: 'var(--muted)' }}>
            {selectedBetType.description}
          </p>
        )}
      </div>

      {/* Team Selection */}
      {betTypeId && teamAName && teamBName && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            베팅 대상
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSelectedTeamChange('A')}
              disabled={disabled}
              className="py-4 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                selectedTeam === 'A'
                  ? {
                      backgroundColor: '#2563eb',
                      color: 'white',
                      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.4)',
                      transform: 'scale(1.02)',
                    }
                  : {
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      color: 'var(--foreground)',
                    }
              }
            >
              <div className="text-xs mb-1" style={{ opacity: 0.7 }}>
                {selectedTeam === 'A' ? '선택됨' : 'HOME'}
              </div>
              <div className="truncate">{teamAName}</div>
            </button>
            <button
              type="button"
              onClick={() => onSelectedTeamChange('B')}
              disabled={disabled}
              className="py-4 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                selectedTeam === 'B'
                  ? {
                      backgroundColor: '#2563eb',
                      color: 'white',
                      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.4)',
                      transform: 'scale(1.02)',
                    }
                  : {
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      color: 'var(--foreground)',
                    }
              }
            >
              <div className="text-xs mb-1" style={{ opacity: 0.7 }}>
                {selectedTeam === 'B' ? '선택됨' : 'AWAY'}
              </div>
              <div className="truncate">{teamBName}</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
