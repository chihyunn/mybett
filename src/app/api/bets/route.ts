import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calculatePredictedEdge, isValidProbability } from '@/lib/edge';
import { recommendBetAmount } from '@/lib/betting';
import { SelectedTeam } from '@prisma/client';

interface CreateBetRequest {
  sportId: string;
  teamAId: string;
  teamBId: string;
  selectedTeam: 'A' | 'B';
  betTypeId: string;
  pAgent: number;
  pMarket: number;
}

export async function POST(request: Request) {
  try {
    const body: CreateBetRequest = await request.json();
    const { sportId, teamAId, teamBId, selectedTeam, betTypeId, pAgent, pMarket } = body;

    // Validation
    if (!sportId || !teamAId || !teamBId || !selectedTeam || !betTypeId) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }

    if (teamAId === teamBId) {
      return NextResponse.json(
        { error: '같은 팀끼리 매치업 불가' },
        { status: 400 }
      );
    }

    if (!isValidProbability(pAgent) || !isValidProbability(pMarket)) {
      return NextResponse.json(
        { error: '확률은 0~1 범위여야 합니다' },
        { status: 400 }
      );
    }

    if (!['A', 'B'].includes(selectedTeam)) {
      return NextResponse.json(
        { error: '선택 팀은 A 또는 B여야 합니다' },
        { status: 400 }
      );
    }

    // Get current balance
    const balance = await prisma.balance.findUnique({
      where: { id: 'main' },
    });

    if (!balance) {
      return NextResponse.json(
        { error: '밸런스 정보를 찾을 수 없습니다' },
        { status: 500 }
      );
    }

    // Calculate edge and recommendation
    const predictedEdge = calculatePredictedEdge(pAgent, pMarket);
    const recommendedAmount = recommendBetAmount(predictedEdge, balance.currentAmount);

    // Create bet record
    const bet = await prisma.bet.create({
      data: {
        sportId,
        teamAId,
        teamBId,
        selectedTeam: selectedTeam as SelectedTeam,
        betTypeId,
        pAgent,
        pMarket,
        predictedEdge,
        recommendedAmount,
      },
      include: {
        sport: { select: { name: true } },
        teamA: { select: { name: true } },
        teamB: { select: { name: true } },
        betType: { select: { code: true, name: true } },
      },
    });

    return NextResponse.json({
      ...bet,
      currentBalance: balance.currentAmount,
    });
  } catch (error) {
    console.error('Failed to create bet:', error);
    return NextResponse.json(
      { error: '베팅 생성 실패' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sportId = searchParams.get('sportId');
    const settled = searchParams.get('settled');

    const where: Record<string, unknown> = {};

    if (sportId) {
      where.sportId = sportId;
    }

    if (settled === 'true') {
      where.result = { not: null };
    } else if (settled === 'false') {
      where.result = null;
    }

    const bets = await prisma.bet.findMany({
      where,
      include: {
        sport: { select: { name: true } },
        teamA: { select: { name: true } },
        teamB: { select: { name: true } },
        betType: { select: { code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bets);
  } catch (error) {
    console.error('Failed to fetch bets:', error);
    return NextResponse.json(
      { error: '베팅 목록 조회 실패' },
      { status: 500 }
    );
  }
}
