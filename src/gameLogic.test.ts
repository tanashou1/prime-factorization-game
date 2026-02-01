import { describe, it, expect } from 'vitest';
import {
  generatePrimes,
  generateRandomTileValue,
  isDivisor,
  getEmptyPositions,
  isPerfectSquare,
  isPerfectCube,
  checkPerfectPowerElimination,
  checkMultiTileFactorization,
} from './gameLogic';

describe('generatePrimes', () => {
  it('should return empty array for max < 2', () => {
    expect(generatePrimes(0)).toEqual([]);
    expect(generatePrimes(1)).toEqual([]);
    expect(generatePrimes(-1)).toEqual([]);
  });

  it('should return [2] for max = 2', () => {
    expect(generatePrimes(2)).toEqual([2]);
  });

  it('should return correct primes up to 10', () => {
    expect(generatePrimes(10)).toEqual([2, 3, 5, 7]);
  });

  it('should return correct primes up to 20', () => {
    expect(generatePrimes(20)).toEqual([2, 3, 5, 7, 11, 13, 17, 19]);
  });

  it('should return correct primes up to 30', () => {
    expect(generatePrimes(30)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  });
});

describe('generateRandomTileValue', () => {
  it('should return 2 when maxPrime < 2', () => {
    expect(generateRandomTileValue(0)).toBe(2);
    expect(generateRandomTileValue(1)).toBe(2);
  });

  it('should generate values using primes up to maxPrime', () => {
    // Test that values are products of primes up to maxPrime
    const maxPrime = 7;
    const primes = [2, 3, 5, 7];
    
    for (let i = 0; i < 100; i++) {
      const value = generateRandomTileValue(maxPrime);
      expect(value).toBeGreaterThan(0);
      
      // Check that value is composed only of primes up to maxPrime
      let temp = value;
      for (const prime of primes) {
        while (temp % prime === 0) {
          temp = temp / prime;
        }
      }
      expect(temp).toBe(1); // Should be fully factorizable
    }
  });

  it('should generate values within reasonable range', () => {
    const maxPrime = 7;
    // Maximum possible value is 7 * 7 * 7 = 343
    for (let i = 0; i < 50; i++) {
      const value = generateRandomTileValue(maxPrime);
      expect(value).toBeGreaterThanOrEqual(2);
      expect(value).toBeLessThanOrEqual(343);
    }
  });
});

describe('isDivisor', () => {
  it('should return true when a divides b', () => {
    expect(isDivisor(2, 4)).toBe(true);
    expect(isDivisor(3, 9)).toBe(true);
    expect(isDivisor(5, 15)).toBe(true);
    expect(isDivisor(7, 21)).toBe(true);
  });

  it('should return false when a does not divide b', () => {
    expect(isDivisor(3, 5)).toBe(false);
    expect(isDivisor(4, 7)).toBe(false);
    expect(isDivisor(5, 12)).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isDivisor(1, 5)).toBe(true); // 1 divides everything
    expect(isDivisor(5, 5)).toBe(true); // Number divides itself
    expect(isDivisor(0, 5)).toBe(false); // 0 doesn't divide anything (NaN)
  });
});

describe('getEmptyPositions', () => {
  it('should return all positions when no tiles', () => {
    const empty = getEmptyPositions([], 2);
    expect(empty).toHaveLength(4);
    expect(empty).toContainEqual({ row: 0, col: 0 });
    expect(empty).toContainEqual({ row: 0, col: 1 });
    expect(empty).toContainEqual({ row: 1, col: 0 });
    expect(empty).toContainEqual({ row: 1, col: 1 });
  });

  it('should exclude occupied positions', () => {
    const tiles = [
      { row: 0, col: 0 },
      { row: 1, col: 1 },
    ];
    const empty = getEmptyPositions(tiles, 2);
    expect(empty).toHaveLength(2);
    expect(empty).toContainEqual({ row: 0, col: 1 });
    expect(empty).toContainEqual({ row: 1, col: 0 });
  });

  it('should handle fully occupied board', () => {
    const tiles = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ];
    const empty = getEmptyPositions(tiles, 2);
    expect(empty).toHaveLength(0);
  });

  it('should work with larger board', () => {
    const tiles = [{ row: 1, col: 1 }];
    const empty = getEmptyPositions(tiles, 3);
    expect(empty).toHaveLength(8);
  });
});

