/** Player ship movement speed in units per second. */
export const SHIP_SPEED = 6;

/** Radius within which the tractor beam can pull debris. */
export const TRACTOR_BEAM_RADIUS = 4;

/** Speed at which debris is pulled toward the ship. */
export const TRACTOR_PULL_SPEED = 5;

/** Distance at which debris is considered collected. */
export const COLLECTION_DISTANCE = 0.6;

/** Number of debris pieces spawned at start. */
export const INITIAL_DEBRIS_COUNT = 15;

/** Maximum distance from origin for debris spawn positions. */
export const SPAWN_RADIUS = 12;

/** Minimum tumble speed for debris rotation. */
export const MIN_TUMBLE_SPEED = 0.5;

/** Maximum tumble speed for debris rotation. */
export const MAX_TUMBLE_SPEED = 3.0;

/** Number of stars in the background. */
export const STAR_COUNT = 400;

/** Spread of the star field. */
export const STAR_SPREAD = 60;

/** Camera height above the XZ plane. */
export const CAMERA_HEIGHT = 18;

/** Debris colors by type. */
export const DEBRIS_COLORS = {
  rock: "#8a7060",
  panel: "#5577aa",
  hull: "#999999",
  crystal: "#44ddaa",
} as const;

/** Minimum debris size. */
export const MIN_DEBRIS_SIZE = 0.2;

/** Maximum debris size. */
export const MAX_DEBRIS_SIZE = 0.6;

/** Points awarded per debris collected. */
export const POINTS_PER_DEBRIS = 10;

/** How many new debris pieces spawn per wave. */
export const WAVE_SIZE = 5;

/** Interval in seconds between spawning new debris waves. */
export const WAVE_INTERVAL = 8;
