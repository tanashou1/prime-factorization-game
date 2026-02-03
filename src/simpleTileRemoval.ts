/**
 * Simplified Tile Removal Logic
 * 
 * After tiles move and stop, for each tile that moved:
 * - Check adjacent tiles in descending order by value
 * - If an adjacent tile's value is a multiple of the moved tile's value:
 *   - Delete the moved tile
 *   - Divide the adjacent tile by the moved tile's value
 */

import type { Tile } from './types';

/**
 * Get all tiles adjacent to a given tile
 */
function getAdjacentTiles(
  tile: { row: number; col: number },
  allTiles: Tile[]
): Tile[] {
  const adjacent: Tile[] = [];
  const directions = [
    { dr: -1, dc: 0 },  // up
    { dr: 1, dc: 0 },   // down
    { dr: 0, dc: -1 },  // left
    { dr: 0, dc: 1 },   // right
  ];

  for (const { dr, dc } of directions) {
    const adjRow = tile.row + dr;
    const adjCol = tile.col + dc;
    
    for (const otherTile of allTiles) {
      if (otherTile.row === adjRow && otherTile.col === adjCol) {
        adjacent.push(otherTile);
        break;  // Only one tile per position
      }
    }
  }

  return adjacent;
}

/**
 * Process tile removal after movement
 * Only processes tiles that have moved (marked with isMoving flag)
 */
export function processTileRemoval(
  tiles: Tile[],
  nextTileId: number
): {
  tiles: Tile[];
  scoreGained: number;
  nextTileId: number;
} {
  // Identify tiles that moved
  const movedTiles = tiles.filter(t => t.isMoving);
  
  // Track tiles to remove and tiles to update
  const tilesToRemove = new Set<number>();
  const tileUpdates = new Map<number, { value: number; scoreValue: number }>();
  
  let currentTileId = nextTileId;
  let scoreGained = 0;
  
  // Process each moved tile
  for (const movedTile of movedTiles) {
    // Skip if already marked for removal
    if (tilesToRemove.has(movedTile.id)) {
      continue;
    }
    
    // Get adjacent tiles (excluding already removed tiles)
    const adjacentTiles = getAdjacentTiles(movedTile, tiles)
      .filter(t => !tilesToRemove.has(t.id));
    
    // Sort adjacent tiles by value in descending order (create copy to avoid mutation)
    const sortedAdjacent = [...adjacentTiles].sort((a, b) => b.value - a.value);
    
    // Check each adjacent tile
    for (const adjacentTile of sortedAdjacent) {
      // First check for equal value elimination
      if (movedTile.value === adjacentTile.value) {
        // Both tiles eliminate each other
        tilesToRemove.add(movedTile.id);
        tilesToRemove.add(adjacentTile.id);
        
        // Add score for both tiles
        scoreGained += movedTile.value + adjacentTile.value;
        
        // Only process once per moved tile (one pair at a time)
        break;
      }
      
      // Check if adjacent tile's value is a multiple of moved tile's value
      // (excluding equal values, which are handled above)
      if (adjacentTile.value % movedTile.value === 0 && adjacentTile.value !== movedTile.value) {
        // Delete the moved tile
        tilesToRemove.add(movedTile.id);
        
        // Divide the adjacent tile
        const newValue = adjacentTile.value / movedTile.value;
        tileUpdates.set(adjacentTile.id, {
          value: newValue,
          scoreValue: adjacentTile.value
        });
        
        // Add score
        scoreGained += adjacentTile.value;
        
        // Only process once per moved tile (one merge at a time)
        break;
      }
    }
  }
  
  // Build result tiles array
  const resultTiles: Tile[] = [];
  
  for (const tile of tiles) {
    if (tilesToRemove.has(tile.id)) {
      // Mark tile for removal with disappearing animation
      resultTiles.push({
        ...tile,
        id: currentTileId++,
        value: 0,
        scoreValue: tile.value,
        isDisappearing: true,
        mergeHighlight: true,
      });
    } else if (tileUpdates.has(tile.id)) {
      // Update tile value
      const update = tileUpdates.get(tile.id)!;
      if (update.value === 1) {
        // Tile becomes 1, mark for removal
        resultTiles.push({
          ...tile,
          id: currentTileId++,
          value: 0,
          scoreValue: update.scoreValue,
          isDisappearing: true,
          mergeHighlight: true,
        });
      } else {
        // Update to new value
        resultTiles.push({
          ...tile,
          id: currentTileId++,
          value: update.value,
          scoreValue: update.scoreValue,
          mergeHighlight: true,
        });
      }
    } else {
      // Keep tile as is
      resultTiles.push(tile);
    }
  }
  
  return {
    tiles: resultTiles,
    scoreGained,
    nextTileId: currentTileId,
  };
}
