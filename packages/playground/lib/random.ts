export function createSeededRandom(seed: number) {
  // Use a consistent seed for repeatable results across SSR/Client
  let currentSeed = seed;

  return function () {
    // A common LCG algorithm (Park-Miller) - uses 32-bit math
    currentSeed = (currentSeed * 16807) % 2147483647; // Prime modulus
    return currentSeed / 2147483647; // Normalize to 0-1 range
  };
}
