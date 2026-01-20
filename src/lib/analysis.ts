import prisma from '@/lib/db';

export interface TeamAnalysis {
  teamId: string;
  teamName: string;
  sportName: string;
  betCount: number;
  avgPredictedEdge: number;
  avgRealizedEdge: number;
  edgeError: number;
  winRate: number;
}

export interface BetTypeAnalysis {
  betTypeCode: string;
  betTypeName: string;
  betCount: number;
  avgPredictedEdge: number;
  avgRealizedEdge: number;
  edgeError: number;
  winRate: number;
}

export interface PortfolioAnalysis {
  totalBets: number;
  avgPredictedEdge: number;
  avgRealizedEdge: number;
  edgeError: number;
  winRate: number;
  totalProfit: number;
}

/**
 * Get team-level edge analysis
 * Analyzes teams that appear in either teamA or teamB of settled bets
 */
export async function getTeamAnalysis(sportId?: string, minBets: number = 1): Promise<TeamAnalysis[]> {
  const settledBets = await prisma.bet.findMany({
    where: {
      result: { not: null },
      ...(sportId && { sportId }),
    },
    include: {
      teamA: true,
      teamB: true,
      sport: true,
    },
  });

  // Group bets by team (teams can appear as teamA or teamB)
  const teamStats: Record<string, {
    teamId: string;
    teamName: string;
    sportName: string;
    predictedEdges: number[];
    realizedEdges: number[];
    wins: number;
  }> = {};

  for (const bet of settledBets) {
    // Add stats for teamA
    if (!teamStats[bet.teamAId]) {
      teamStats[bet.teamAId] = {
        teamId: bet.teamAId,
        teamName: bet.teamA.name,
        sportName: bet.sport.name,
        predictedEdges: [],
        realizedEdges: [],
        wins: 0,
      };
    }
    teamStats[bet.teamAId].predictedEdges.push(bet.predictedEdge);
    teamStats[bet.teamAId].realizedEdges.push(bet.realizedEdge!);
    if (bet.result === 1) teamStats[bet.teamAId].wins++;

    // Add stats for teamB
    if (!teamStats[bet.teamBId]) {
      teamStats[bet.teamBId] = {
        teamId: bet.teamBId,
        teamName: bet.teamB.name,
        sportName: bet.sport.name,
        predictedEdges: [],
        realizedEdges: [],
        wins: 0,
      };
    }
    teamStats[bet.teamBId].predictedEdges.push(bet.predictedEdge);
    teamStats[bet.teamBId].realizedEdges.push(bet.realizedEdge!);
    if (bet.result === 1) teamStats[bet.teamBId].wins++;
  }

  // Calculate averages and filter by minBets
  const results: TeamAnalysis[] = [];

  for (const stats of Object.values(teamStats)) {
    const betCount = stats.predictedEdges.length;
    if (betCount < minBets) continue;

    const avgPredictedEdge = stats.predictedEdges.reduce((a, b) => a + b, 0) / betCount;
    const avgRealizedEdge = stats.realizedEdges.reduce((a, b) => a + b, 0) / betCount;

    results.push({
      teamId: stats.teamId,
      teamName: stats.teamName,
      sportName: stats.sportName,
      betCount,
      avgPredictedEdge,
      avgRealizedEdge,
      edgeError: avgPredictedEdge - avgRealizedEdge,
      winRate: stats.wins / betCount,
    });
  }

  return results.sort((a, b) => b.betCount - a.betCount);
}

/**
 * Get bet type analysis
 */
export async function getBetTypeAnalysis(sportId?: string): Promise<BetTypeAnalysis[]> {
  const settledBets = await prisma.bet.findMany({
    where: {
      result: { not: null },
      ...(sportId && { sportId }),
    },
    include: {
      betType: true,
    },
  });

  // Group by bet type
  const typeStats: Record<string, {
    code: string;
    name: string;
    predictedEdges: number[];
    realizedEdges: number[];
    wins: number;
  }> = {};

  for (const bet of settledBets) {
    const code = bet.betType.code;
    if (!typeStats[code]) {
      typeStats[code] = {
        code,
        name: bet.betType.name,
        predictedEdges: [],
        realizedEdges: [],
        wins: 0,
      };
    }
    typeStats[code].predictedEdges.push(bet.predictedEdge);
    typeStats[code].realizedEdges.push(bet.realizedEdge!);
    if (bet.result === 1) typeStats[code].wins++;
  }

  const results: BetTypeAnalysis[] = [];

  for (const stats of Object.values(typeStats)) {
    const betCount = stats.predictedEdges.length;
    if (betCount === 0) continue;

    const avgPredictedEdge = stats.predictedEdges.reduce((a, b) => a + b, 0) / betCount;
    const avgRealizedEdge = stats.realizedEdges.reduce((a, b) => a + b, 0) / betCount;

    results.push({
      betTypeCode: stats.code,
      betTypeName: stats.name,
      betCount,
      avgPredictedEdge,
      avgRealizedEdge,
      edgeError: avgPredictedEdge - avgRealizedEdge,
      winRate: stats.wins / betCount,
    });
  }

  return results.sort((a, b) => b.betCount - a.betCount);
}

/**
 * Get portfolio-level analysis
 */
export async function getPortfolioAnalysis(sportId?: string): Promise<PortfolioAnalysis> {
  const settledBets = await prisma.bet.findMany({
    where: {
      result: { not: null },
      ...(sportId && { sportId }),
    },
    select: {
      predictedEdge: true,
      realizedEdge: true,
      result: true,
      profitLoss: true,
    },
  });

  if (settledBets.length === 0) {
    return {
      totalBets: 0,
      avgPredictedEdge: 0,
      avgRealizedEdge: 0,
      edgeError: 0,
      winRate: 0,
      totalProfit: 0,
    };
  }

  const totalBets = settledBets.length;
  const wins = settledBets.filter((b) => b.result === 1).length;
  const totalProfit = settledBets.reduce((sum, b) => sum + (b.profitLoss || 0), 0);
  const avgPredictedEdge = settledBets.reduce((sum, b) => sum + b.predictedEdge, 0) / totalBets;
  const avgRealizedEdge = settledBets.reduce((sum, b) => sum + (b.realizedEdge || 0), 0) / totalBets;

  return {
    totalBets,
    avgPredictedEdge,
    avgRealizedEdge,
    edgeError: avgPredictedEdge - avgRealizedEdge,
    winRate: wins / totalBets,
    totalProfit,
  };
}
