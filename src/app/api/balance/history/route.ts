import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const history = await prisma.balanceHistory.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Failed to fetch balance history:', error);
    return NextResponse.json(
      { error: '밸런스 히스토리 조회 실패' },
      { status: 500 }
    );
  }
}
