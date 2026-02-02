# Tile Merging Specification

## Core Rules

### 1. Basic Merging (Regular Merge)
When two tiles are adjacent and one divides the other:

**Rule**: If tile A divides tile B (B % A === 0), they merge:
- Tile A (smaller, divisor) **disappears**
- Tile B (larger, dividend) becomes **B / A**
- Result stays at position of **larger tile (B)**

**Example 1**: Tiles 3 and 147
- 3 divides 147 (147 % 3 === 0) ✓
- 3 disappears
- 147 becomes 147 / 3 = 49
- Result (49) is at 147's original position

**Example 2**: Tiles 5 and 35
- 5 divides 35 (35 % 5 === 0) ✓
- 5 disappears
- 35 becomes 35 / 5 = 7
- Result (7) is at 35's original position

### 2. No Merge Cases
Tiles do NOT merge when:
- Neither divides the other
- They are equal (handled by perfect power elimination instead)

**Example**: Tiles 3 and 7
- 3 does NOT divide 7 (7 % 3 !== 0) ✗
- 7 does NOT divide 3 (3 % 7 !== 0) ✗
- No merge occurs

### 3. Tile Disappearance
A tile disappears (removed from board) when:
- Its value becomes 1 after division
- It's the smaller tile in a regular merge
- It participates in perfect power elimination (e.g., two 49s)

### 4. Chain Reactions
After any merge, the process repeats automatically:
- Check all remaining tiles for adjacent divisibility
- Process tiles from smallest to largest
- Continue until no more merges possible

**Example Chain**: Tiles 2, 3, 6
- Iteration 1: 2 merges with 6 → 2 disappears, 6 becomes 3
- Now have tiles: 3, 3
- Iteration 2: Two 3s (perfect square) eliminate each other → both disappear
- Final: empty board

### 5. Multi-Tile Factorization
When a center tile can be factored into products that ALL divide adjacent tiles:

**Rule**: Center tile C with adjacent tiles A₁, A₂, ..., Aₙ
- Factor C into f₁ × f₂ × ... × fₖ where k ≥ 2
- Each factor fᵢ must divide some unique adjacent tile Aⱼ
- Center becomes C / (f₁ × f₂ × ... × fₖ)
- Each participating adjacent tile Aⱼ becomes Aⱼ / fᵢ

**Important**: Only tiles that DIVIDE the center (factors) are considered for multi-tile factorization.
Tiles that are MULTIPLES of the center are handled by regular merge logic.

**Example**: Center 12 with adjacent 3, 4
- 12 = 3 × 4 ✓
- 3 divides 12 ✓ (factor of center)
- 4 divides 12 ✓ (factor of center)
- Multi-tile factorization applies:
  - Center 12 becomes 12 / (3 × 4) = 1 → disappears
  - Adjacent 3 becomes 3 / 3 = 1 → disappears
  - Adjacent 4 becomes 4 / 4 = 1 → disappears

**Counter-Example**: Center 3 with adjacent 147
- 3 can be factored as 3 × 1, but we need factors > 1
- 3 cannot be factored into 2+ factors all > 1 (3 is prime)
- Multi-tile factorization does NOT apply
- Falls back to regular merge logic

**Counter-Example**: Center 5 with adjacent 10, 15
- 5 divides 10 ✓ BUT 10 is a MULTIPLE of 5, not a factor
- 5 divides 15 ✓ BUT 15 is a MULTIPLE of 5, not a factor
- Multi-tile factorization DOES NOT apply (these are multiples, not factors)
- Falls back to regular merge logic (5 will merge with 10 or 15)

## Expected Behavior for Reported Bug Case

### Scenario: Only tiles 3 and 147 on board, adjacent

**Step-by-step execution**:

1. **Initial state**: Tiles 3 and 147 adjacent
   ```
   [3] [147]
   ```

2. **Chain iteration 1**: Process tiles (smallest first)
   - Process tile 3:
     - Check if 3 divides adjacent 147: 147 % 3 === 0 ✓
     - Regular merge applies:
       - Tile 3 disappears
       - Tile 147 becomes 147 / 3 = 49

   - State after iteration 1:
   ```
   [49]
   ```

3. **Chain iteration 2**: Process remaining tiles
   - Process tile 49:
     - No adjacent tiles
     - No merge occurs
     - Keep tile 49

4. **Final state**: One tile remains
   ```
   [49]
   ```

**Expected Result**: 
- ✓ Tile 3 disappears
- ✓ Tile 147 becomes 49
- ✗ **NOT** both tiles disappear
- ✓ One tile (value 49) remains on board

## Why Both Tiles Should NOT Disappear

For both tiles to disappear, one of the following would need to be true:

1. **Multi-tile factorization**: NO - requires at least 2 adjacent tiles, and we only have 1 adjacent pair
2. **Quotient becomes 1**: NO - 147 / 3 = 49, not 1
3. **Perfect power elimination**: NO - requires equal values (e.g., two 49s)
4. **Bug in code**: This is what we're checking for!

## Implementation Verification Checklist

- [ ] Regular merge correctly identifies when one tile divides another
- [ ] Regular merge makes smaller tile disappear and larger tile become quotient
- [ ] Multi-tile factorization filtering only includes factors, not multiples
- [ ] Chain reaction processes tiles in correct order (smallest first)
- [ ] Chain reaction stops when no more merges possible
- [ ] Tiles with value 0 are filtered out before displaying
- [ ] Animation doesn't hide tiles that should remain visible
