/** Arena dimensions — half-extent of the square arena floor. */
export const ARENA_HALF_SIZE = 8;

/** Height of the arena boundary walls. */
export const WALL_HEIGHT = 1.5;

/** Thickness of each boundary wall. */
export const WALL_THICKNESS = 0.5;

/** Player movement speed in units per second. */
export const PLAYER_SPEED = 5;

/** Player maximum health points. */
export const PLAYER_MAX_HEALTH = 100;

/** Duration of a weapon swing animation in seconds. */
export const SWING_DURATION = 0.3;

/** Cooldown between player attacks in seconds. */
export const ATTACK_COOLDOWN = 0.5;

/** Weapon offset distance from player center. */
export const WEAPON_OFFSET = 1.0;

/** Weapon half-extents for the box geometry. */
export const WEAPON_HALF_WIDTH = 0.15;
export const WEAPON_HALF_HEIGHT = 0.3;
export const WEAPON_HALF_DEPTH = 0.5;

/** Damage dealt per weapon hit. */
export const WEAPON_DAMAGE = 25;

/** Trigger zone radius for weapon hits. */
export const WEAPON_TRIGGER_RADIUS = 1.2;

/** Enemy movement speed in units per second. */
export const ENEMY_SPEED = 2.2;

/** Enemy maximum health points. */
export const ENEMY_MAX_HEALTH = 75;

/** Damage dealt by enemy contact per hit. */
export const ENEMY_CONTACT_DAMAGE = 10;

/** Cooldown between enemy contact damage hits in seconds. */
export const ENEMY_DAMAGE_COOLDOWN = 1.0;

/** Trigger zone radius for enemy contact damage. */
export const ENEMY_TRIGGER_RADIUS = 1.3;

/** Number of enemies to spawn. */
export const ENEMY_COUNT = 4;

/** Spawn distance from arena center. */
export const ENEMY_SPAWN_RADIUS = 6;

/** Player character color. */
export const PLAYER_COLOR = "#4488ff";

/** Enemy character color. */
export const ENEMY_COLOR = "#ff4444";

/** Weapon color. */
export const WEAPON_COLOR = "#cccccc";

/** Weapon active (swinging) color. */
export const WEAPON_ACTIVE_COLOR = "#ffcc44";

/** Arena floor color. */
export const ARENA_FLOOR_COLOR = "#333340";

/** Arena wall color. */
export const ARENA_WALL_COLOR = "#555566";

/** Gamepad analog stick deadzone threshold. */
export const ANALOG_THRESHOLD = 0.3;

/** Y offset for health bar world-to-screen projection. */
export const HEALTH_BAR_Y_OFFSET = 1.8;

/** Lerp factor for enemy movement smoothing. */
export const ENEMY_LERP = 0.06;
