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
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        스포츠 선택
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
      >
        <option value="">스포츠 선택...</option>
        {sports.map((sport) => (
          <option key={sport.id} value={sport.id}>
            {sport.name} ({sport._count.teams}팀)
          </option>
        ))}
      </select>
    </div>
  );
}
