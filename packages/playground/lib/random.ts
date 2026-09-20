export function createSeededRandom(seed: number) {
  // Use a consistent seed for repeatable results across SSR/Client
  let currentSeed = seed;

  return function () {
    // Park-Miller LCG.
    currentSeed = (currentSeed * 16807) % 2147483647;
    return currentSeed / 2147483647;
  };
}
