import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if bet exists
    const bet = await prisma.bet.findUnique({
      where: { id },
    });

    if (!bet) {
      return NextResponse.json(
        { error: '베팅을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Only allow deleting pending bets (not settled ones)
    if (bet.result !== null) {
      return NextResponse.json(
        { error: '이미 결과가 입력된 베팅은 삭제할 수 없습니다' },
        { status: 400 }
      );
    }

    // Delete the bet
    await prisma.bet.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: '베팅이 삭제되었습니다' });
  } catch (error) {
    console.error('Failed to delete bet:', error);
    return NextResponse.json(
      { error: '베팅 삭제 실패' },
      { status: 500 }
    );
  }
}
