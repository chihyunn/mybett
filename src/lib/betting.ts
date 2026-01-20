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
 * @returns Recommended bet amount, or null if edge is too low
 *
 * Edge thresholds:
 * - < 5%: No bet recommended
 * - 5-10%: $200 recommended
 * - 10%+: $350 recommended
 *
 * If balance is lower than recommended amount, returns available balance
 */
export function recommendBetAmount(edge: number, balance: number): number | null {
  // Edge < 5% - no bet recommended
  if (edge < 0.05) {
    return null;
  }

  let recommended: number;

  if (edge < 0.10) {
    // Edge 5-10%: $200
    recommended = 200;
  } else {
    // Edge 10%+: $350
    recommended = 350;
  }

  // Return minimum of recommended and available balance
  return Math.min(recommended, balance);
}

/**
 * Get recommendation message based on edge
 * @param edge - Predicted edge as decimal
 * @returns Human-readable recommendation
 */
export function getRecommendationMessage(edge: number): string {
  if (edge < 0) {
    return '베팅 강력 비추천 (음수 Edge)';
  }
  if (edge < 0.05) {
    return '베팅 비추천 (Edge < 5%)';
  }
  if (edge < 0.10) {
    return '베팅 추천 ($200)';
  }
  return '베팅 강력 추천 ($350)';
}

/**
 * Calculate profit/loss from a bet result
 * @param result - 1 for win, 0 for loss
 * @param actualAmount - Actual bet amount
 * @returns Profit (positive) or loss (negative)
 */
export function calculateProfitLoss(result: 0 | 1, actualAmount: number): number {
  return result === 1 ? actualAmount : -actualAmount;
}
