import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface TeamStreak {
  teamId: string;
  teamName: string;
  streak: number; // negative = losing streak, positive = winning streak
  lastResults: (0 | 1)[];
}

interface StreakAnalysis {
  globalStreak: number; // negative = losing streak
  globalLastResults: (0 | 1)[];
  isGlobalWarning: boolean; // 3+ consecutive losses
  teamStreaks: TeamStreak[];
  warningTeams: TeamStreak[]; // teams with 3+ consecutive losses
}

export async function GET() {
  try {
    // Get recent settled bets ordered by settledAt
    const recentBets = await prisma.bet.findMany({
      where: { result: { not: null } },
      orderBy: { settledAt: 'desc' },
      take: 20,
      include: {
        teamA: { select: { id: true, name: true } },
        teamB: { select: { id: true, name: true } },
      },
    });

    if (recentBets.length === 0) {
      return NextResponse.json({
        globalStreak: 0,
        globalLastResults: [],
        isGlobalWarning: false,
        teamStreaks: [],
        warningTeams: [],
      });
    }

    // Calculate global streak
    const globalResults = recentBets.map((b) => b.result as 0 | 1);
    const globalStreak = calculateStreak(globalResults);
    const isGlobalWarning = globalStreak <= -3;

    // Calculate per-team streaks
    const teamBets = new Map<string, { name: string; results: (0 | 1)[] }>();

    for (const bet of recentBets) {
      // Track the team we bet on
      const bettedTeam = bet.selectedTeam === 'A' ? bet.teamA : bet.teamB;

      if (!teamBets.has(bettedTeam.id)) {
        teamBets.set(bettedTeam.id, { name: bettedTeam.name, results: [] });
      }
      teamBets.get(bettedTeam.id)!.results.push(bet.result as 0 | 1);
    }

    const teamStreaks: TeamStreak[] = [];
    const warningTeams: TeamStreak[] = [];

    for (const [teamId, data] of teamBets) {
      const streak = calculateStreak(data.results);
      const teamStreak: TeamStreak = {
        teamId,
        teamName: data.name,
        streak,
        lastResults: data.results.slice(0, 5),
      };
      teamStreaks.push(teamStreak);

      if (streak <= -3) {
        warningTeams.push(teamStreak);
      }
    }

    // Sort by streak (worst first)
    teamStreaks.sort((a, b) => a.streak - b.streak);
    warningTeams.sort((a, b) => a.streak - b.streak);

    const response: StreakAnalysis = {
      globalStreak,
      globalLastResults: globalResults.slice(0, 10),
      isGlobalWarning,
      teamStreaks,
      warningTeams,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to analyze streaks:', error);
    return NextResponse.json(
      { error: '연패 분석 실패' },
      { status: 500 }
    );
  }
}

/**
 * Calculate current streak from results array (most recent first)
 * Returns negative number for losing streak, positive for winning streak
 */
function calculateStreak(results: (0 | 1)[]): number {
  if (results.length === 0) return 0;

  const firstResult = results[0];
  let streak = 0;

  for (const result of results) {
    if (result === firstResult) {
      streak++;
    } else {
      break;
    }
  }

  // Return negative for losing streak
  return firstResult === 1 ? streak : -streak;
}
