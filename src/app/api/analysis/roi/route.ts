import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface ROIData {
  category: string;
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWagered: number;
  totalProfit: number;
  roi: number;
}

export async function GET() {
  try {
    // Get all settled bets with relations
    const bets = await prisma.bet.findMany({
      where: {
        result: { not: null },
        actualAmount: { not: null },
      },
      include: {
        sport: { select: { name: true } },
        betType: { select: { code: true, name: true } },
      },
    });

    // Calculate ROI by Sport
    const sportMap = new Map<string, { bets: typeof bets }>();
    bets.forEach((bet) => {
      const key = bet.sport.name;
      if (!sportMap.has(key)) {
        sportMap.set(key, { bets: [] });
      }
      sportMap.get(key)!.bets.push(bet);
    });

    const bySport: ROIData[] = [];
    sportMap.forEach((data, sport) => {
      const stats = calculateStats(data.bets, sport);
      bySport.push(stats);
    });

    // Calculate ROI by BetType
    const betTypeMap = new Map<string, { bets: typeof bets; name: string }>();
    bets.forEach((bet) => {
      const key = bet.betType.code;
      if (!betTypeMap.has(key)) {
        betTypeMap.set(key, { bets: [], name: bet.betType.name });
      }
      betTypeMap.get(key)!.bets.push(bet);
    });

    const byBetType: ROIData[] = [];
    betTypeMap.forEach((data, code) => {
      const stats = calculateStats(data.bets, `${code} (${data.name})`);
      byBetType.push(stats);
    });

    // Calculate overall ROI
    const overall = calculateStats(bets, '전체');

    // Sort by ROI descending
    bySport.sort((a, b) => b.roi - a.roi);
    byBetType.sort((a, b) => b.roi - a.roi);

    return NextResponse.json({
      overall,
      bySport,
      byBetType,
    });
  } catch (error) {
    console.error('Failed to fetch ROI data:', error);
    return NextResponse.json({ error: 'Failed to fetch ROI data' }, { status: 500 });
  }
}

function calculateStats(
  bets: {
    result: number | null;
    actualAmount: number | null;
    profitLoss: number | null;
  }[],
  category: string
): ROIData {
  const settledBets = bets.filter((b) => b.result !== null && b.actualAmount !== null);
  const wins = settledBets.filter((b) => b.result === 1).length;
  const losses = settledBets.filter((b) => b.result === 0).length;
  const totalBets = settledBets.length;
  const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;

  const totalWagered = settledBets.reduce((sum, b) => sum + (b.actualAmount || 0), 0);
  const totalProfit = settledBets.reduce((sum, b) => sum + (b.profitLoss || 0), 0);
  const roi = totalWagered > 0 ? (totalProfit / totalWagered) * 100 : 0;

  return {
    category,
    totalBets,
    wins,
    losses,
    winRate,
    totalWagered,
    totalProfit,
    roi,
  };
}
