'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

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

const SPORT_COLORS: Record<string, string> = {
  NBA: '#f97316',
  MLB: '#dc2626',
  NHL: '#1d4ed8',
  NFL: '#15803d',
};

export default function SportSelector({ value, onChange, disabled }: SportSelectorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
            <div key={i} className="h-16 w-24 rounded-xl" style={{ background: 'var(--card-border)' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
        스포츠 선택
      </label>
      <div className="flex gap-3">
        {sports.map((sport) => {
          const isSelected = value === sport.id;
          const activeColor = SPORT_COLORS[sport.name] || '#3b82f6';

          return (
            <button
              key={sport.id}
              type="button"
              onClick={() => onChange(sport.id)}
              disabled={disabled}
              className="flex-1 py-4 px-4 rounded-xl font-medium transition-all duration-200 flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                isSelected
                  ? {
                      backgroundColor: activeColor,
                      color: 'white',
                      boxShadow: `0 0 0 2px ${activeColor}40`,
                    }
                  : {
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      color: 'var(--foreground)',
                    }
              }
            >
              <span className="text-sm font-semibold">{sport.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
