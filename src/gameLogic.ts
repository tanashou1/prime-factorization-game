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
