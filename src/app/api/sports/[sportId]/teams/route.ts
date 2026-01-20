import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sportId: string }> }
) {
  try {
    const { sportId } = await params;

    const teams = await prisma.team.findMany({
      where: { sportId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    if (teams.length === 0) {
      return NextResponse.json(
        { error: 'Sport not found or has no teams' },
        { status: 404 }
      );
    }

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