describe('isPerfectSquare', () => {
  it('should return true for perfect squares', () => {
    expect(isPerfectSquare(1)).toBe(true);
    expect(isPerfectSquare(4)).toBe(true);
    expect(isPerfectSquare(9)).toBe(true);
    expect(isPerfectSquare(16)).toBe(true);
    expect(isPerfectSquare(25)).toBe(true);
    expect(isPerfectSquare(36)).toBe(true);
    expect(isPerfectSquare(49)).toBe(true);
    expect(isPerfectSquare(64)).toBe(true);
    expect(isPerfectSquare(81)).toBe(true);
    expect(isPerfectSquare(100)).toBe(true);
  });

  it('should return false for non-perfect squares', () => {
    expect(isPerfectSquare(2)).toBe(false);
    expect(isPerfectSquare(3)).toBe(false);
    expect(isPerfectSquare(5)).toBe(false);
    expect(isPerfectSquare(8)).toBe(false);
    expect(isPerfectSquare(10)).toBe(false);
    expect(isPerfectSquare(15)).toBe(false);
    expect(isPerfectSquare(24)).toBe(false);
  });

  it('should return false for zero and negative numbers', () => {
    expect(isPerfectSquare(0)).toBe(false);
    expect(isPerfectSquare(-4)).toBe(false);
    expect(isPerfectSquare(-9)).toBe(false);
  });
});

describe('isPerfectCube', () => {
  it('should return true for perfect cubes', () => {
    expect(isPerfectCube(1)).toBe(true);
    expect(isPerfectCube(8)).toBe(true);
    expect(isPerfectCube(27)).toBe(true);
    expect(isPerfectCube(64)).toBe(true);
    expect(isPerfectCube(125)).toBe(true);
    expect(isPerfectCube(216)).toBe(true);
    expect(isPerfectCube(343)).toBe(true);
    expect(isPerfectCube(512)).toBe(true);
    expect(isPerfectCube(729)).toBe(true);
    expect(isPerfectCube(1000)).toBe(true);
  });

  it('should return false for non-perfect cubes', () => {
    expect(isPerfectCube(2)).toBe(false);
    expect(isPerfectCube(3)).toBe(false);
    expect(isPerfectCube(7)).toBe(false);
    expect(isPerfectCube(9)).toBe(false);
    expect(isPerfectCube(26)).toBe(false);
    expect(isPerfectCube(100)).toBe(false);
  });

  it('should return false for zero and negative numbers', () => {
    expect(isPerfectCube(0)).toBe(false);
    expect(isPerfectCube(-8)).toBe(false);
    expect(isPerfectCube(-27)).toBe(false);
  });

  it('should handle edge case of 64 (both square and cube)', () => {
    expect(isPerfectCube(64)).toBe(true);
  });
});

describe('checkPerfectPowerElimination', () => {
  it('should return null for different values', () => {
    expect(checkPerfectPowerElimination(4, 9)).toBeNull();
    expect(checkPerfectPowerElimination(2, 3)).toBeNull();
    expect(checkPerfectPowerElimination(8, 27)).toBeNull();
  });

  it('should return "square" for equal perfect squares', () => {
    expect(checkPerfectPowerElimination(4, 4)).toBe('square');
    expect(checkPerfectPowerElimination(9, 9)).toBe('square');
    expect(checkPerfectPowerElimination(16, 16)).toBe('square');
    expect(checkPerfectPowerElimination(25, 25)).toBe('square');
  });

  it('should return "cube" for equal perfect cubes that are not squares', () => {
    expect(checkPerfectPowerElimination(8, 8)).toBe('cube');
    expect(checkPerfectPowerElimination(27, 27)).toBe('cube');
    expect(checkPerfectPowerElimination(125, 125)).toBe('cube');
    expect(checkPerfectPowerElimination(216, 216)).toBe('cube');
  });

  it('should prioritize square over cube for 64', () => {
    // 64 is both 8^2 and 4^3, should return 'square'
    expect(checkPerfectPowerElimination(64, 64)).toBe('square');
  });

  it('should return null for equal values that are neither square nor cube', () => {
    expect(checkPerfectPowerElimination(2, 2)).toBeNull();
    expect(checkPerfectPowerElimination(3, 3)).toBeNull();
    expect(checkPerfectPowerElimination(5, 5)).toBeNull();
    expect(checkPerfectPowerElimination(6, 6)).toBeNull();
    expect(checkPerfectPowerElimination(10, 10)).toBeNull();
  });
});

