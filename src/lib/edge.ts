/**
 * Edge calculation functions for sports betting
 */

/**
 * Calculate predicted edge (Δp)
 * @param pAgent - Agent's predicted probability (0-1)
 * @param pMarket - Market probability (0-1)
 * @returns Predicted edge as decimal (e.g., 0.10 = 10%)
 */
export function calculatePredictedEdge(pAgent: number, pMarket: number): number {
  return pAgent - pMarket;
}

/**
 * Calculate realized edge (Δr) after result is known
 * @param result - 1 for win, 0 for loss
 * @param pMarket - Market probability at bet time (0-1)
 * @returns Realized edge as decimal
 */
export function calculateRealizedEdge(result: 0 | 1, pMarket: number): number {
  return result - pMarket;
}

/**
 * Convert edge decimal to percentage string
 * @param edge - Edge as decimal (e.g., 0.10)
 * @returns Formatted percentage string (e.g., "10.0%")
 */
export function formatEdgePercent(edge: number): string {
  return `${(edge * 100).toFixed(1)}%`;
}

/**
 * Validate probability input
 * @param value - Probability value to validate
 * @returns true if valid (0-1 range)
 */
export function isValidProbability(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 1 && !isNaN(value);
}
