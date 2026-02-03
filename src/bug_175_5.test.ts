import { describe, it, expect } from 'vitest';
import { processChainReactions } from './chainReactionLogic';
import type { Tile } from './types';

describe('Bug: 175 divided by 5 reacts twice', () => {
  it('should correctly handle 175 divided by 5 only once', () => {
    // Setup: Two tiles adjacent to each other
    // Tile 1 (5) at position [0, 0]
    // Tile 2 (175) at position [0, 1]
    const tiles: Tile[] = [
      { id: 1, value: 5, row: 0, col: 0 },
      { id: 2, value: 175, row: 0, col: 1 },
    ];

    // Process chain reactions
    const result = processChainReactions(tiles, 1, 3);

    console.log('Initial tiles:', JSON.stringify(tiles, null, 2));
    console.log('Chain steps:', JSON.stringify(result.chainSteps, null, 2));
    console.log('Final tiles:', JSON.stringify(result.tiles, null, 2));

    // Expected:
    // - Tile 1 (5) should divide tile 2 (175)
    // - 175 / 5 = 35
    // - Tile 1 (5) should disappear
    // - Tile 2 should become 35
    expect(result.tiles.length).toBe(1);
    expect(result.tiles[0].value).toBe(35);
  });

  it('should correctly handle adjacent 5 and 175 after movement collision', () => {
    // Simulate the case where 5 moves and collides with 175
    // After movement, both tiles are adjacent
    const tiles: Tile[] = [
      { id: 1, value: 5, row: 0, col: 1 }, // 5 has moved next to 175
      { id: 2, value: 175, row: 0, col: 1 }, // 175 at same position
    ];

    // This simulates tiles being at the same position after movement
    // The chain reaction logic should handle this correctly
    const result = processChainReactions(tiles, 1, 3);

    console.log('After collision tiles:', JSON.stringify(tiles, null, 2));
    console.log('Result:', JSON.stringify(result.tiles, null, 2));

    // The result should have only one tile with value 35
    // But the bug might cause it to react twice: 175 → 35 → 7
    expect(result.tiles.length).toBe(1);
    expect(result.tiles[0].value).toBe(35);
  });
});