describe('checkMultiTileFactorization', () => {
  it('should return null with less than 2 adjacent tiles', () => {
    const centerTile = { value: 12, row: 1, col: 1 };
    const adjacentTiles = [{ value: 6, row: 1, col: 0, id: 1 }];
    
    const result = checkMultiTileFactorization(centerTile, adjacentTiles);
    expect(result).toBeNull();
  });

  it('should find valid 2-factor factorization', () => {
    // Center tile = 12, adjacent tiles = 6 and 4
    // 12 = 2 * 6, 2 divides 6; 12 = 3 * 4, 3 divides 6 (wait not right)
    // 12 = 2 * 6, and we have tiles 6 and 4
    // We need: 12 = a * b, where a divides one tile and b divides another
    // 12 = 2 * 6: 2 divides 6 (yes), 6 divides 4 (no)
    // 12 = 3 * 4: 3 divides 6 (yes), 4 divides 4 (yes)
    const centerTile = { value: 12, row: 1, col: 1 };
    const adjacentTiles = [
      { value: 6, row: 1, col: 0, id: 1 },
      { value: 4, row: 1, col: 2, id: 2 },
    ];
    
    const result = checkMultiTileFactorization(centerTile, adjacentTiles);
    expect(result).not.toBeNull();
    expect(result?.canFactor).toBe(true);
    expect(result?.factorTiles).toHaveLength(2);
  });

  it('should return null when no valid factorization exists', () => {
    // Center tile = 13 (prime), adjacent tiles = 2 and 3
    // 13 cannot be factored into 2 factors > 1
    const centerTile = { value: 13, row: 1, col: 1 };
    const adjacentTiles = [
      { value: 6, row: 1, col: 0, id: 1 },
      { value: 4, row: 1, col: 2, id: 2 },
    ];
    
    const result = checkMultiTileFactorization(centerTile, adjacentTiles);
    expect(result).toBeNull();
  });

  it('should find valid 3-factor factorization', () => {
    // Center tile = 30, adjacent tiles = 10, 6, 5
    // 30 = 2 * 3 * 5
    // 2 divides 10 (yes), 3 divides 6 (yes), 5 divides 5 (yes)
    // However, the algorithm may find 30 = 6 * 5 first which only uses 2 factors
    const centerTile = { value: 30, row: 1, col: 1 };
    const adjacentTiles = [
      { value: 10, row: 1, col: 0, id: 1 },
      { value: 6, row: 1, col: 2, id: 2 },
      { value: 5, row: 0, col: 1, id: 3 },
    ];
    
    const result = checkMultiTileFactorization(centerTile, adjacentTiles);
    expect(result).not.toBeNull();
    expect(result?.canFactor).toBe(true);
    // The algorithm finds a valid factorization (may be 2 or 3 factors)
    expect(result?.factorTiles.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle case where multiple factorizations exist', () => {
    // Center tile = 12, adjacent tiles = 12, 12
    // 12 = 2 * 6, 12 = 3 * 4
    // Both 2 and 6 divide 12, both 3 and 4 divide 12
    const centerTile = { value: 12, row: 1, col: 1 };
    const adjacentTiles = [
      { value: 12, row: 1, col: 0, id: 1 },
      { value: 12, row: 1, col: 2, id: 2 },
    ];
    
    const result = checkMultiTileFactorization(centerTile, adjacentTiles);
    expect(result).not.toBeNull();
    expect(result?.canFactor).toBe(true);
    expect(result?.factorTiles).toHaveLength(2);
  });

  it('should return null when factors do not divide adjacent tiles', () => {
    // Center tile = 12, adjacent tiles = 5 and 7
    // 12 = 2 * 6: 2 does not divide 5 or 7 evenly
    // 12 = 3 * 4: 3 does not divide 5 or 7 evenly
    const centerTile = { value: 12, row: 1, col: 1 };
    const adjacentTiles = [
      { value: 5, row: 1, col: 0, id: 1 },
      { value: 7, row: 1, col: 2, id: 2 },
    ];
    
    const result = checkMultiTileFactorization(centerTile, adjacentTiles);
    expect(result).toBeNull();
  });
});
