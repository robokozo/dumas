// ── Path layout ─────────────────────────────────────────────────────────────
/** Enemies walk along +X from SPAWN_X to GOAL_X at Z = PATH_Z. */
export const SPAWN_X = -10;
export const GOAL_X = 10;
export const PATH_Z = 0;
export const PATH_Y = 0.4;

// ── Enemy ───────────────────────────────────────────────────────────────────
export const ENEMY_SPEED = 2.5;
export const ENEMY_RADIUS = 0.35;
export const ENEMY_MAX_HEALTH = 3;

// ── Tower ───────────────────────────────────────────────────────────────────
export const TOWER_RANGE = 3.5;
export const TOWER_FIRE_INTERVAL = 0.8;
export const TOWER_BASE_HEIGHT = 0.6;
export const TOWER_HEAD_HEIGHT = 0.35;
export const TOWER_COST = 1;

/** X positions of the 3 tower slots along the path. */
export const TOWER_SLOT_POSITIONS: Array<{ x: number; z: number }> = [
  { x: -4, z: -2 },
  { x: 0, z: 2 },
  { x: 4, z: -2 },
];

// ── Projectile ──────────────────────────────────────────────────────────────
export const PROJECTILE_SPEED = 12;
export const PROJECTILE_RADIUS = 0.12;
export const PROJECTILE_HIT_DISTANCE = 0.5;

// ── Spawning ────────────────────────────────────────────────────────────────
export const SPAWN_INTERVAL = 1.6;
export const ENEMIES_PER_WAVE = 6;

// ── Player ──────────────────────────────────────────────────────────────────
export const STARTING_LIVES = 10;
export const STARTING_GOLD = 3;
export const KILL_REWARD = 1;
