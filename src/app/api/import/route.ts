import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface ImportData {
  version: string;
  data: {
    sports: { id: string; name: string }[];
    teams: { id: string; name: string; sportId: string }[];
    betTypes: { id: string; code: string; name: string; description?: string }[];
    bets: {
      id: string;
      sportName: string;
      teamAName: string;
      teamBName: string;
      selectedTeam: 'A' | 'B';
      betTypeCode: string;
      pAgent: number;
      pMarket: number;
      predictedEdge: number;
      recommendedAmount: number | null;
      actualAmount: number | null;
      result: number | null;
      realizedEdge: number | null;
      profitLoss: number | null;
      createdAt: string;
      settledAt: string | null;
    }[];
    balance: {
      initialAmount: number;
      currentAmount: number;
      totalProfit: number;
      totalBets: number;
      wins: number;
      losses: number;
    } | null;
    balanceHistory: {
      id: string;
      amount: number;
      profit: number;
      betId: string | null;
      type: string;
      createdAt: string;
    }[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const importData: ImportData = await request.json();

    if (!importData.version || !importData.data) {
      return NextResponse.json({ error: 'Invalid import file format' }, { status: 400 });
    }

    const { data } = importData;
    const results = {
      sports: 0,
      teams: 0,
      betTypes: 0,
      bets: 0,
      balanceHistory: 0,
      skipped: 0,
    };

    // 1. Import Sports
    for (const sport of data.sports || []) {
      await prisma.sport.upsert({
        where: { name: sport.name },
        update: {},
        create: { name: sport.name },
      });
      results.sports++;
    }

    // 2. Import Teams (need sport reference)
    for (const team of data.teams || []) {
      const sport = await prisma.sport.findFirst({
        where: { name: data.sports.find((s) => s.id === team.sportId)?.name },
      });
      if (sport) {
        await prisma.team.upsert({
          where: { sportId_name: { sportId: sport.id, name: team.name } },
          update: {},
          create: { name: team.name, sportId: sport.id },
        });
        results.teams++;
      }
    }

    // 3. Import BetTypes
    for (const betType of data.betTypes || []) {
      await prisma.betType.upsert({
        where: { code: betType.code },
        update: { name: betType.name, description: betType.description },
        create: { code: betType.code, name: betType.name, description: betType.description },
      });
      results.betTypes++;
    }

    // 4. Import Bets
    for (const bet of data.bets || []) {
      // Find references
      const sport = await prisma.sport.findFirst({ where: { name: bet.sportName } });
      const teamA = sport
        ? await prisma.team.findFirst({ where: { name: bet.teamAName, sportId: sport.id } })
        : null;
      const teamB = sport
        ? await prisma.team.findFirst({ where: { name: bet.teamBName, sportId: sport.id } })
        : null;
      const betType = await prisma.betType.findFirst({ where: { code: bet.betTypeCode } });

      if (sport && teamA && teamB && betType) {
        // Check if bet already exists (by checking same teams, time, etc.)
        const existingBet = await prisma.bet.findFirst({
          where: {
            sportId: sport.id,
            teamAId: teamA.id,
            teamBId: teamB.id,
            createdAt: new Date(bet.createdAt),
          },
        });

        if (!existingBet) {
          await prisma.bet.create({
            data: {
              sportId: sport.id,
              teamAId: teamA.id,
              teamBId: teamB.id,
              selectedTeam: bet.selectedTeam,
              betTypeId: betType.id,
              pAgent: bet.pAgent,
              pMarket: bet.pMarket,
              predictedEdge: bet.predictedEdge,
              recommendedAmount: bet.recommendedAmount,
              actualAmount: bet.actualAmount,
              result: bet.result,
              realizedEdge: bet.realizedEdge,
              profitLoss: bet.profitLoss,
              createdAt: new Date(bet.createdAt),
              settledAt: bet.settledAt ? new Date(bet.settledAt) : null,
            },
          });
          results.bets++;
        } else {
          results.skipped++;
        }
      } else {
        results.skipped++;
      }
    }

    // 5. Import Balance
    if (data.balance) {
      await prisma.balance.upsert({
        where: { id: 'main' },
        update: {
          initialAmount: data.balance.initialAmount,
          currentAmount: data.balance.currentAmount,
          totalProfit: data.balance.totalProfit,
          totalBets: data.balance.totalBets,
          wins: data.balance.wins,
          losses: data.balance.losses,
        },
        create: {
          id: 'main',
          initialAmount: data.balance.initialAmount,
          currentAmount: data.balance.currentAmount,
          totalProfit: data.balance.totalProfit,
          totalBets: data.balance.totalBets,
          wins: data.balance.wins,
          losses: data.balance.losses,
        },
      });
    }

    // 6. Import Balance History
    for (const history of data.balanceHistory || []) {
      const existingHistory = await prisma.balanceHistory.findFirst({
        where: { createdAt: new Date(history.createdAt) },
      });

      if (!existingHistory) {
        await prisma.balanceHistory.create({
          data: {
            amount: history.amount,
            profit: history.profit,
            betId: history.betId,
            type: history.type,
            createdAt: new Date(history.createdAt),
          },
        });
        results.balanceHistory++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Import completed',
      results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
  }
}
