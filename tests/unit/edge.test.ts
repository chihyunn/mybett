import { describe, it, expect } from 'vitest';
import {
  calculatePredictedEdge,
  calculateRealizedEdge,
  formatEdgePercent,
  isValidProbability,
} from '@/lib/edge';

describe('calculatePredictedEdge', () => {
  it('should calculate positive edge when agent > market', () => {
    expect(calculatePredictedEdge(0.65, 0.55)).toBeCloseTo(0.10);
    expect(calculatePredictedEdge(0.70, 0.50)).toBeCloseTo(0.20);
  });

  it('should calculate zero edge when agent = market', () => {
    expect(calculatePredictedEdge(0.50, 0.50)).toBeCloseTo(0);
    expect(calculatePredictedEdge(0.65, 0.65)).toBeCloseTo(0);
  });

  it('should calculate negative edge when agent < market', () => {
    expect(calculatePredictedEdge(0.45, 0.55)).toBeCloseTo(-0.10);
    expect(calculatePredictedEdge(0.30, 0.50)).toBeCloseTo(-0.20);
  });

  it('should handle boundary values', () => {
    expect(calculatePredictedEdge(1, 0)).toBeCloseTo(1);
    expect(calculatePredictedEdge(0, 1)).toBeCloseTo(-1);
    expect(calculatePredictedEdge(0, 0)).toBeCloseTo(0);
    expect(calculatePredictedEdge(1, 1)).toBeCloseTo(0);
  });
});

describe('calculateRealizedEdge', () => {
  it('should return positive edge on win with low market probability', () => {
    expect(calculateRealizedEdge(1, 0.40)).toBeCloseTo(0.60);
    expect(calculateRealizedEdge(1, 0.50)).toBeCloseTo(0.50);
  });

  it('should return negative edge on loss', () => {
    expect(calculateRealizedEdge(0, 0.40)).toBeCloseTo(-0.40);
    expect(calculateRealizedEdge(0, 0.60)).toBeCloseTo(-0.60);
  });

  it('should handle boundary market probabilities', () => {
    expect(calculateRealizedEdge(1, 0)).toBeCloseTo(1);
    expect(calculateRealizedEdge(1, 1)).toBeCloseTo(0);
    expect(calculateRealizedEdge(0, 0)).toBeCloseTo(0);
    expect(calculateRealizedEdge(0, 1)).toBeCloseTo(-1);
  });
});

describe('formatEdgePercent', () => {
  it('should format edge as percentage', () => {
    expect(formatEdgePercent(0.10)).toBe('10.0%');
    expect(formatEdgePercent(0.05)).toBe('5.0%');
    expect(formatEdgePercent(0.123)).toBe('12.3%');
  });

  it('should handle negative edges', () => {
    expect(formatEdgePercent(-0.05)).toBe('-5.0%');
    expect(formatEdgePercent(-0.10)).toBe('-10.0%');
  });

  it('should handle zero edge', () => {
    expect(formatEdgePercent(0)).toBe('0.0%');
  });
});

describe('isValidProbability', () => {
  it('should return true for valid probabilities', () => {
    expect(isValidProbability(0)).toBe(true);
    expect(isValidProbability(0.5)).toBe(true);
    expect(isValidProbability(1)).toBe(true);
    expect(isValidProbability(0.001)).toBe(true);
    expect(isValidProbability(0.999)).toBe(true);
  });

  it('should return false for invalid probabilities', () => {
    expect(isValidProbability(-0.1)).toBe(false);
    expect(isValidProbability(1.1)).toBe(false);
    expect(isValidProbability(NaN)).toBe(false);
  });
});
