import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const betTypes = await prisma.betType.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json(betTypes);
  } catch (error) {
    console.error('Failed to fetch bet types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bet types' },
      { status: 500 }
    );
  }
}
