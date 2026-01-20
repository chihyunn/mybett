import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calculateRealizedEdge } from '@/lib/edge';
import { calculateProfitLoss } from '@/lib/betting';

interface ResultInput {
  result: 0 | 1;
  actualAmount: number;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: ResultInput = await request.json();
    const { result, actualAmount } = body;

    // Validation
    if (result !== 0 && result !== 1) {
      return NextResponse.json(
        { error: '결과는 0(패배) 또는 1(승리)이어야 합니다' },
        { status: 400 }
      );
    }

    if (!actualAmount || actualAmount <= 0) {
      return NextResponse.json(
        { error: '실제 베팅 금액은 양수여야 합니다' },
        { status: 400 }
      );
    }

    // Check if bet exists
    const existingBet = await prisma.bet.findUnique({
      where: { id },
    });

    if (!existingBet) {
      return NextResponse.json(
        { error: '베팅을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (existingBet.result !== null) {
      return NextResponse.json(
        { error: '이미 결과가 입력된 베팅입니다' },
        { status: 400 }
      );
    }

    // Calculate realized edge and profit/loss
    const realizedEdge = calculateRealizedEdge(result, existingBet.pMarket);
    const profitLoss = calculateProfitLoss(result, actualAmount);

    // Update bet with result
    const updatedBet = await prisma.bet.update({
      where: { id },
      data: {
        result,
        actualAmount,
        realizedEdge,
        profitLoss,
        settledAt: new Date(),
      },
      include: {
        sport: { select: { name: true } },
        teamA: { select: { name: true } },
        teamB: { select: { name: true } },
        betType: { select: { code: true, name: true } },
      },
    });

    // Update balance
    const balance = await prisma.balance.update({
      where: { id: 'main' },
      data: {
        currentAmount: { increment: profitLoss },
        totalProfit: { increment: profitLoss },
        totalBets: { increment: 1 },
        wins: result === 1 ? { increment: 1 } : undefined,
        losses: result === 0 ? { increment: 1 } : undefined,
      },
    });

    // Record balance history
    await prisma.balanceHistory.create({
      data: {
        amount: balance.currentAmount,
        profit: profitLoss,
        betId: id,
        type: result === 1 ? 'WIN' : 'LOSS',
      },
    });

    return NextResponse.json({
      bet: updatedBet,
      balance,
    });
  } catch (error) {
    console.error('Failed to update bet result:', error);
    return NextResponse.json(
      { error: '결과 입력 실패' },
      { status: 500 }
    );
  }
}
