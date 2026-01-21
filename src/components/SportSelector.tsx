'use client';

import { useEffect, useState } from 'react';

interface Sport {
  id: string;
  name: string;
  _count: { teams: number };
}

interface SportSelectorProps {
  value: string;
  onChange: (sportId: string) => void;
  disabled?: boolean;
}

const SPORT_ICONS: Record<string, string> = {
  NBA: '🏀',
  MLB: '⚾',
  NHL: '🏒',
};

const SPORT_COLORS: Record<string, { active: string; inactive: string }> = {
  NBA: {
    active: 'bg-orange-500 text-white ring-2 ring-orange-300',
    inactive: 'bg-gray-100 text-gray-700 hover:bg-orange-100',
  },
  MLB: {
    active: 'bg-red-600 text-white ring-2 ring-red-300',
    inactive: 'bg-gray-100 text-gray-700 hover:bg-red-100',
  },
  NHL: {
    active: 'bg-blue-700 text-white ring-2 ring-blue-300',
    inactive: 'bg-gray-100 text-gray-700 hover:bg-blue-100',
  },
};

export default function SportSelector({ value, onChange, disabled }: SportSelectorProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSports() {
      try {
        const res = await fetch('/api/sports');
        const data = await res.json();
        setSports(data);
      } catch (error) {
        console.error('Failed to fetch sports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSports();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        스포츠 선택
      </label>
      <div className="flex gap-3">
        {sports.map((sport) => {
          const isSelected = value === sport.id;
          const icon = SPORT_ICONS[sport.name] || '🎯';
          const colors = SPORT_COLORS[sport.name] || {
            active: 'bg-blue-600 text-white ring-2 ring-blue-300',
            inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          };

          return (
            <button
              key={sport.id}
              type="button"
              onClick={() => onChange(sport.id)}
              disabled={disabled}
              className={`
                flex-1 py-4 px-4 rounded-xl font-medium transition-all duration-200
                flex flex-col items-center gap-1
                ${isSelected ? colors.active : colors.inactive}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-semibold">{sport.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
