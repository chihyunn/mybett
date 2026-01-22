'use client';

import { useState, useEffect, useMemo } from 'react';
import SportSelector from '@/components/SportSelector';
import TeamSelector from '@/components/TeamSelector';
import BetTypeSelector from '@/components/BetTypeSelector';
import ProbabilityInput from '@/components/ProbabilityInput';
import EdgeDisplay from '@/components/EdgeDisplay';
import BetRecommendation from '@/components/BetRecommendation';
import StreakWarningBanner from '@/components/StreakWarningBanner';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
            <div className="h-8 rounded w-32" style={{ background: 'var(--card-border)' }}></div>
            <div className="h-32 rounded-lg" style={{ background: 'var(--card-border)' }}></div>
            <div className="h-32 rounded-lg" style={{ background: 'var(--card-border)' }}></div>
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
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--foreground)' }}>예측 입력</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sport Selection */}
          <div
            className="p-4 rounded-lg shadow"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <SportSelector
              value={sportId}
              onChange={setSportId}
              disabled={submitting}
            />
          </div>

          {/* Team Selection */}
          <div
            className="p-4 rounded-lg shadow"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>매치업 선택</h2>
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
            <div
              className="p-4 rounded-lg shadow"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>베팅 설정</h2>
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
            <div
              className="p-4 rounded-lg shadow"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>확률 입력</h2>
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
            <div
              className="p-4 rounded-lg"
              style={{
                background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
                color: isDark ? '#f87171' : '#b91c1c',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="p-4 rounded-lg"
              style={{
                background: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
                border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0'}`,
                color: isDark ? '#4ade80' : '#15803d',
              }}
            >
              {success}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed transition-colors"
              style={{
                opacity: !isValid || submitting ? 0.5 : 1,
                background: !isValid || submitting ? (isDark ? '#374151' : '#d1d5db') : undefined,
              }}
            >
              {submitting ? '처리 중...' : '베팅 기록 저장'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={submitting}
              className="py-3 px-6 font-medium rounded-lg disabled:opacity-50 transition-colors"
              style={{
                background: isDark ? '#374151' : '#e5e7eb',
                color: isDark ? '#d1d5db' : '#374151',
              }}
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
