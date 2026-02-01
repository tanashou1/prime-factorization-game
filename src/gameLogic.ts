// Generate primes up to max using Sieve of Eratosthenes
export function generatePrimes(max: number): number[] {
  if (max < 2) return [];
  
  const sieve = new Array(max + 1).fill(true);
  sieve[0] = sieve[1] = false;
  
  for (let i = 2; i * i <= max; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= max; j += i) {
        sieve[j] = false;
      }
    }
  }
  
  return sieve
    .map((isPrime, num) => isPrime ? num : -1)
    .filter(num => num !== -1);
}

// Generate a random tile value as a product of primes up to maxPrime
export function generateRandomTileValue(maxPrime: number): number {
  const primes = generatePrimes(maxPrime);
  if (primes.length === 0) return 2;
  
  // Generate a random product of 1-3 primes
  const numPrimes = Math.floor(Math.random() * 3) + 1;
  let value = 1;
  
  for (let i = 0; i < numPrimes; i++) {
    const randomPrime = primes[Math.floor(Math.random() * primes.length)];
    value *= randomPrime;
  }
  
  return value;
}

// Check if a is a divisor of b
export function isDivisor(a: number, b: number): boolean {
  return b % a === 0;
}

// Get all empty positions on the board
export function getEmptyPositions(
  tiles: Array<{ row: number; col: number }>,
  boardSize: number
): Array<{ row: number; col: number }> {
  const occupied = new Set(tiles.map(t => `${t.row},${t.col}`));
  const empty: Array<{ row: number; col: number }> = [];
  
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (!occupied.has(`${row},${col}`)) {
        empty.push({ row, col });
      }
    }
  }
  
  return empty;
}

// Check if a number is a perfect square (n²)
export function isPerfectSquare(n: number): boolean {
  if (n <= 0) return false;
  const sqrt = Math.sqrt(n);
  return sqrt === Math.floor(sqrt);
}

// Epsilon for floating point precision comparisons
const FLOAT_PRECISION_EPSILON = 0.0001;

// Check if a number is a perfect cube (n³)
export function isPerfectCube(n: number): boolean {
  if (n <= 0) return false;
  const cbrt = Math.cbrt(n);
  // Use a small epsilon to handle floating point precision
  const rounded = Math.round(cbrt);
  return Math.abs(rounded ** 3 - n) < FLOAT_PRECISION_EPSILON;
}

// Check if two equal numbers form a perfect power (square or cube)
// Returns the type of power if they do, null otherwise
export function checkPerfectPowerElimination(value1: number, value2: number): 'square' | 'cube' | null {
  // Only check if both values are equal
  if (value1 !== value2) return null;
  
  // Check for perfect square (e.g., 4, 9, 16, 25)
  if (isPerfectSquare(value1)) {
    return 'square';
  }
  
  // Check for perfect cube (e.g., 8, 27, 64, 125)
  if (isPerfectCube(value1)) {
    return 'cube';
  }
  
  return null;
}

// Get all divisors of a number
function getDivisors(n: number): number[] {
  const divisors: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (n % i === 0) {
      divisors.push(i);
    }
  }
  return divisors;
}

// Find all ways to factor a number into exactly 'count' factors (> 1)
function getFactorizations(n: number, count: number): number[][] {
  if (count === 1) {
    return [[n]];
  }
  
  const results: number[][] = [];
  const divisors = getDivisors(n);
  
  for (const d of divisors) {
    if (d > n / d) break; // Avoid duplicate factorizations
    
    const remaining = n / d;
    if (count === 2) {
      results.push([d, remaining]);
    } else {
      // Recursively factor the remaining part
      const subFactorizations = getFactorizations(remaining, count - 1);
      for (const subFactor of subFactorizations) {
        // Only add if factors are in non-decreasing order to avoid duplicates
        if (d <= subFactor[0]) {
          results.push([d, ...subFactor]);
        }
      }
    }
  }
  
  return results;
}

// Check if a tile can be factored by multiple adjacent tiles (Issue #5)
// The center tile is factored, and each factor divides an adjacent tile
export function checkMultiTileFactorization(
  centerTile: { value: number; row: number; col: number },
  adjacentTiles: Array<{ value: number; row: number; col: number; id: number }>
): { canFactor: boolean; factorTiles: Array<{ id: number; value: number; divisor: number }> } | null {
  // We need at least 2 adjacent tiles for multi-tile factorization
  if (adjacentTiles.length < 2) return null;
  
  // Try to factor the center tile into 2 or more factors
  for (let numFactors = 2; numFactors <= adjacentTiles.length; numFactors++) {
    const factorizations = getFactorizations(centerTile.value, numFactors);
    
    for (const factors of factorizations) {
      // Try to match each factor to an adjacent tile
      // We need to find a valid assignment where each factor divides an adjacent tile
      const assignment = findFactorAssignment(factors, adjacentTiles);
      
      if (assignment !== null) {
        // Found a valid factorization!
        return {
          canFactor: true,
          factorTiles: assignment,
        };
      }
    }
  }
  
  return null;
}

// Find an assignment of factors to adjacent tiles such that each factor divides its assigned tile
function findFactorAssignment(
  factors: number[],
  adjacentTiles: Array<{ value: number; row: number; col: number; id: number }>
): Array<{ id: number; value: number; divisor: number }> | null {
  // Try all permutations of adjacent tiles to find a valid assignment
  const usedIndices = new Set<number>();
  const assignment: Array<{ id: number; value: number; divisor: number }> = [];
  
  function tryAssign(factorIndex: number): boolean {
    if (factorIndex === factors.length) {
      return true; // All factors assigned successfully
    }
    
    const factor = factors[factorIndex];
    
    for (let i = 0; i < adjacentTiles.length; i++) {
      if (usedIndices.has(i)) continue;
      
      const tile = adjacentTiles[i];
      if (tile.value % factor === 0) {
        // This tile can be divided by this factor
        usedIndices.add(i);
        assignment.push({
          id: tile.id,
          value: tile.value,
          divisor: factor,
        });
        
        if (tryAssign(factorIndex + 1)) {
          return true;
        }
        
        // Backtrack
        usedIndices.delete(i);
        assignment.pop();
      }
    }
    
    return false;
  }
  
  if (tryAssign(0)) {
    return assignment;
  }
  
  return null;
}

