'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Team {
  id: string;
  name: string;
}

interface TeamSelectorProps {
  sportId: string;
  teamAId: string;
  teamBId: string;
  onTeamAChange: (teamId: string) => void;
  onTeamBChange: (teamId: string) => void;
  disabled?: boolean;
}

interface SearchableSelectProps {
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
  excludeId?: string;
  placeholder: string;
  label: string;
  disabled?: boolean;
  isDark: boolean;
}

function SearchableSelect({
  teams,
  value,
  onChange,
  excludeId,
  placeholder,
  label,
  disabled,
  isDark,
}: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selectedTeam = teams.find((t) => t.id === value);

  const filteredTeams = useMemo(() => {
    return teams
      .filter((t) => t.id !== excludeId)
      .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [teams, excludeId, search]);

  const handleSelect = (teamId: string) => {
    onChange(teamId);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
        {label}
      </label>
      <div
        className="w-full px-3 py-2 rounded-lg cursor-pointer transition-all"
        style={{
          background: disabled ? (isDark ? '#1f2937' : '#f3f4f6') : 'var(--card-bg)',
          border: `1px solid ${isOpen ? '#3b82f6' : 'var(--card-border)'}`,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedTeam ? (
          <div className="flex items-center justify-between">
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>{selectedTeam.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              style={{ color: 'var(--muted)' }}
            >
              ✕
            </button>
          </div>
        ) : (
          <span style={{ color: 'var(--muted)' }}>{placeholder}</span>
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className="absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
          }}
        >
          <div className="p-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="팀 검색..."
              className="w-full px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--foreground)',
              }}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredTeams.length === 0 ? (
              <div className="p-3 text-sm text-center" style={{ color: 'var(--muted)' }}>
                검색 결과 없음
              </div>
            ) : (
              filteredTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleSelect(team.id)}
                  className="w-full px-4 py-2 text-left transition-colors text-sm"
                  style={{
                    color: 'var(--foreground)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {team.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default function TeamSelector({
  sportId,
  teamAId,
  teamBId,
  onTeamAChange,
  onTeamBChange,
  disabled,
}: TeamSelectorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sportId) {
      setTeams([]);
      return;
    }

    async function fetchTeams() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sports/${sportId}/teams`);
        if (!res.ok) throw new Error('Failed to fetch teams');
        const data = await res.json();
        setTeams(data);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
        setError('팀 목록을 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, [sportId]);

  const isSameTeam = teamAId && teamBId && teamAId === teamBId;
  const teamAName = teams.find((t) => t.id === teamAId)?.name;
  const teamBName = teams.find((t) => t.id === teamBId)?.name;

  if (!sportId) {
    return (
      <div
        className="text-sm p-6 rounded-xl text-center"
        style={{ background: 'var(--background)', color: 'var(--muted)' }}
      >
        먼저 스포츠를 선택하세요
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 animate-pulse">
        <div className="h-12 rounded-lg" style={{ background: 'var(--card-border)' }}></div>
        <div className="h-12 rounded-lg" style={{ background: 'var(--card-border)' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="text-sm p-4 rounded-lg"
        style={{
          background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
          color: isDark ? '#f87171' : '#b91c1c',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SearchableSelect
          teams={teams}
          value={teamAId}
          onChange={onTeamAChange}
          excludeId={teamBId}
          placeholder="홈팀 선택..."
          label="HOME"
          disabled={disabled}
          isDark={isDark}
        />
        <SearchableSelect
          teams={teams}
          value={teamBId}
          onChange={onTeamBChange}
          excludeId={teamAId}
          placeholder="원정팀 선택..."
          label="AWAY"
          disabled={disabled}
          isDark={isDark}
        />
      </div>

      {isSameTeam && (
        <div
          className="text-sm font-medium p-3 rounded-lg text-center"
          style={{
            background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
            color: isDark ? '#f87171' : '#b91c1c',
          }}
        >
          같은 팀끼리 매치업 불가
        </div>
      )}

      {teamAId && teamBId && !isSameTeam && (
        <div
          className="text-center py-4 rounded-xl"
          style={{
            background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'linear-gradient(to right, #eff6ff, #eef2ff)',
          }}
        >
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>MATCHUP</div>
          <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            {teamAName} <span style={{ color: 'var(--muted)' }} className="mx-2">vs</span> {teamBName}
          </div>
        </div>
      )}
    </div>
  );
}
