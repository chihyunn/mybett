import { describe, it, expect } from 'vitest';
import {
  recommendBetAmount,
  getRecommendationMessage,
  calculateProfitLoss,
  calculateKellyPercentage,
  calculateKellyBetAmounts,
} from '@/lib/betting';

describe('recommendBetAmount', () => {
  describe('edge thresholds', () => {
    it('should return null for edge < 5%', () => {
      expect(recommendBetAmount(0.04, 5000)).toBeNull();
      expect(recommendBetAmount(0.03, 5000)).toBeNull();
      expect(recommendBetAmount(0, 5000)).toBeNull();
      expect(recommendBetAmount(-0.05, 5000)).toBeNull();
    });

    it('should return $200 for edge 5-10%', () => {
      expect(recommendBetAmount(0.05, 5000)).toBe(200);
      expect(recommendBetAmount(0.07, 5000)).toBe(200);
      expect(recommendBetAmount(0.09, 5000)).toBe(200);
      expect(recommendBetAmount(0.099, 5000)).toBe(200);
    });

    it('should return $350 for edge >= 10%', () => {
      expect(recommendBetAmount(0.10, 5000)).toBe(350);
      expect(recommendBetAmount(0.12, 5000)).toBe(350);
      expect(recommendBetAmount(0.20, 5000)).toBe(350);
      expect(recommendBetAmount(0.50, 5000)).toBe(350);
    });
  });

  describe('balance awareness', () => {
    it('should return available balance when lower than recommended', () => {
      // Edge 7% would recommend $200, but balance is only $150
      expect(recommendBetAmount(0.07, 150)).toBe(150);

      // Edge 12% would recommend $350, but balance is only $200
      expect(recommendBetAmount(0.12, 200)).toBe(200);
    });

    it('should return full recommendation when balance is sufficient', () => {
      expect(recommendBetAmount(0.07, 200)).toBe(200);
      expect(recommendBetAmount(0.12, 350)).toBe(350);
      expect(recommendBetAmount(0.12, 1000)).toBe(350);
    });

    it('should handle zero balance', () => {
      expect(recommendBetAmount(0.10, 0)).toBe(0);
    });

    it('should handle very small balance', () => {
      expect(recommendBetAmount(0.10, 50)).toBe(50);
    });
  });

  describe('edge boundary cases', () => {
    it('should handle exactly 5% edge', () => {
      expect(recommendBetAmount(0.05, 5000)).toBe(200);
    });

    it('should handle exactly 10% edge', () => {
      expect(recommendBetAmount(0.10, 5000)).toBe(350);
    });

    it('should handle edge just below thresholds', () => {
      expect(recommendBetAmount(0.0499, 5000)).toBeNull();
      expect(recommendBetAmount(0.0999, 5000)).toBe(200);
    });
  });
});

describe('getRecommendationMessage', () => {
  it('should return strong no-bet message for negative edge', () => {
    expect(getRecommendationMessage(-0.05)).toBe('베팅 강력 비추천 (음수 Edge)');
    expect(getRecommendationMessage(-0.10)).toBe('베팅 강력 비추천 (음수 Edge)');
  });

  it('should return no-bet message for edge < 5%', () => {
    expect(getRecommendationMessage(0)).toBe('베팅 비추천 (Edge < 5%)');
    expect(getRecommendationMessage(0.04)).toBe('베팅 비추천 (Edge < 5%)');
  });

  it('should return $200 recommendation for edge 5-10%', () => {
    expect(getRecommendationMessage(0.05)).toBe('베팅 추천 ($200)');
    expect(getRecommendationMessage(0.07)).toBe('베팅 추천 ($200)');
    expect(getRecommendationMessage(0.09)).toBe('베팅 추천 ($200)');
  });

  it('should return $350 recommendation for edge >= 10%', () => {
    expect(getRecommendationMessage(0.10)).toBe('베팅 강력 추천 ($350)');
    expect(getRecommendationMessage(0.15)).toBe('베팅 강력 추천 ($350)');
  });
});

describe('calculateProfitLoss', () => {
  it('should return positive profit on win', () => {
    expect(calculateProfitLoss(1, 200)).toBe(200);
    expect(calculateProfitLoss(1, 350)).toBe(350);
  });

  it('should return negative loss on loss', () => {
    expect(calculateProfitLoss(0, 200)).toBe(-200);
    expect(calculateProfitLoss(0, 350)).toBe(-350);
  });

  it('should handle zero amount', () => {
    expect(calculateProfitLoss(1, 0)).toBe(0);
    expect(calculateProfitLoss(0, 0)).toBeCloseTo(0);
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
