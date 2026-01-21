/**
 * Betting recommendation logic
 */

/**
 * Kelly Criterion calculation
 * Formula: Kelly % = edge / (1 - p_market)
 *
 * This calculates the mathematically optimal fraction of bankroll to bet
 * to maximize long-term growth rate.
 *
 * @param pAgent - Agent's probability estimate (0-1)
 * @param pMarket - Market's implied probability (0-1)
 * @returns Kelly percentage (0-1), capped at 25% max for safety
 */
export function calculateKellyPercentage(pAgent: number, pMarket: number): number {
  const edge = pAgent - pMarket;

  // No bet if edge is negative or zero
  if (edge <= 0) {
    return 0;
  }

  // Kelly % = edge / (1 - p_market)
  // This is derived from: Kelly = (bp - q) / b where b = (1-p_market)/p_market
  const kellyPercent = edge / (1 - pMarket);

  // Cap at 25% for safety (full Kelly is aggressive)
  return Math.min(kellyPercent, 0.25);
}

/**
 * Calculate Kelly bet amounts for different risk levels
 * @param pAgent - Agent's probability estimate
 * @param pMarket - Market's implied probability
 * @param balance - Current bankroll
 * @returns Object with full, half, and quarter Kelly amounts
 */
export function calculateKellyBetAmounts(
  pAgent: number,
  pMarket: number,
  balance: number
): {
  kellyPercent: number;
  fullKelly: number;
  halfKelly: number;
  quarterKelly: number;
} {
  const kellyPercent = calculateKellyPercentage(pAgent, pMarket);

  return {
    kellyPercent,
    fullKelly: Math.round(balance * kellyPercent),
    halfKelly: Math.round(balance * kellyPercent * 0.5),
    quarterKelly: Math.round(balance * kellyPercent * 0.25),
  };
}

/**
 * Recommend bet amount based on edge and available balance
 * @param edge - Predicted edge as decimal (e.g., 0.10 = 10%)
 * @param balance - Current available balance
 * @returns Recommended bet amount, or null if edge is negative
 *
 * Edge thresholds (percentage of balance):
 * - < 0%: No bet recommended (negative edge)
 * - 0-14%: 1% of balance
 * - 15-24%: 2% of balance
 * - 25-30%: 3% of balance
 * - 31%+: 4% of balance (max)
 */
export function recommendBetAmount(edge: number, balance: number): number | null {
  // Negative edge - no bet recommended
  if (edge < 0) {
    return null;
  }

  let percent: number;

  if (edge < 0.15) {
    // Edge 0-14%: 1% of balance
    percent = 0.01;
  } else if (edge < 0.25) {
    // Edge 15-24%: 2% of balance
    percent = 0.02;
  } else if (edge < 0.31) {
    // Edge 25-30%: 3% of balance
    percent = 0.03;
  } else {
    // Edge 31%+: 4% of balance (max)
    percent = 0.04;
  }

  return Math.round(balance * percent);
}

/**
 * Get recommendation message based on edge
 * @param edge - Predicted edge as decimal
 * @returns Human-readable recommendation
 */
export function getRecommendationMessage(edge: number): string {
  if (edge < 0) {
    return '베팅 비추천 (음수 Edge)';
  }
  if (edge < 0.15) {
    return '베팅 추천 (1% of balance)';
  }
  if (edge < 0.25) {
    return '베팅 추천 (2% of balance)';
  }
  if (edge < 0.31) {
    return '강력 추천 (3% of balance)';
  }
  return '최강 추천 (4% of balance)';
}

/**
 * Calculate profit/loss from a bet result based on market odds
 * @param result - 1 for win, 0 for loss
 * @param actualAmount - Actual bet amount
 * @param pMarket - Market implied probability (used to derive odds)
 * @returns Profit (positive) or loss (negative)
 *
 * Formula:
 * - Odds = 1 / pMarket
 * - Win: profit = actualAmount × (odds - 1)
 * - Loss: profit = -actualAmount
 *
 * Example:
 * - pMarket = 0.40 (odds = 2.5): $100 bet wins → +$150
 * - pMarket = 0.60 (odds = 1.67): $100 bet wins → +$67
 */
export function calculateProfitLoss(result: 0 | 1, actualAmount: number, pMarket: number): number {
  if (result === 1) {
    // Win: calculate based on market odds
    const odds = 1 / pMarket;
    return Math.round(actualAmount * (odds - 1));
  }
  // Loss: lose entire bet amount
  return -actualAmount;
}
