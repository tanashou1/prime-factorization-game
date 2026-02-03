/**
 * Chain Reaction Logic - Rewritten from scratch based on TILE_MERGING_SPEC.md
 * 
 * This module implements the core tile merging and chain reaction logic.
 * It is completely separated from animation concerns.
 */

import type { Tile } from './types';
import { isDivisor, checkPerfectPowerElimination, checkEqualValueElimination, checkMultiTileFactorization } from './gameLogic';
import { createCleanTile } from './utils/tileHelpers';

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
 * Process a single iteration of chain reactions
 * Returns: { tiles: new tile array, changed: whether any merge occurred, score: points gained }
 */
function processSingleIteration(
  tiles: Tile[],
  nextTileId: number,
  chainMultiplier: number
): { tiles: Tile[]; changed: boolean; score: number; nextTileId: number } {
  // Sort tiles by value (smallest first) as per spec
  const sortedTiles = [...tiles].sort((a, b) => a.value - b.value);
  
  const processedIds = new Set<number>();
  const result: Tile[] = [];
  let changed = false;
  let scoreGained = 0;
  let currentTileId = nextTileId;

  for (const tile of sortedTiles) {
    // Skip tiles with value 0 (already disappearing)
    if (tile.value === 0) {
      result.push(tile);
      continue;
    }

    // Skip if already processed
    if (processedIds.has(tile.id)) {
      continue;
    }

    // Get adjacent tiles that haven't been processed and have value > 0
    const adjacentTiles = getAdjacentTiles(tile, tiles).filter(
      t => !processedIds.has(t.id) && t.value > 0
    );

    // STEP 1: Check for multi-tile factorization
    // Only consider adjacent tiles that DIVIDE the center (are factors)
    const factorTiles = adjacentTiles.filter(adj => isDivisor(adj.value, tile.value));
    
    if (factorTiles.length >= 2) {
      const factorResult = checkMultiTileFactorization(
        { value: tile.value, row: tile.row, col: tile.col },
        factorTiles.map((t, idx) => ({ 
          value: t.value, 
          row: t.row, 
          col: t.col, 
          id: t.id,
          index: idx 
        }))
      );

      if (factorResult !== null) {
        // Multi-tile factorization successful!
        changed = true;
        processedIds.add(tile.id);

        const product = factorResult.factorTiles.reduce((acc, ft) => acc * ft.divisor, 1);
        const centerNewValue = tile.value / product;

        // Score for center tile
        scoreGained += tile.value * chainMultiplier;

        // Update center tile
        if (centerNewValue === 1) {
          // Center disappears
          result.push(createCleanTile(tile, {
            id: currentTileId++,
            value: 0,
            scoreValue: tile.value,
            isDisappearing: true,
            isChaining: true,
            mergeHighlight: true,
          }));
        } else {
          // Center gets new value
          result.push(createCleanTile(tile, {
            id: currentTileId++,
            value: centerNewValue,
            isChaining: true,
            mergeHighlight: true,
          }));
        }

        // Update adjacent tiles
        for (const factorTile of factorResult.factorTiles) {
          const adjacentTile = tiles.find(t => t.id === factorTile.id);
          if (!adjacentTile) continue;

          processedIds.add(adjacentTile.id);
          const newValue = factorTile.value / factorTile.divisor;

          // Score for adjacent tile
          scoreGained += factorTile.value * chainMultiplier;

          if (newValue === 1) {
            // Adjacent tile disappears
            result.push(createCleanTile(adjacentTile, {
              id: currentTileId++,
              value: 0,
              scoreValue: adjacentTile.value,
              isDisappearing: true,
              isChaining: true,
              mergeHighlight: true,
            }));
          } else {
            // Adjacent tile gets new value
            result.push(createCleanTile(adjacentTile, {
              id: currentTileId++,
              value: newValue,
              isChaining: true,
              mergeHighlight: true,
            }));
          }
        }

        continue;  // Skip regular merge checks
      }
    }

    // STEP 2: Check for equal value elimination (any equal values, including perfect powers)
    for (const adjacentTile of adjacentTiles) {
      if (checkEqualValueElimination(tile.value, adjacentTile.value)) {
        // Both tiles eliminate each other
        changed = true;
        processedIds.add(tile.id);
        processedIds.add(adjacentTile.id);

        const mergedScore = tile.value + adjacentTile.value;
        scoreGained += mergedScore * chainMultiplier;

        // Check if they form a perfect power for animation purposes
        const powerType = checkPerfectPowerElimination(tile.value, adjacentTile.value);

        // Both tiles disappear
        result.push(createCleanTile(tile, {
          id: currentTileId++,
          value: 0,
          scoreValue: tile.value,
          isDisappearing: true,
          isPowerEliminating: powerType !== null,
          powerType: powerType || undefined,
          isChaining: true,
          mergeHighlight: true,
        }));

        result.push(createCleanTile(adjacentTile, {
          id: currentTileId++,
          value: 0,
          scoreValue: adjacentTile.value,
          isDisappearing: true,
          isPowerEliminating: powerType !== null,
          powerType: powerType || undefined,
          isChaining: true,
          mergeHighlight: true,
        }));

        break;  // Stop checking other adjacent tiles
      }
    }

    // Skip if already processed by equal value elimination
    if (processedIds.has(tile.id)) {
      continue;
    }

    // STEP 3: Check for regular merge (one divides the other)
    // Sort adjacent by value descending (check larger tiles first for stability)
    const sortedAdjacent = [...adjacentTiles].sort((a, b) => b.value - a.value);
    
    for (const adjacentTile of sortedAdjacent) {
      if (processedIds.has(adjacentTile.id)) {
        continue;
      }

      // Check if current tile divides adjacent tile (tile is smaller divisor)
      if (tile.value !== adjacentTile.value && isDivisor(tile.value, adjacentTile.value)) {
        // Regular merge: smaller disappears, larger is divided
        changed = true;
        processedIds.add(tile.id);
        processedIds.add(adjacentTile.id);

        const newValue = adjacentTile.value / tile.value;
        scoreGained += adjacentTile.value * chainMultiplier;

        // Current tile (smaller) disappears
        result.push(createCleanTile(tile, {
          id: currentTileId++,
          value: 0,
          scoreValue: tile.value,
          isDisappearing: true,
          isChaining: true,
          isDividing: true,
          mergeHighlight: true,
        }));

        // Adjacent tile (larger) is divided
        if (newValue === 1) {
          // Also disappears
          result.push(createCleanTile(adjacentTile, {
            id: currentTileId++,
            value: 0,
            scoreValue: adjacentTile.value,
            isDisappearing: true,
            isChaining: true,
            isDividing: true,
            mergeHighlight: true,
          }));
        } else {
          // Gets new value
          result.push(createCleanTile(adjacentTile, {
            id: currentTileId++,
            value: newValue,
            scoreValue: adjacentTile.value,
            isChaining: true,
            isDividing: true,
            mergeHighlight: true,
          }));
        }

        break;  // Only merge with one adjacent tile per iteration
      }
    }

    // If tile wasn't processed, keep it as-is
    if (!processedIds.has(tile.id)) {
      result.push(tile);
    }
  }

  return {
    tiles: result,
    changed,
    score: scoreGained,
    nextTileId: currentTileId,
  };
}

