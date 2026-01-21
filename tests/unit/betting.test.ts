import { describe, it, expect } from 'vitest';
import {
  recommendBetAmount,
  getRecommendationMessage,
  calculateProfitLoss,
  calculateKellyPercentage,
  calculateKellyBetAmounts,
} from '@/lib/betting';

describe('recommendBetAmount', () => {
  const balance = 10000; // Use $10,000 for easy percentage calculation

  describe('edge thresholds', () => {
    it('should return null for negative edge', () => {
      expect(recommendBetAmount(-0.05, balance)).toBeNull();
      expect(recommendBetAmount(-0.01, balance)).toBeNull();
    });

    it('should return 1% of balance for edge 0-14%', () => {
      // 1% of 10000 = 100
      expect(recommendBetAmount(0, balance)).toBe(100);
      expect(recommendBetAmount(0.05, balance)).toBe(100);
      expect(recommendBetAmount(0.10, balance)).toBe(100);
      expect(recommendBetAmount(0.14, balance)).toBe(100);
    });

    it('should return 2% of balance for edge 15-24%', () => {
      // 2% of 10000 = 200
      expect(recommendBetAmount(0.15, balance)).toBe(200);
      expect(recommendBetAmount(0.20, balance)).toBe(200);
      expect(recommendBetAmount(0.24, balance)).toBe(200);
    });

    it('should return 3% of balance for edge 25-30%', () => {
      // 3% of 10000 = 300
      expect(recommendBetAmount(0.25, balance)).toBe(300);
      expect(recommendBetAmount(0.28, balance)).toBe(300);
      expect(recommendBetAmount(0.30, balance)).toBe(300);
    });

    it('should return 4% of balance for edge 31%+', () => {
      // 4% of 10000 = 400
      expect(recommendBetAmount(0.31, balance)).toBe(400);
      expect(recommendBetAmount(0.35, balance)).toBe(400);
      expect(recommendBetAmount(0.50, balance)).toBe(400);
    });
  });

  describe('balance scaling', () => {
    it('should scale with different balances', () => {
      // Edge 10% = 1% tier
      expect(recommendBetAmount(0.10, 5000)).toBe(50);   // 1% of 5000
      expect(recommendBetAmount(0.10, 20000)).toBe(200); // 1% of 20000

      // Edge 20% = 2% tier
      expect(recommendBetAmount(0.20, 5000)).toBe(100);  // 2% of 5000
      expect(recommendBetAmount(0.20, 20000)).toBe(400); // 2% of 20000
    });

    it('should handle zero balance', () => {
      expect(recommendBetAmount(0.10, 0)).toBe(0);
      expect(recommendBetAmount(0.30, 0)).toBe(0);
    });

    it('should handle small balance', () => {
      expect(recommendBetAmount(0.10, 100)).toBe(1);  // 1% of 100
      expect(recommendBetAmount(0.35, 100)).toBe(4);  // 4% of 100
    });
  });

  describe('edge boundary cases', () => {
    it('should handle boundary at 15%', () => {
      expect(recommendBetAmount(0.149, balance)).toBe(100);  // 1%
      expect(recommendBetAmount(0.15, balance)).toBe(200);   // 2%
    });

    it('should handle boundary at 25%', () => {
      expect(recommendBetAmount(0.249, balance)).toBe(200);  // 2%
      expect(recommendBetAmount(0.25, balance)).toBe(300);   // 3%
    });

    it('should handle boundary at 31%', () => {
      expect(recommendBetAmount(0.309, balance)).toBe(300);  // 3%
      expect(recommendBetAmount(0.31, balance)).toBe(400);   // 4%
    });
  });
});

describe('getRecommendationMessage', () => {
  it('should return no-bet message for negative edge', () => {
    expect(getRecommendationMessage(-0.05)).toBe('베팅 비추천 (음수 Edge)');
    expect(getRecommendationMessage(-0.10)).toBe('베팅 비추천 (음수 Edge)');
  });

  it('should return 1% recommendation for edge 0-14%', () => {
    expect(getRecommendationMessage(0)).toBe('베팅 추천 (1% of balance)');
    expect(getRecommendationMessage(0.10)).toBe('베팅 추천 (1% of balance)');
    expect(getRecommendationMessage(0.14)).toBe('베팅 추천 (1% of balance)');
  });

  it('should return 2% recommendation for edge 15-24%', () => {
    expect(getRecommendationMessage(0.15)).toBe('베팅 추천 (2% of balance)');
    expect(getRecommendationMessage(0.20)).toBe('베팅 추천 (2% of balance)');
  });

  it('should return 3% recommendation for edge 25-30%', () => {
    expect(getRecommendationMessage(0.25)).toBe('강력 추천 (3% of balance)');
    expect(getRecommendationMessage(0.30)).toBe('강력 추천 (3% of balance)');
  });

  it('should return 4% recommendation for edge 31%+', () => {
    expect(getRecommendationMessage(0.31)).toBe('최강 추천 (4% of balance)');
    expect(getRecommendationMessage(0.50)).toBe('최강 추천 (4% of balance)');
  });
});

