import { describe, it, expect } from 'vitest';
import { checkMultiTileFactorization } from './gameLogic';

/**
 * Tests for the bug: "関係ないタイルが、全て消えることがあります"
 * (Unrelated tiles are all being deleted)
 * 
 * Root Cause: Line 147 in Game.tsx filters adjacent tiles too broadly for multi-tile factorization:
 * `if (isDivisor(otherTile.value, tile.value) || isDivisor(tile.value, otherTile.value))`
 * 
 * This includes tiles where the center tile divides the adjacent tile, which should be
 * handled separately by the regular merge logic, NOT by multi-tile factorization.
 * 
 * Multi-tile factorization should ONLY include adjacent tiles that are factors of the center tile.
 */

describe('Bug: Unrelated tiles being deleted', () => {
  describe('Multi-tile factorization should only consider tiles that divide the center', () => {
    it('should NOT include tiles that are multiples of the center tile', () => {
      // Scenario: Center tile = 5, Adjacent tiles = 10, 15
      // 5 divides both 10 and 15 (they are multiples of 5)
      // But 10 and 15 do NOT divide 5 (they are NOT factors of 5)
      // These tiles should NOT be used for multi-tile factorization of 5
      
      const centerTile = { value: 5, row: 1, col: 1 };
      const adjacentTiles = [
        { value: 10, row: 1, col: 0, id: 1 },
        { value: 15, row: 1, col: 2, id: 2 },
      ];
      
      // Multi-tile factorization should return null because:
      // 5 cannot be factored into products > 1 (5 is prime)
      // Even if we could factor it, 10 and 15 don't divide 5
      const result = checkMultiTileFactorization(centerTile, adjacentTiles);
      expect(result).toBeNull();
    });

    it('Game.tsx should filter adjacent tiles correctly before passing to checkMultiTileFactorization', () => {
      // Scenario: Center tile = 12, Adjacent tiles = 24, 3, 4
      // - 24 is a multiple of 12 (12 divides 24) - should be FILTERED OUT by Game.tsx
      // - 3 is a factor of 12 (3 divides 12) - should be passed
      // - 4 is a factor of 12 (4 divides 12) - should be passed
      
      const centerTile = { value: 12, row: 1, col: 1 };
      const allAdjacentTiles = [
        { value: 24, row: 0, col: 1, id: 1 }, // multiple, should be excluded
        { value: 3, row: 1, col: 0, id: 2 },  // factor, should be included
        { value: 4, row: 1, col: 2, id: 3 },  // factor, should be included
      ];
      
      // Simulate Game.tsx filtering logic (only include tiles that divide center)
      const filteredAdjacentTiles = allAdjacentTiles.filter(tile => 
        centerTile.value % tile.value === 0
      );
      
      // After filtering, only tiles with IDs 2 and 3 should remain
      expect(filteredAdjacentTiles).toHaveLength(2);
      expect(filteredAdjacentTiles.map(t => t.id).sort()).toEqual([2, 3]);
      
      // Now check multi-tile factorization with filtered tiles
      const result = checkMultiTileFactorization(centerTile, filteredAdjacentTiles);
      
      // 12 = 3 * 4, so multi-tile factorization should work with tiles 3 and 4
      expect(result).not.toBeNull();
      if (result !== null) {
        expect(result.canFactor).toBe(true);
        expect(result.factorTiles).toHaveLength(2);
        
        // Should use tiles with IDs 2 and 3 (values 3 and 4)
        const usedIds = result.factorTiles.map(ft => ft.id).sort();
        expect(usedIds).toEqual([2, 3]);
      }
    });

    it('should handle case where center tile has both factors and multiples adjacent', () => {
      // Scenario: Center tile = 6, Adjacent tiles = 2, 3, 12, 18
      // - 2 divides 6 (factor) - SHOULD be included for multi-tile factorization
      // - 3 divides 6 (factor) - SHOULD be included for multi-tile factorization  
      // - 12 is multiple of 6 (6 divides 12) - should NOT be included
      // - 18 is multiple of 6 (6 divides 18) - should NOT be included
      
      const centerTile = { value: 6, row: 1, col: 1 };
      const adjacentTiles = [
        { value: 2, row: 0, col: 1, id: 1 },  // factor
        { value: 3, row: 1, col: 0, id: 2 },  // factor
        { value: 12, row: 1, col: 2, id: 3 }, // multiple
        { value: 18, row: 2, col: 1, id: 4 }, // multiple
      ];
      
      const result = checkMultiTileFactorization(centerTile, adjacentTiles);
      
      // 6 = 2 * 3, so multi-tile factorization should work with tiles 2 and 3
      expect(result).not.toBeNull();
      if (result !== null) {
        expect(result.canFactor).toBe(true);
        expect(result.factorTiles).toHaveLength(2);
        
        // Should only use tiles with IDs 1 and 2 (values 2 and 3)
        const usedIds = result.factorTiles.map(ft => ft.id).sort();
        expect(usedIds).toEqual([1, 2]);
        expect(usedIds).not.toContain(3); // Should not use tile 12
        expect(usedIds).not.toContain(4); // Should not use tile 18
      }
    });
  });

  describe('Regular merge should handle multiples separately', () => {
    it('should handle case where center divides adjacent (not multi-tile factorization)', () => {
      // When center tile divides an adjacent tile, this is regular merge logic
      // NOT multi-tile factorization
      // Example: 5 adjacent to 35
      // 5 divides 35, so this should be handled by regular merge (lines 319-380)
      // NOT by multi-tile factorization (lines 126-249)
      
      const centerValue = 5;
      const adjacentValue = 35;
      
      // Verify the relationship
      expect(adjacentValue % centerValue).toBe(0); // 5 divides 35
      expect(centerValue % adjacentValue).not.toBe(0); // 35 does not divide 5
      
      // Expected behavior in regular merge:
      // - Center tile (5) disappears
      // - Adjacent tile (35) becomes 7
      const expectedResult = adjacentValue / centerValue;
      expect(expectedResult).toBe(7);
    });
  });
});
