import { describe, it, expect } from 'vitest';
import { processChainReactions } from './chainReactionLogic';
import { processTileRemoval } from './simpleTileRemoval';
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

  it('should correctly handle 5 with isMoving flag after merging with 175', () => {
    // Simulating the scenario after movement where:
    // - Tile 5 moved and merged with 175 to create tile 35
    // - But if tile 5 is STILL in the array with isMoving:true, it could react again
    const tilesAfterMerge: Tile[] = [
      { id: 3, value: 35, row: 0, col: 1, isMoving: false }, // Merged tile (no isMoving flag)
      { id: 1, value: 5, row: 0, col: 1, isMoving: true },  // BUG: Original tile 5 still present with isMoving
    ];

    // Process tile removal (this is called after movement)
    const result = processTileRemoval(tilesAfterMerge, 4);

    console.log('Tiles after merge:', JSON.stringify(tilesAfterMerge, null, 2));
    console.log('After processTileRemoval:', JSON.stringify(result.tiles, null, 2));

    // If tile 5 is still in the array, processTileRemoval will make it react with 35 again!
    // This would cause: 35 / 5 = 7 (the bug!)
    
    // Expected behavior: tile 5 should have been removed during merge, so no second reaction
    // But if the bug exists, we'll see tile with value 7
    const finalActiveTiles = result.tiles.filter(t => t.value !== 0);
    console.log('Final active tiles:', JSON.stringify(finalActiveTiles, null, 2));
  });

  it('should NOT have tile 5 in movedTiles after merging with 175', () => {
    // This test verifies that after merging, the original tiles are properly removed
    // Simulating what should happen in moveTiles:
    // 1. Tile 5 (id=1) moves and hits Tile 175 (id=2)
    // 2. They merge into Tile 35 (id=3)
    // 3. Original tiles (id=1 and id=2) should be in mergedTileIds
    // 4. Only Tile 35 (id=3) should be in the result

    const tiles: Tile[] = [
      { id: 1, value: 5, row: 0, col: 0 },
      { id: 2, value: 175, row: 0, col: 1 },
    ];

    // Simulate merge: Create new tile 35, mark original tiles as merged
    const mergedTileIds = new Set<number>([1, 2]);
    const movedTiles: Tile[] = [
      { id: 3, value: 35, row: 0, col: 1 }, // Merged tile
    ];

    // Filter out merged tiles (this is what Game.tsx does at line 377)
    const tilesAfterFiltering = [
      ...movedTiles,
      ...tiles.filter(t => !mergedTileIds.has(t.id))
    ];

    console.log('Tiles after filtering:', JSON.stringify(tilesAfterFiltering, null, 2));

    // Should only have the merged tile
    expect(tilesAfterFiltering.length).toBe(1);
    expect(tilesAfterFiltering[0].value).toBe(35);
  });
});
