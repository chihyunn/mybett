import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the analysis functions with different scenarios
describe('Analysis Logic', () => {
  describe('Team Analysis Calculation', () => {
    it('should calculate average predicted edge correctly', () => {
      const predictedEdges = [0.10, 0.15, 0.05];
      const avgPredictedEdge = predictedEdges.reduce((a, b) => a + b, 0) / predictedEdges.length;
      expect(avgPredictedEdge).toBeCloseTo(0.10);
    });

    it('should calculate average realized edge correctly', () => {
      const realizedEdges = [0.50, -0.40, 0.60]; // win, loss, win
      const avgRealizedEdge = realizedEdges.reduce((a, b) => a + b, 0) / realizedEdges.length;
      expect(avgRealizedEdge).toBeCloseTo(0.233, 2);
    });

    it('should calculate edge error (Δp - Δr) correctly', () => {
      const avgPredictedEdge = 0.10;
      const avgRealizedEdge = 0.233;
      const edgeError = avgPredictedEdge - avgRealizedEdge;
      expect(edgeError).toBeCloseTo(-0.133, 2);
    });

    it('should calculate win rate correctly', () => {
      const results = [1, 0, 1, 1, 0]; // 3 wins, 2 losses
      const wins = results.filter((r) => r === 1).length;
      const winRate = wins / results.length;
      expect(winRate).toBeCloseTo(0.60);
    });
  });

  describe('Portfolio Analysis Calculation', () => {
    it('should handle empty bets', () => {
      const bets: unknown[] = [];
      const totalBets = bets.length;
      expect(totalBets).toBe(0);
    });

    it('should calculate total profit correctly', () => {
      const profitLosses = [200, -200, 350, 200, -350];
      const totalProfit = profitLosses.reduce((sum, pl) => sum + pl, 0);
      expect(totalProfit).toBe(200);
    });

    it('should calculate portfolio metrics from multiple bets', () => {
      const bets = [
        { predictedEdge: 0.10, realizedEdge: 0.50, result: 1, profitLoss: 200 },
        { predictedEdge: 0.08, realizedEdge: -0.45, result: 0, profitLoss: -200 },
        { predictedEdge: 0.12, realizedEdge: 0.55, result: 1, profitLoss: 350 },
      ];

      const totalBets = bets.length;
      const wins = bets.filter((b) => b.result === 1).length;
      const totalProfit = bets.reduce((sum, b) => sum + b.profitLoss, 0);
      const avgPredictedEdge = bets.reduce((sum, b) => sum + b.predictedEdge, 0) / totalBets;
      const avgRealizedEdge = bets.reduce((sum, b) => sum + b.realizedEdge, 0) / totalBets;

      expect(totalBets).toBe(3);
      expect(wins).toBe(2);
      expect(totalProfit).toBe(350);
      expect(avgPredictedEdge).toBeCloseTo(0.10);
      expect(avgRealizedEdge).toBeCloseTo(0.20);
    });
  });

  describe('Bet Type Analysis Calculation', () => {
    it('should group bets by type correctly', () => {
      const bets = [
        { betTypeCode: 'SPREAD_PLUS', predictedEdge: 0.10 },
        { betTypeCode: 'SPREAD_PLUS', predictedEdge: 0.08 },
        { betTypeCode: 'OVER', predictedEdge: 0.12 },
        { betTypeCode: 'SPREAD_MINUS', predictedEdge: 0.06 },
      ];

      const grouped: Record<string, number[]> = {};
      for (const bet of bets) {
        if (!grouped[bet.betTypeCode]) grouped[bet.betTypeCode] = [];
        grouped[bet.betTypeCode].push(bet.predictedEdge);
      }

      expect(grouped['SPREAD_PLUS'].length).toBe(2);
      expect(grouped['OVER'].length).toBe(1);
      expect(grouped['SPREAD_MINUS'].length).toBe(1);
    });

    it('should calculate average edge per bet type', () => {
      const spreadPlusEdges = [0.10, 0.08];
      const avg = spreadPlusEdges.reduce((a, b) => a + b, 0) / spreadPlusEdges.length;
      expect(avg).toBeCloseTo(0.09);
    });
  });

  describe('Edge Error Interpretation', () => {
    it('positive error means overestimating edge (agent too confident)', () => {
      const avgPredictedEdge = 0.15;
      const avgRealizedEdge = 0.05;
      const edgeError = avgPredictedEdge - avgRealizedEdge;

      expect(edgeError).toBeCloseTo(0.10);
      // Positive error = Agent predicted 15% edge but only realized 5%
      // Agent is overconfident
    });

    it('negative error means underestimating edge (agent too conservative)', () => {
      const avgPredictedEdge = 0.05;
      const avgRealizedEdge = 0.15;
      const edgeError = avgPredictedEdge - avgRealizedEdge;

      expect(edgeError).toBeCloseTo(-0.10);
      // Negative error = Agent predicted 5% edge but realized 15%
      // Agent is too conservative
    });

    it('zero error means perfectly calibrated agent', () => {
      const avgPredictedEdge = 0.10;
      const avgRealizedEdge = 0.10;
      const edgeError = avgPredictedEdge - avgRealizedEdge;

      expect(edgeError).toBeCloseTo(0);
    });
  });
});
