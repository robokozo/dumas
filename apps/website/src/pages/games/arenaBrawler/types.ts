export interface EnemySpawn {
  id: number;
  x: number;
  z: number;
  health: number;
}

export interface HealthBarEntry {
  eid: number;
  current: number;
  max: number;
}

export type GameState = "playing" | "victory" | "defeat";
