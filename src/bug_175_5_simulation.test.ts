import { describe, it, expect } from 'vitest';
import { processTileRemoval } from './simpleTileRemoval';
import type { Tile } from './types';

describe('Bug Simulation: Complete flow of 5 hitting 175', () => {
  it('simulates the complete merge and removal flow', () => {
    console.log('\n=== SIMULATION START ===\n');
    
    // Step 1: Initial state - Tile 5 at [0,0], Tile 175 at [0,1]
    const initialTiles: Tile[] = [
      { id: 1, value: 5, row: 0, col: 0 },
      { id: 2, value: 175, row: 0, col: 1 },
    ];
    console.log('Step 1 - Initial tiles:', JSON.stringify(initialTiles, null, 2));
    
    // Step 2: After movement - Tile 5 merges with 175
    // According to Game.tsx logic:
    // - Both tiles (id=1, id=2) are added to mergedTileIds
    // - A new merged tile (id=3) with value 35 is created
    // - The path of tile 5 is assigned to the merged tile
    const mergedTileIds = new Set([1, 2]);
    const movedTiles: Tile[] = [
      { id: 3, value: 35, row: 0, col: 1 }, // Merged tile (no isMoving yet)
    ];
    console.log('\nStep 2 - After merge, movedTiles:', JSON.stringify(movedTiles, null, 2));
    console.log('mergedTileIds:', Array.from(mergedTileIds));
    
    // Step 3: During animation - isMoving flag is added
    // This happens at line 393 of Game.tsx during the animation loop
    const movedTilesWithFlags = movedTiles.map(t => ({
      ...t,
      isMoving: true, // Added during animation
    }));
    console.log('\nStep 3 - After animation, tiles with isMoving:', JSON.stringify(movedTilesWithFlags, null, 2));
    
    // Step 4: Before processTileRemoval - filter non-zero tiles
    // This happens at line 470 of Game.tsx
    const activeTiles = movedTilesWithFlags.filter(t => t.value !== 0);
    console.log('\nStep 4 - activeTiles passed to processTileRemoval:', JSON.stringify(activeTiles, null, 2));
    
    // Step 5: Process tile removal
    const removalResult = processTileRemoval(activeTiles, 4);
    console.log('\nStep 5 - After processTileRemoval:', JSON.stringify(removalResult.tiles, null, 2));
    
    // Expected: Tile 35 should remain as-is since it has no adjacent tiles
    // Bug check: If the original tile 5 is somehow still in the array, 
    // it would react with 35 during processTileRemoval
    
    const finalActiveTiles = removalResult.tiles.filter(t => t.value !== 0);
    console.log('\nFinal active tiles:', JSON.stringify(finalActiveTiles, null, 2));
    
    console.log('\n=== SIMULATION END ===\n');
    
    // Verify the result
    expect(finalActiveTiles.length).toBe(1);
    expect(finalActiveTiles[0].value).toBe(35);
  });

  it('simulates the bug scenario where tile 5 is NOT removed from movedTiles', () => {
    console.log('\n=== BUG SCENARIO START ===\n');
    
    // BUG HYPOTHESIS: What if the merged tile creation doesn't properly exclude
    // the original moving tile from movedTiles?
    
    // After movement, if BOTH the merged tile AND the original tile 5 are in movedTiles:
    const movedTilesWithBug: Tile[] = [
      { id: 3, value: 35, row: 0, col: 1, isMoving: true }, // Merged tile
      { id: 1, value: 5, row: 0, col: 1, isMoving: true },  // BUG: Original tile NOT removed!
    ];
    console.log('movedTiles (with bug):', JSON.stringify(movedTilesWithBug, null, 2));
    
    // Process tile removal
    const removalResult = processTileRemoval(movedTilesWithBug, 4);
    console.log('After processTileRemoval:', JSON.stringify(removalResult.tiles, null, 2));
    
    const finalActiveTiles = removalResult.tiles.filter(t => t.value !== 0);
    console.log('Final active tiles:', JSON.stringify(finalActiveTiles, null, 2));
    
    console.log('\n=== BUG SCENARIO END ===\n');
    
    // If the bug exists, we would see:
    // - Tile 5 (isMoving=true) would process against tile 35
    // - Since 35 % 5 === 0, tile 5 would be removed and tile 35 would become 7
    // This matches the bug description: "5 reacts twice, resulting in 7"
    
    if (finalActiveTiles.length > 0) {
      const values = finalActiveTiles.map(t => t.value);
      console.log('Final values:', values);
      
      // Check if we got value 7 (the bug result)
      if (values.includes(7)) {
        console.log('❌ BUG CONFIRMED: Tile 5 reacted twice, creating value 7');
      }
    }
  });
});
