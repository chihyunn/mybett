import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Export all data
    const [bets, balance, balanceHistory, sports, teams, betTypes] = await Promise.all([
      prisma.bet.findMany({
        include: {
          sport: true,
          teamA: true,
          teamB: true,
          betType: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.balance.findFirst(),
      prisma.balanceHistory.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sport.findMany(),
      prisma.team.findMany(),
      prisma.betType.findMany(),
    ]);

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        sports,
        teams,
        betTypes,
        bets: bets.map((bet) => ({
          id: bet.id,
          sportName: bet.sport.name,
          teamAName: bet.teamA.name,
          teamBName: bet.teamB.name,
          selectedTeam: bet.selectedTeam,
          betTypeCode: bet.betType.code,
          pAgent: bet.pAgent,
          pMarket: bet.pMarket,
          predictedEdge: bet.predictedEdge,
          recommendedAmount: bet.recommendedAmount,
          actualAmount: bet.actualAmount,
          result: bet.result,
          realizedEdge: bet.realizedEdge,
          profitLoss: bet.profitLoss,
          createdAt: bet.createdAt.toISOString(),
          settledAt: bet.settledAt?.toISOString() || null,
        })),
        balance: balance
          ? {
              initialAmount: balance.initialAmount,
              currentAmount: balance.currentAmount,
              totalProfit: balance.totalProfit,
              totalBets: balance.totalBets,
              wins: balance.wins,
              losses: balance.losses,
            }
          : null,
        balanceHistory: balanceHistory.map((h) => ({
          id: h.id,
          amount: h.amount,
          profit: h.profit,
          betId: h.betId,
          type: h.type,
          createdAt: h.createdAt.toISOString(),
        })),
      },
      summary: {
        totalBets: bets.length,
        settledBets: bets.filter((b) => b.result !== null).length,
        pendingBets: bets.filter((b) => b.result === null).length,
        totalProfit: balance?.totalProfit || 0,
        currentBalance: balance?.currentAmount || 0,
      },
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mybet-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
