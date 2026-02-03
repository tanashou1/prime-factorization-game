import { describe, it, expect } from 'vitest';
import type { Tile } from './types';

/**
 * Bug Test: 15と5が反応したあと、3になり、その後、15に戻りました
 * Translation: After 15 and 5 react, it becomes 3, and then it returns to 15.
 * 
 * This test reproduces the exact bug scenario described in the problem statement.
 */
describe('Bug: 15÷5=3 then reverts to 15', () => {
  it('should simulate the bug where merged tile value reverts', () => {
    console.log('\n=== BUG REPRODUCTION START ===\n');
    
    // Initial state: Tile 5 at [0,0], Tile 15 at [0,1]
    const initialTiles: Tile[] = [
      { id: 1, value: 5, row: 0, col: 0 },
      { id: 2, value: 15, row: 0, col: 1 },
    ];
    console.log('Step 1 - Initial tiles:', JSON.stringify(initialTiles, null, 2));
    
    // After merge: 5 divides 15 to get 3
    // Both tiles (id=1, id=2) should be marked as merged
    // New merged tile (id=3) with value 3 is created
    const mergedTileIds = new Set([1, 2]);
    const movedTiles: Tile[] = [
      { id: 3, value: 3, row: 0, col: 1, isDividing: true }, // Correct merged result
    ];
    console.log('\nStep 2 - After merge, movedTiles:', JSON.stringify(movedTiles, null, 2));
    console.log('mergedTileIds:', Array.from(mergedTileIds));
    
    // BUG SCENARIO: During animation, if original tiles are re-added
    // This simulates what happens in Game.tsx lines 404-407
    const newTiles = [...initialTiles]; // Original tiles still in newTiles array
    const movedTileIds = new Set(movedTiles.map(t => t.id));
    
    // This is the filter logic from Game.tsx line 404
    const nonMovedTiles = newTiles.filter(t => 
      !movedTileIds.has(t.id) && !mergedTileIds.has(t.id)
    );
    
    console.log('\nStep 3 - nonMovedTiles after filter:', JSON.stringify(nonMovedTiles, null, 2));
    
    // The animation state combines movedTiles with nonMovedTiles
    const animationState = [...movedTiles, ...nonMovedTiles];
    console.log('\nStep 4 - Animation state:', JSON.stringify(animationState, null, 2));
    
    // VERIFICATION: Should only have the merged tile with value 3
    const activeTiles = animationState.filter(t => t.value !== 0);
    console.log('\nFinal active tiles:', JSON.stringify(activeTiles, null, 2));
    
    console.log('\n=== BUG REPRODUCTION END ===\n');
    
    // Check if the bug exists
    // BUG: If tile with value 15 appears in activeTiles, the bug exists
    const hasTile15 = activeTiles.some(t => t.value === 15);
    const hasTile5 = activeTiles.some(t => t.value === 5);
    const hasTile3 = activeTiles.some(t => t.value === 3);
    
    if (hasTile15) {
      console.log('❌ BUG DETECTED: Tile with value 15 still exists after merge!');
    }
    if (hasTile5) {
      console.log('❌ BUG DETECTED: Tile with value 5 still exists after merge!');
    }
    if (!hasTile3) {
      console.log('❌ BUG DETECTED: Merged tile with value 3 is missing!');
    }
    
    // Expected: Only tile with value 3
    expect(activeTiles.length).toBe(1);
    expect(activeTiles[0].value).toBe(3);
    expect(hasTile15).toBe(false);
    expect(hasTile5).toBe(false);
  });

  it('should verify that mergedTileIds correctly filters out original tiles', () => {
    // Simpler test to verify the filter logic works correctly
    const originalTiles: Tile[] = [
      { id: 1, value: 5, row: 0, col: 0 },
      { id: 2, value: 15, row: 0, col: 1 },
      { id: 10, value: 7, row: 1, col: 0 }, // Unrelated tile
    ];
    
    const mergedTileIds = new Set([1, 2]); // Tiles 1 and 2 merged
    const movedTileIds = new Set([3]); // New merged tile has id=3
    
    // Filter should only keep tile with id=10
    const filtered = originalTiles.filter(t => 
      !movedTileIds.has(t.id) && !mergedTileIds.has(t.id)
    );
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(10);
    expect(filtered[0].value).toBe(7);
  });
});
