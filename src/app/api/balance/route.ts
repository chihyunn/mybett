import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const balance = await prisma.balance.findUnique({
      where: { id: 'main' },
    });

    if (!balance) {
      // Create default balance if not exists
      const newBalance = await prisma.balance.create({
        data: {
          id: 'main',
          initialAmount: 5000,
          currentAmount: 5000,
          totalProfit: 0,
          totalBets: 0,
          wins: 0,
          losses: 0,
        },
      });
      return NextResponse.json(newBalance);
    }

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
