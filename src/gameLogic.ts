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

// Check if a tile can be factored by multiple adjacent tiles (Issue #5)
// Returns the tiles that can divide the center tile
export function checkMultiTileFactorization(
  centerTile: { value: number; row: number; col: number },
  adjacentTiles: Array<{ value: number; row: number; col: number; id: number }>
): { canFactor: boolean; factorTiles: Array<{ id: number; value: number }> } | null {
  // We need at least 2 adjacent tiles for multi-tile factorization
  if (adjacentTiles.length < 2) return null;
  
  // Try all combinations of adjacent tiles to see if their product divides the center tile
  // We'll try combinations of size 2 or more
  for (let size = 2; size <= adjacentTiles.length; size++) {
    // Generate all combinations of 'size' tiles
    const combinations = getCombinations(adjacentTiles, size);
    
    for (const combination of combinations) {
      // Calculate the product of values in this combination
      const product = combination.reduce((acc, tile) => acc * tile.value, 1);
      
      // Check if this product exactly divides the center tile
      if (centerTile.value % product === 0) {
        // Each factor tile becomes 1 (then disappears)
        const factorTiles = combination.map(tile => ({
          id: tile.id,
          value: tile.value,
        }));
        
        return {
          canFactor: true,
          factorTiles,
        };
      }
    }
  }
  
  return null;
}

// Helper function to generate all combinations of a given size
function getCombinations<T>(array: T[], size: number): T[][] {
  if (size === 1) return array.map(item => [item]);
  if (size === array.length) return [array];
  
  const combinations: T[][] = [];
  
  function combine(start: number, current: T[]) {
    if (current.length === size) {
      combinations.push([...current]);
      return;
    }
    
    for (let i = start; i < array.length; i++) {
      current.push(array[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  
  combine(0, []);
  return combinations;
}