describe('calculateProfitLoss', () => {
  it('should calculate profit based on market odds when winning', () => {
    // pMarket = 0.50 (odds = 2.0): $100 bet wins → +$100
    expect(calculateProfitLoss(1, 100, 0.50)).toBe(100);

    // pMarket = 0.40 (odds = 2.5): $100 bet wins → +$150
    expect(calculateProfitLoss(1, 100, 0.40)).toBe(150);

    // pMarket = 0.60 (odds = 1.67): $100 bet wins → +$67
    expect(calculateProfitLoss(1, 100, 0.60)).toBe(67);

    // pMarket = 0.25 (odds = 4.0): $100 bet wins → +$300
    expect(calculateProfitLoss(1, 100, 0.25)).toBe(300);
  });

  it('should return negative loss on loss (regardless of odds)', () => {
    expect(calculateProfitLoss(0, 200, 0.50)).toBe(-200);
    expect(calculateProfitLoss(0, 350, 0.40)).toBe(-350);
    expect(calculateProfitLoss(0, 100, 0.60)).toBe(-100);
  });

  it('should handle zero amount', () => {
    expect(calculateProfitLoss(1, 0, 0.50)).toBe(0);
    expect(calculateProfitLoss(0, 0, 0.50)).toBeCloseTo(0);
  });

  it('should handle various bet amounts with different odds', () => {
    // $200 bet at odds 2.5 (pMarket = 0.40) → +$300
    expect(calculateProfitLoss(1, 200, 0.40)).toBe(300);

    // $350 bet at odds 1.5 (pMarket = 0.667) → +$175
    expect(calculateProfitLoss(1, 350, 0.667)).toBe(175);
  });
});

describe('calculateKellyPercentage', () => {
  it('should return 0 for negative edge', () => {
    expect(calculateKellyPercentage(0.40, 0.50)).toBe(0);
    expect(calculateKellyPercentage(0.30, 0.50)).toBe(0);
  });

  it('should return 0 for zero edge', () => {
    expect(calculateKellyPercentage(0.50, 0.50)).toBe(0);
  });

  it('should calculate correct Kelly percentage', () => {
    // Edge 10%, pMarket 50% -> Kelly = 0.10 / 0.50 = 20%
    expect(calculateKellyPercentage(0.60, 0.50)).toBeCloseTo(0.20);

    // Edge 5%, pMarket 45% -> Kelly = 0.05 / 0.55 = 9.09%
    expect(calculateKellyPercentage(0.50, 0.45)).toBeCloseTo(0.0909, 3);

    // Edge 15%, pMarket 40% -> Kelly = 0.15 / 0.60 = 25%
    expect(calculateKellyPercentage(0.55, 0.40)).toBeCloseTo(0.25);
  });

  it('should cap at 25% for safety', () => {
    // Very high edge would give Kelly > 25%, but should be capped
    expect(calculateKellyPercentage(0.80, 0.50)).toBe(0.25);
    expect(calculateKellyPercentage(0.90, 0.50)).toBe(0.25);
  });
});

describe('calculateKellyBetAmounts', () => {
  it('should calculate correct bet amounts for different Kelly fractions', () => {
    // Edge 10%, pMarket 50%, balance 5000 -> Kelly 20%
    const result = calculateKellyBetAmounts(0.60, 0.50, 5000);

    expect(result.kellyPercent).toBeCloseTo(0.20);
    expect(result.fullKelly).toBe(1000);    // 20% of 5000
    expect(result.halfKelly).toBe(500);     // 10% of 5000
    expect(result.quarterKelly).toBe(250);  // 5% of 5000
  });

  it('should return 0 for all amounts when edge is negative', () => {
    const result = calculateKellyBetAmounts(0.40, 0.50, 5000);

    expect(result.kellyPercent).toBe(0);
    expect(result.fullKelly).toBe(0);
    expect(result.halfKelly).toBe(0);
    expect(result.quarterKelly).toBe(0);
  });

  it('should handle small balances', () => {
    const result = calculateKellyBetAmounts(0.60, 0.50, 100);

    expect(result.fullKelly).toBe(20);
    expect(result.halfKelly).toBe(10);
    expect(result.quarterKelly).toBe(5);
  });
});
