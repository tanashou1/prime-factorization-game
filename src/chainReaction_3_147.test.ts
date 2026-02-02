import { describe, it, expect } from 'vitest';

/**
 * Integration test simulating the exact chain reaction logic for tiles 3 and 147
 * This test replicates the processChainReactions function logic to trace exactly what happens
 */

// Copy of relevant functions from gameLogic.ts and Game.tsx
function isDivisor(a: number, b: number): boolean {
  return b % a === 0;
}

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
}

function simulateChainReaction(initialTiles: Tile[]): Tile[] {
  let currentTiles = [...initialTiles];
  let hasChanges = true;
  let iteration = 0;
  
  console.log('=== Starting chain reaction simulation ===');
  console.log('Initial tiles:', JSON.stringify(currentTiles, null, 2));
  
  while (hasChanges && iteration < 10) { // Add iteration limit to prevent infinite loops
    iteration++;
    console.log(`\n--- Iteration ${iteration} ---`);
    
    hasChanges = false;
    const newTiles: Tile[] = [];
    const processed = new Set<number>();
    
    // Sort tiles by value (smallest first)
    const sortedIndices = currentTiles
      .map((tile, index) => ({ tile, index }))
      .sort((a, b) => a.tile.value - b.tile.value)
      .map(item => item.index);
    
    console.log('Processing order:', sortedIndices.map(i => `tile ${currentTiles[i].id} (value=${currentTiles[i].value})`));
    
    for (const i of sortedIndices) {
      if (processed.has(i)) {
        console.log(`Skipping tile ${currentTiles[i].id} (already processed)`);
        continue;
      }
      
      const tile = currentTiles[i];
      console.log(`\nProcessing tile ${tile.id} (value=${tile.value}, pos=[${tile.row},${tile.col}])`);
      
      let merged = false;
      
      // Check adjacent tiles (simplified - only check directly adjacent)
      const adjacentDirections = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];
      
      // Collect adjacent tiles sorted by value (descending)
      const adjacentTilesList: Array<{ tile: Tile; index: number }> = [];
      for (const { dr, dc } of adjacentDirections) {
        const adjRow = tile.row + dr;
        const adjCol = tile.col + dc;
        
        for (let j = 0; j < currentTiles.length; j++) {
          if (i === j || processed.has(j)) continue;
          
          const otherTile = currentTiles[j];
          if (otherTile.row === adjRow && otherTile.col === adjCol) {
            adjacentTilesList.push({ tile: otherTile, index: j });
          }
        }
      }
      
      adjacentTilesList.sort((a, b) => b.tile.value - a.tile.value);
      console.log(`  Adjacent tiles:`, adjacentTilesList.map(at => `tile ${at.tile.id} (value=${at.tile.value})`));
      
      // Check regular merge
      for (const { tile: otherTile, index: j } of adjacentTilesList) {
        console.log(`  Checking merge with tile ${otherTile.id} (value=${otherTile.value})`);
        
        // Check if current tile divides adjacent tile
        if (tile.value !== otherTile.value && isDivisor(tile.value, otherTile.value)) {
          const newValue = otherTile.value / tile.value;
          console.log(`  ✓ MERGE: ${tile.value} divides ${otherTile.value} → ${newValue}`);
          
          // Current tile disappears (value → 0, we'll filter it out)
          // Adjacent tile becomes newValue
          
          if (newValue === 1) {
            console.log(`  Both tiles disappear (newValue=1)`);
            // Both tiles disappear
          } else {
            console.log(`  Tile ${tile.id} disappears, tile ${otherTile.id} becomes ${newValue}`);
            // Current tile disappears, add new tile with updated value
            newTiles.push({
              ...otherTile,
              value: newValue,
            });
          }
          
          processed.add(i);
          processed.add(j);
          merged = true;
          hasChanges = true;
          break;
        }
      }
      
      if (!merged && !processed.has(i)) {
        console.log(`  No merge, keeping tile ${tile.id}`);
        newTiles.push(tile);
      }
    }
    
    // Filter out tiles with value 0
    currentTiles = newTiles.filter(t => t.value !== 0);
    console.log(`End of iteration ${iteration}:`, currentTiles.map(t => `tile ${t.id} (value=${t.value})`));
  }
  
  console.log('\n=== Chain reaction complete ===');
  console.log('Final tiles:', JSON.stringify(currentTiles, null, 2));
  
  return currentTiles;
}

describe('Chain Reaction: Tiles 3 and 147', () => {
  it('should leave tile 49 on the board after merging 3 and 147', () => {
    const initialTiles: Tile[] = [
      { id: 1, value: 3, row: 0, col: 0 },
      { id: 2, value: 147, row: 0, col: 1 }, // Adjacent to tile 1
    ];
    
    const finalTiles = simulateChainReaction(initialTiles);
    
    // Expected: Only one tile left with value 49
    expect(finalTiles).toHaveLength(1);
    expect(finalTiles[0].value).toBe(49);
  });

  it('should handle case where 49 has no adjacent tiles after merge', () => {
    // After 3 and 147 merge to create 49, there should be no other tiles
    // so 49 should remain on the board
    
    const initialTiles: Tile[] = [
      { id: 1, value: 3, row: 1, col: 1 },
      { id: 2, value: 147, row: 1, col: 2 }, // Adjacent to tile 1
    ];
    
    const finalTiles = simulateChainReaction(initialTiles);
    
    // Expected: Tile 49 at position [1, 2] (where 147 was)
    expect(finalTiles).toHaveLength(1);
    expect(finalTiles[0].value).toBe(49);
    expect(finalTiles[0].row).toBe(1);
    expect(finalTiles[0].col).toBe(2); // Position of the larger tile (147)
  });
});
