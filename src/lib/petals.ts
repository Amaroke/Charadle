export type PetalVariant = 1 | 2 | 3;

export type Petal = {
  variant: PetalVariant;
  left: number;
  delay: number;
};

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createPetals(count: number, seed: number): Petal[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    variant: (Math.floor(random() * 3) + 1) as PetalVariant,
    left: random() * 95,
    delay: random() * 10,
  }));
}
