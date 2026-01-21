'use client';

import { useEffect, useState, useMemo } from 'react';

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
}

function SearchableSelect({
  teams,
  value,
  onChange,
  excludeId,
  placeholder,
  label,
  disabled,
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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        className={`
          w-full px-3 py-2 border rounded-lg cursor-pointer transition-all
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedTeam ? (
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedTeam.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="팀 검색..."
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-400"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredTeams.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                검색 결과 없음
              </div>
            ) : (
              filteredTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleSelect(team.id)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors text-sm"
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
      <div className="text-gray-500 text-sm p-6 bg-gray-50 rounded-xl text-center">
        👆 먼저 스포츠를 선택하세요
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg">{error}</div>;
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
          label="🏠 HOME"
          disabled={disabled}
        />
        <SearchableSelect
          teams={teams}
          value={teamBId}
          onChange={onTeamBChange}
          excludeId={teamAId}
          placeholder="원정팀 선택..."
          label="✈️ AWAY"
          disabled={disabled}
        />
      </div>

      {isSameTeam && (
        <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg text-center">
          ⚠️ 같은 팀끼리 매치업 불가
        </div>
      )}

      {teamAId && teamBId && !isSameTeam && (
        <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="text-xs text-gray-500 mb-1">MATCHUP</div>
          <div className="text-lg font-bold text-gray-800">
            {teamAName} <span className="text-gray-400 mx-2">vs</span> {teamBName}
          </div>
        </div>
      )}
    </div>
  );
}
