import { describe, it, expect } from 'vitest';
import { processChainReactions } from './chainReactionLogic';
import type { Tile } from './types';

describe('Equal Value Elimination - New Feature', () => {
  it('should eliminate two tiles with value 5 (not a perfect power)', () => {
    // Two tiles with value 5 adjacent to each other
    // 5 is NOT a perfect square or cube, but they should still disappear
    const tiles: Tile[] = [
      { id: 1, value: 5, row: 0, col: 0 },
      { id: 2, value: 5, row: 0, col: 1 },
    ];

    const result = processChainReactions(tiles, 1, 3);

    // Both tiles should disappear
    expect(result.tiles).toHaveLength(0);
    expect(result.chainCount).toBe(1);
    
    // Score should be sum of both values
    expect(result.scoreGained).toBe(10); // 5 + 5
  });

  it('should eliminate two tiles with value 7 (prime number)', () => {
    // Two tiles with value 7 adjacent to each other
    const tiles: Tile[] = [
      { id: 1, value: 7, row: 1, col: 1 },
      { id: 2, value: 7, row: 1, col: 2 },
    ];

    const result = processChainReactions(tiles, 1, 3);

    // Both tiles should disappear
    expect(result.tiles).toHaveLength(0);
    expect(result.chainCount).toBe(1);
    
    // Score should be sum of both values
    expect(result.scoreGained).toBe(14); // 7 + 7
  });

  it('should eliminate two tiles with value 15 (composite, not perfect power)', () => {
    // Two tiles with value 15 adjacent to each other
    // 15 = 3 * 5, not a perfect square or cube
    const tiles: Tile[] = [
      { id: 1, value: 15, row: 2, col: 0 },
      { id: 2, value: 15, row: 2, col: 1 },
    ];

    const result = processChainReactions(tiles, 1, 3);

    // Both tiles should disappear
    expect(result.tiles).toHaveLength(0);
    expect(result.chainCount).toBe(1);
    
    // Score should be sum of both values
    expect(result.scoreGained).toBe(30); // 15 + 15
  });

  it('should still work with perfect powers (squares)', () => {
    // Ensure backward compatibility with perfect power elimination
    const tiles: Tile[] = [
      { id: 1, value: 4, row: 0, col: 0 },
      { id: 2, value: 4, row: 0, col: 1 },
    ];

    const result = processChainReactions(tiles, 1, 3);

    // Both tiles should disappear
    expect(result.tiles).toHaveLength(0);
    expect(result.chainCount).toBe(1);
    expect(result.scoreGained).toBe(8); // 4 + 4
  });

  it('should still work with perfect powers (cubes)', () => {
    // Ensure backward compatibility with perfect power elimination
    const tiles: Tile[] = [
      { id: 1, value: 8, row: 0, col: 0 },
      { id: 2, value: 8, row: 0, col: 1 },
    ];

    const result = processChainReactions(tiles, 1, 3);

    // Both tiles should disappear
    expect(result.tiles).toHaveLength(0);
    expect(result.chainCount).toBe(1);
    expect(result.scoreGained).toBe(16); // 8 + 8
  });

  it('should not eliminate tiles with different values', () => {
    // Make sure non-equal tiles don't eliminate each other
    const tiles: Tile[] = [
      { id: 1, value: 5, row: 0, col: 0 },
      { id: 2, value: 7, row: 0, col: 1 },
    ];

    const result = processChainReactions(tiles, 1, 3);

    // Both tiles should remain (5 doesn't divide 7, and vice versa)
    expect(result.tiles).toHaveLength(2);
    expect(result.chainCount).toBe(0);
    expect(result.scoreGained).toBe(0);
  });

  it('should eliminate equal tiles even when not adjacent at start (chain reaction)', () => {
    // Setup: [3] [6] [3]
    // After iteration 1: 3 merges with 6 → [3] [2]
    // 3 and 2 don't merge, so result should be [3] [2]
    // But let's test with: [2] [4] [2]
    // After iteration 1: 2 merges with 4 → [2] [2]
    // After iteration 2: Both 2s should eliminate each other
    const tiles: Tile[] = [
      { id: 1, value: 2, row: 0, col: 0 },
      { id: 2, value: 4, row: 0, col: 1 },
      { id: 3, value: 2, row: 0, col: 2 },
    ];

    const result = processChainReactions(tiles, 1, 4);

    // After first merge: tile 1 (value 2) divides tile 2 (value 4)
    // Result: tile 2 becomes 2, tile 1 disappears
    // Now we have: [2] (from tile 2) and [2] (tile 3) adjacent
    // After second merge: both should eliminate
    expect(result.tiles).toHaveLength(0);
    expect(result.chainCount).toBeGreaterThanOrEqual(2);
  });

  it('should handle three equal tiles in a row', () => {
    // [5] [5] [5]
    // First iteration: leftmost and middle should merge
    // Result after first: [5] (from the right)
    // One tile remains
    const tiles: Tile[] = [
      { id: 1, value: 5, row: 0, col: 0 },
      { id: 2, value: 5, row: 0, col: 1 },
      { id: 3, value: 5, row: 0, col: 2 },
    ];

    const result = processChainReactions(tiles, 1, 4);

    // After first merge: tiles 1 and 2 should eliminate
    // Tile 3 remains
    expect(result.tiles).toHaveLength(1);
    expect(result.tiles[0].value).toBe(5);
    expect(result.chainCount).toBe(1);
  });
});
