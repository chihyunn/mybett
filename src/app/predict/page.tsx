'use client';

import { useState, useEffect, useMemo } from 'react';
import SportSelector from '@/components/SportSelector';
import TeamSelector from '@/components/TeamSelector';
import BetTypeSelector from '@/components/BetTypeSelector';
import ProbabilityInput from '@/components/ProbabilityInput';
import EdgeDisplay from '@/components/EdgeDisplay';
import BetRecommendation from '@/components/BetRecommendation';
import StreakWarningBanner from '@/components/StreakWarningBanner';

interface Team {
  id: string;
  name: string;
}

interface TeamStreak {
  teamId: string;
  teamName: string;
  streak: number;
}

interface StreakData {
  globalStreak: number;
  isGlobalWarning: boolean;
  teamStreaks: TeamStreak[];
  warningTeams: TeamStreak[];
}

export default function PredictPage() {
  // Form state
  const [sportId, setSportId] = useState('');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [betTypeId, setBetTypeId] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B' | ''>('');
  const [pAgent, setPAgent] = useState('');
  const [pMarket, setPMarket] = useState('');

  // UI state
  const [teams, setTeams] = useState<Team[]>([]);
  const [balance, setBalance] = useState(5000);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  // Fetch teams when sport changes
  useEffect(() => {
    if (!sportId) {
      setTeams([]);
      setTeamAId('');
      setTeamBId('');
      return;
    }

    async function fetchTeams() {
      try {
        const res = await fetch(`/api/sports/${sportId}/teams`);
        const data = await res.json();
        setTeams(data);
        setTeamAId('');
        setTeamBId('');
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      }
    }
    fetchTeams();
  }, [sportId]);

  // Fetch current balance and streak data
  useEffect(() => {
    async function fetchData() {
      try {
        const [balanceRes, streakRes] = await Promise.all([
          fetch('/api/balance'),
          fetch('/api/analysis/streak'),
        ]);
        const balanceData = await balanceRes.json();
        const streakDataRes = await streakRes.json();
        setBalance(balanceData.currentAmount);
        setStreakData(streakDataRes);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Parse probabilities
  const parsedPAgent = useMemo(() => {
    const val = parseFloat(pAgent);
    return !isNaN(val) && val >= 0 && val <= 1 ? val : null;
  }, [pAgent]);

  const parsedPMarket = useMemo(() => {
    const val = parseFloat(pMarket);
    return !isNaN(val) && val >= 0 && val <= 1 ? val : null;
  }, [pMarket]);

  // Get team names
  const teamAName = teams.find((t) => t.id === teamAId)?.name;
  const teamBName = teams.find((t) => t.id === teamBId)?.name;

  // Get streak warning for selected team
  const streakWarning = useMemo(() => {
    if (!streakData) return undefined;

    const selectedTeamId = selectedTeam === 'A' ? teamAId : selectedTeam === 'B' ? teamBId : '';
    const selectedTeamName = selectedTeam === 'A' ? teamAName : teamBName;

    const teamStreakData = streakData.teamStreaks.find((t) => t.teamId === selectedTeamId);

    return {
      globalStreak: streakData.globalStreak,
      teamStreak: teamStreakData?.streak,
      teamName: selectedTeamName,
    };
  }, [streakData, selectedTeam, teamAId, teamBId, teamAName, teamBName]);

  // Form validation
  const isValid = useMemo(() => {
    return (
      sportId &&
      teamAId &&
      teamBId &&
      teamAId !== teamBId &&
      betTypeId &&
      selectedTeam &&
      parsedPAgent !== null &&
      parsedPMarket !== null
    );
  }, [sportId, teamAId, teamBId, betTypeId, selectedTeam, parsedPAgent, parsedPMarket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportId,
          teamAId,
          teamBId,
          selectedTeam,
          betTypeId,
          pAgent: parsedPAgent,
          pMarket: parsedPMarket,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '베팅 생성 실패');
      }

      setSuccess(
        `베팅이 생성되었습니다! Edge: ${(data.predictedEdge * 100).toFixed(1)}%, 추천금액: ${
          data.recommendedAmount ? `$${data.recommendedAmount}` : '비추천'
        }`
      );

      // Reset form after success
      setTimeout(() => {
        setPAgent('');
        setPMarket('');
        setSelectedTeam('');
        setBetTypeId('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '베팅 생성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSportId('');
    setTeamAId('');
    setTeamBId('');
    setBetTypeId('');
    setSelectedTeam('');
    setPAgent('');
    setPMarket('');
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="py-4 md:py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <StreakWarningBanner />
      <div className={`py-4 md:py-8 ${streakData?.isGlobalWarning ? 'pt-16' : ''}`}>
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">예측 입력</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sport Selection */}
          <div className="bg-white p-4 rounded-lg shadow">
            <SportSelector
              value={sportId}
              onChange={setSportId}
              disabled={submitting}
            />
          </div>

          {/* Team Selection */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-3">매치업 선택</h2>
            <TeamSelector
              sportId={sportId}
              teamAId={teamAId}
              teamBId={teamBId}
              onTeamAChange={setTeamAId}
              onTeamBChange={setTeamBId}
              disabled={submitting}
            />
          </div>

          {/* Bet Type Selection */}
          {teamAId && teamBId && teamAId !== teamBId && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-3">베팅 설정</h2>
              <BetTypeSelector
                betTypeId={betTypeId}
                selectedTeam={selectedTeam}
                teamAName={teamAName}
                teamBName={teamBName}
                onBetTypeChange={setBetTypeId}
                onSelectedTeamChange={setSelectedTeam}
                disabled={submitting}
              />
            </div>
          )}

          {/* Probability Input */}
          {betTypeId && selectedTeam && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-3">확률 입력</h2>
              <ProbabilityInput
                pAgent={pAgent}
                pMarket={pMarket}
                onPAgentChange={setPAgent}
                onPMarketChange={setPMarket}
                disabled={submitting}
              />
            </div>
          )}

          {/* Edge & Recommendation Display */}
          {parsedPAgent !== null && parsedPMarket !== null && (
            <div className="grid grid-cols-2 gap-4">
              <EdgeDisplay pAgent={parsedPAgent} pMarket={parsedPMarket} />
              <BetRecommendation
                pAgent={parsedPAgent}
                pMarket={parsedPMarket}
                balance={balance}
                streakWarning={streakWarning}
              />
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '처리 중...' : '베팅 기록 저장'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={submitting}
              className="py-3 px-6 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              초기화
            </button>
          </div>
          </form>
        </div>
      </div>
    </>
  );
}
