import { NextResponse } from 'next/server';
import {
  getTeamAnalysis,
  getBetTypeAnalysis,
  getPortfolioAnalysis,
  getMaxDrawdown,
  getSportBetTypeAnalysis,
} from '@/lib/analysis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sportId = searchParams.get('sportId') || undefined;
    const minBets = parseInt(searchParams.get('minBets') || '1');

    const [teamAnalysis, betTypeAnalysis, portfolioAnalysis, maxDrawdown, sportBetTypeAnalysis] = await Promise.all([
      getTeamAnalysis(sportId, minBets),
      getBetTypeAnalysis(sportId),
      getPortfolioAnalysis(sportId),
      getMaxDrawdown(),
      getSportBetTypeAnalysis(),
    ]);

    return NextResponse.json({
      teamAnalysis,
      betTypeAnalysis,
      portfolioAnalysis,
      maxDrawdown,
      sportBetTypeAnalysis,
    });
  } catch (error) {
    console.error('Failed to fetch analysis:', error);
    return NextResponse.json(
      { error: '분석 데이터 조회 실패' },
      { status: 500 }
    );
  }
}
