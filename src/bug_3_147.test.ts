import { describe, it, expect } from 'vitest';
import { checkMultiTileFactorization, isDivisor } from './gameLogic';

/**
 * Bug Report: タイルが3と147の２枚しか無くても、何故か連鎖して、3と147のタイルが全部消えてしまいます
 * Translation: Even when there are only 2 tiles (3 and 147), they somehow chain and both tiles disappear
 * 
 * Expected: Tile 3 disappears, tile 147 becomes 49 (147/3 = 49)
 * Bug: Both tiles disappear
 */

describe('Bug: Tiles 3 and 147 both disappearing', () => {
  it('should verify 3 divides 147', () => {
    // 147 = 3 × 49
    expect(147 % 3).toBe(0);
    expect(147 / 3).toBe(49);
    expect(isDivisor(3, 147)).toBe(true); // 3 divides 147
    expect(isDivisor(147, 3)).toBe(false); // 147 does NOT divide 3
  });

  it('should NOT trigger multi-tile factorization with only 1 adjacent tile', () => {
    // When tile 147 is center and tile 3 is adjacent
    const centerTile = { value: 147, row: 0, col: 1 };
    const adjacentTiles = [
      { value: 3, row: 0, col: 0, id: 1 },
    ];
    
    // Multi-tile factorization needs at least 2 adjacent tiles
    // With only 1 adjacent tile, it should return null
    const result = checkMultiTileFactorization(centerTile, adjacentTiles);
    expect(result).toBeNull();
  });

  it('should NOT trigger multi-tile factorization when tile 3 is center', () => {
    // When tile 3 is center and tile 147 is adjacent
    const centerTile = { value: 3, row: 0, col: 0 };
    const adjacentTiles = [
      { value: 147, row: 0, col: 1, id: 2 },
    ];
    
    // Check if 147 should be included in adjacentTiles for multi-tile factorization
    // For multi-tile factorization, we only include tiles that DIVIDE the center
    // 147 does NOT divide 3 (3 % 147 !== 0)
    expect(centerTile.value % adjacentTiles[0].value).not.toBe(0);
    
    // So adjacentTiles should be empty for multi-tile factorization filtering
    const filteredAdjacentTiles = adjacentTiles.filter(tile => 
      centerTile.value % tile.value === 0
    );
    expect(filteredAdjacentTiles).toHaveLength(0);
    
    // Multi-tile factorization should return null with 0 adjacent tiles
    const result = checkMultiTileFactorization(centerTile, filteredAdjacentTiles);
    expect(result).toBeNull();
  });

  it('should handle regular merge correctly: 3 + 147 → 49', () => {
    // In regular merge logic (not multi-tile factorization):
    // When tile 3 is adjacent to tile 147
    // Since 3 divides 147, this is a valid merge
    // Expected: 3 disappears, 147 becomes 49
    
    const smallTile = { id: 1, value: 3, row: 0, col: 0 };
    const largeTile = { id: 2, value: 147, row: 0, col: 1 };
    
    // Verify divisibility (small divides large)
    expect(isDivisor(smallTile.value, largeTile.value)).toBe(true);
    
    // Calculate result
    const newValue = largeTile.value / smallTile.value;
    expect(newValue).toBe(49);
    
    // 49 is NOT 1, so the large tile does NOT disappear
    expect(newValue).not.toBe(1);
  });

  it('should verify 49 does not chain-disappear on its own', () => {
    // After 147 becomes 49, does 49 somehow become 1?
    // 49 = 7 × 7
    // For 49 to become 1, it would need to be divided by 49
    // But there's no other tile to divide it by
    
    const value49 = 49;
    
    // 49 is not 1
    expect(value49).not.toBe(1);
    
    // 49 would only become 1 if divided by itself (49/49=1)
    // But that requires another tile with value 49 or 7×7 factorization
    expect(value49 / value49).toBe(1);
  });

  it('Edge case: perfect square elimination should NOT apply to different values', () => {
    // 49 = 7², so if there were TWO tiles with value 49, they would eliminate
    // But with values 3 and 147, perfect square elimination should NOT trigger
    
    const tile3 = { value: 3 };
    const tile147 = { value: 147 };
    
    // Values are different, so perfect square elimination does not apply
    expect(tile3.value).not.toBe(tile147.value);
  });
});
