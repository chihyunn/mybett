import prisma from '@/lib/db';

export interface MaxDrawdownData {
  maxDrawdown: number;        // 최대 손실액 (음수)
  maxDrawdownPercent: number; // 최대 손실률 (음수)
  peakAmount: number;         // 최고점
  troughAmount: number;       // 최저점
  recoveryStatus: 'recovered' | 'recovering' | 'none';
  currentDrawdown: number;    // 현재 드로우다운
  currentDrawdownPercent: number;
}

export interface SportBetTypeAnalysis {
  sportId: string;
  sportName: string;
  betTypeCode: string;
  betTypeName: string;
  betCount: number;
  avgPredictedEdge: number;
  avgRealizedEdge: number;
  edgeError: number;
  winRate: number;
  totalProfit: number;
}

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

/**
 * Calculate Max Drawdown (MDD) from balance history
 */
export async function getMaxDrawdown(): Promise<MaxDrawdownData> {
  const history = await prisma.balanceHistory.findMany({
    orderBy: { createdAt: 'asc' },
  });

  if (history.length === 0) {
    return {
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      peakAmount: 0,
      troughAmount: 0,
      recoveryStatus: 'none',
      currentDrawdown: 0,
      currentDrawdownPercent: 0,
    };
  }

  let peak = history[0].amount;
  let peakIndex = 0;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  let troughAmount = history[0].amount;
  let peakAmount = history[0].amount;
  let mddPeakIndex = 0;
  let mddTroughIndex = 0;

  // Find maximum drawdown
  for (let i = 0; i < history.length; i++) {
    const amount = history[i].amount;

    if (amount > peak) {
      peak = amount;
      peakIndex = i;
    }

    const drawdown = amount - peak;
    const drawdownPercent = peak > 0 ? (drawdown / peak) : 0;

    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownPercent = drawdownPercent;
      peakAmount = peak;
      troughAmount = amount;
      mddPeakIndex = peakIndex;
      mddTroughIndex = i;
    }
  }

  // Calculate current drawdown
  const currentAmount = history[history.length - 1].amount;
  const currentPeak = Math.max(...history.map(h => h.amount));
  const currentDrawdown = currentAmount - currentPeak;
  const currentDrawdownPercent = currentPeak > 0 ? (currentDrawdown / currentPeak) : 0;

  // Determine recovery status
  let recoveryStatus: 'recovered' | 'recovering' | 'none' = 'none';
  if (maxDrawdown < 0) {
    // Check if we recovered from MDD
    const afterMddTrough = history.slice(mddTroughIndex + 1);
    const recoveredPeak = afterMddTrough.some(h => h.amount >= peakAmount);

    if (recoveredPeak) {
      recoveryStatus = 'recovered';
    } else if (currentAmount > troughAmount) {
      recoveryStatus = 'recovering';
    }
  }

  return {
    maxDrawdown,
    maxDrawdownPercent,
    peakAmount,
    troughAmount,
    recoveryStatus,
    currentDrawdown,
    currentDrawdownPercent,
  };
}

/**
 * Get Sport x BetType cross-analysis
 */
export async function getSportBetTypeAnalysis(): Promise<SportBetTypeAnalysis[]> {
  const settledBets = await prisma.bet.findMany({
    where: {
      result: { not: null },
    },
    include: {
      sport: true,
      betType: true,
    },
  });

  // Group by sport + betType combination
  const crossStats: Record<string, {
    sportId: string;
    sportName: string;
    betTypeCode: string;
    betTypeName: string;
    predictedEdges: number[];
    realizedEdges: number[];
    profits: number[];
    wins: number;
  }> = {};

  for (const bet of settledBets) {
    const key = `${bet.sportId}-${bet.betType.code}`;

    if (!crossStats[key]) {
      crossStats[key] = {
        sportId: bet.sportId,
        sportName: bet.sport.name,
        betTypeCode: bet.betType.code,
        betTypeName: bet.betType.name,
        predictedEdges: [],
        realizedEdges: [],
        profits: [],
        wins: 0,
      };
    }

    crossStats[key].predictedEdges.push(bet.predictedEdge);
    crossStats[key].realizedEdges.push(bet.realizedEdge!);
    crossStats[key].profits.push(bet.profitLoss || 0);
    if (bet.result === 1) crossStats[key].wins++;
  }

  const results: SportBetTypeAnalysis[] = [];

  for (const stats of Object.values(crossStats)) {
    const betCount = stats.predictedEdges.length;
    if (betCount === 0) continue;

    const avgPredictedEdge = stats.predictedEdges.reduce((a, b) => a + b, 0) / betCount;
    const avgRealizedEdge = stats.realizedEdges.reduce((a, b) => a + b, 0) / betCount;
    const totalProfit = stats.profits.reduce((a, b) => a + b, 0);

    results.push({
      sportId: stats.sportId,
      sportName: stats.sportName,
      betTypeCode: stats.betTypeCode,
      betTypeName: stats.betTypeName,
      betCount,
      avgPredictedEdge,
      avgRealizedEdge,
      edgeError: avgPredictedEdge - avgRealizedEdge,
      winRate: stats.wins / betCount,
      totalProfit,
    });
  }

  return results.sort((a, b) => b.betCount - a.betCount);
}