/**
 * Process complete chain reaction
 * Iterates until no more merges are possible
 */
export function processChainReactions(
  tiles: Tile[],
  chainMultiplier: number = 1,
  startTileId: number
): {
  tiles: Tile[];
  scoreGained: number;
  chainCount: number;
  chainSteps: Tile[][];
  nextTileId: number;
} {
  let currentTiles = tiles;
  let totalScore = 0;
  let chainCount = 0;
  const chainSteps: Tile[][] = [];
  let currentTileId = startTileId;

  // Keep iterating while changes occur
  while (true) {
    const iteration = processSingleIteration(
      currentTiles,
      currentTileId,
      chainMultiplier * Math.pow(2, chainCount)
    );

    if (!iteration.changed) {
      // No more merges possible
      break;
    }

    // Update state
    currentTiles = iteration.tiles;
    currentTileId = iteration.nextTileId;
    totalScore += iteration.score;
    chainCount++;

    // Store this step for animation (include all tiles, even disappearing ones)
    chainSteps.push([...currentTiles]);
  }

  // Filter out tiles with value 0 from final result
  const finalTiles = currentTiles.filter(t => t.value !== 0);

  return {
    tiles: finalTiles,
    scoreGained: totalScore,
    chainCount,
    chainSteps,
    nextTileId: currentTileId,
  };
}
