'use client';

import { useEffect, useState } from 'react';

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

  if (!sportId) {
    return (
      <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-md">
        먼저 스포츠를 선택하세요
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            팀 A (홈)
          </label>
          <select
            value={teamAId}
            onChange={(e) => onTeamAChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">팀 선택...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            팀 B (어웨이)
          </label>
          <select
            value={teamBId}
            onChange={(e) => onTeamBChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">팀 선택...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isSameTeam && (
        <div className="text-red-500 text-sm font-medium">
          ⚠️ 같은 팀끼리 매치업 불가
        </div>
      )}

      {teamAId && teamBId && !isSameTeam && (
        <div className="text-center text-lg font-semibold text-gray-800 py-2 bg-gray-50 rounded-md">
          {teams.find((t) => t.id === teamAId)?.name} vs{' '}
          {teams.find((t) => t.id === teamBId)?.name}
        </div>
      )}
    </div>
  );
}
