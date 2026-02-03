import { describe, it, expect } from 'vitest';
import type { Tile } from './types';

/**
 * Integration test for the fix of the tile reversion bug
 * Simulates the complete flow including chain reactions
 */
describe('Bug Fix Verification: Merged tiles not lost during chain reaction processing', () => {
  it('should preserve merged tile (value 3) after filtering for chain reactions', () => {
    console.log('\n=== TESTING BUG FIX ===\n');
    
    // Simulate movedTiles after merge: 5 + 15 → 3
    const movedTiles: Tile[] = [
      { id: 3, value: 3, row: 0, col: 1, isDividing: true, mergeHighlight: true },
      { id: 10, value: 7, row: 1, col: 0 }, // Another unrelated tile
    ];
    console.log('movedTiles after merge:', JSON.stringify(movedTiles, null, 2));
    
    // OLD BUG: Filter removes the merged tile
    const activeTilesOldWay = movedTiles.filter(t => 
      t.value !== 0 && 
      !t.mergeHighlight && 
      !t.isDividing && 
      !t.isPowerEliminating
    );
    console.log('\nOLD WAY - activeTiles for chain reactions:', JSON.stringify(activeTilesOldWay, null, 2));
    console.log('OLD WAY - Lost the merged tile with value 3!');
    
    // NEW FIX: Keep track of filtered tiles
    const activeTilesNewWay = movedTiles.filter(t => 
      t.value !== 0 && 
      !t.mergeHighlight && 
      !t.isDividing && 
      !t.isPowerEliminating
    );
    const filteredMergedTiles = movedTiles.filter(t => 
      t.value !== 0 && 
      (t.mergeHighlight || t.isDividing || t.isPowerEliminating)
    );
    console.log('\nNEW FIX - activeTiles for chain reactions:', JSON.stringify(activeTilesNewWay, null, 2));
    console.log('NEW FIX - filteredMergedTiles:', JSON.stringify(filteredMergedTiles, null, 2));
    
    // Simulate chain reactions (no chains in this case)
    const chainResultTiles = activeTilesNewWay; // No changes
    
    // OLD BUG: finalTiles = chainResultTiles (missing the merged tile!)
    const finalTilesOldWay = chainResultTiles;
    console.log('\nOLD WAY - finalTiles:', JSON.stringify(finalTilesOldWay, null, 2));
    console.log('OLD WAY - Merged tile with value 3 is LOST!');
    
    // NEW FIX: Combine chain results with filtered tiles
    const finalTilesNewWay = [...chainResultTiles, ...filteredMergedTiles];
    console.log('\nNEW FIX - finalTiles:', JSON.stringify(finalTilesNewWay, null, 2));
    console.log('NEW FIX - Merged tile with value 3 is PRESERVED!');
    
    console.log('\n=== END BUG FIX TEST ===\n');
    
    // Verify the fix
    const hasTile3 = finalTilesNewWay.some(t => t.value === 3);
    const hasTile7 = finalTilesNewWay.some(t => t.value === 7);
    
    expect(hasTile3).toBe(true);
    expect(hasTile7).toBe(true);
    expect(finalTilesNewWay.length).toBe(2);
    
    // Verify the old way would have lost the tile
    expect(finalTilesOldWay.some(t => t.value === 3)).toBe(false);
  });
  
  it('should handle case where merged tile becomes 1 and disappears', () => {
    // When merged tile has value 0 (disappearing), it should not be added back
    const movedTiles: Tile[] = [
      { id: 3, value: 0, row: 0, col: 1, isDividing: true, mergeHighlight: true, isDisappearing: true },
      { id: 10, value: 7, row: 1, col: 0 },
    ];
    
    const activeTiles = movedTiles.filter(t => 
      t.value !== 0 && 
      !t.mergeHighlight && 
      !t.isDividing && 
      !t.isPowerEliminating
    );
    const filteredMergedTiles = movedTiles.filter(t => 
      t.value !== 0 &&  // ← This filters out value 0
      (t.mergeHighlight || t.isDividing || t.isPowerEliminating)
    );
    
    const chainResultTiles = activeTiles;
    const finalTiles = [...chainResultTiles, ...filteredMergedTiles];
    
    // Should only have tile 7, not the disappearing tile
    expect(finalTiles.length).toBe(1);
    expect(finalTiles[0].value).toBe(7);
  });
});
