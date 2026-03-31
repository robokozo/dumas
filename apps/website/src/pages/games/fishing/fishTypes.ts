export interface FishSpecies {
  name: string;
  color: string;
  speed: number;
  depth: number;
  size: number;
}

export const FISH_SPECIES: Array<FishSpecies> = [
  { name: "Bluegill", color: "#4ecdc4", speed: 1.2, depth: -1.8, size: 0.3 },
  { name: "Salmon", color: "#ff6b6b", speed: 2.0, depth: -2.2, size: 0.45 },
  { name: "Goldfish", color: "#ffe66d", speed: 2.8, depth: -1.5, size: 0.25 },
  { name: "Catfish", color: "#c9b1ff", speed: 0.8, depth: -3.0, size: 0.5 },
] as const;
