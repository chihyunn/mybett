import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const sports = await prisma.sport.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { teams: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(sports);
  } catch (error) {
    console.error('Failed to fetch sports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sports' },
      { status: 500 }
    );
  }
}
