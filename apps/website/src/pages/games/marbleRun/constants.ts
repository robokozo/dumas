import type { RampConfig } from "./types";

// ── Physics ──────────────────────────────────────────────────────────────────
export const GRAVITY_Y = -9.81;

// ── Marble ───────────────────────────────────────────────────────────────────
export const MARBLE_RADIUS = 0.3;
export const MARBLE_RESTITUTION = 0.4;
export const MARBLE_FRICTION = 0.5;
export const MAX_MARBLES = 3;

// ── Start — seesaw is the landing pad at the top ───────────────────────────
export const START_PLATFORM_X = 0;
export const START_PLATFORM_Y = 10;
export const START_PLATFORM_Z = 0;

// ── Ramp configuration ──────────────────────────────────────────────────────
// Zigzag ramps descending from left to right and back.
// Angle is rotation around the Z axis in radians.
const RAMP_TILT = 0.18;
const RAMP_COLOR_A = "#4a5568";
const RAMP_COLOR_B = "#553c6e";

export const RAMPS: Array<RampConfig> = [
  {
    x: -2.5,
    y: 8.0,
    z: 0,
    halfWidth: 2.5,
    halfHeight: 0.15,
    halfDepth: 1.2,
    angle: -RAMP_TILT,
    color: RAMP_COLOR_A,
  },
  {
    x: 2.5,
    y: 5.8,
    z: 0,
    halfWidth: 2.5,
    halfHeight: 0.15,
    halfDepth: 1.2,
    angle: RAMP_TILT,
    color: RAMP_COLOR_B,
  },
  {
    x: -2.5,
    y: 3.6,
    z: 0,
    halfWidth: 2.5,
    halfHeight: 0.15,
    halfDepth: 1.2,
    angle: -RAMP_TILT,
    color: RAMP_COLOR_A,
  },
  {
    x: 2.5,
    y: 1.4,
    z: 0,
    halfWidth: 2.5,
    halfHeight: 0.15,
    halfDepth: 1.2,
    angle: RAMP_TILT,
    color: RAMP_COLOR_B,
  },
] satisfies Array<RampConfig>;

// ── Seesaw — now at the top, replaces start platform ────────────────────────
export const SEESAW_X = 0;
export const SEESAW_Y = START_PLATFORM_Y;
export const SEESAW_Z = 0;
export const SEESAW_HALF_WIDTH = 2.5;
export const SEESAW_HALF_HEIGHT = 0.12;
export const SEESAW_HALF_DEPTH = 1.2;
export const SEESAW_ANGLE_LIMIT = 0.3;

// ── Spring bumper — at the end of ramp 2, redirects marbles ─────────────────
export const BUMPER_X = 5;
export const BUMPER_Y = 5.4;
export const BUMPER_Z = 0;
export const BUMPER_REST_LENGTH = 0.3;
export const BUMPER_STIFFNESS = 400;
export const BUMPER_DAMPING = 3;

// ── Goal funnel ──────────────────────────────────────────────────────────────
export const GOAL_X = 0;
export const GOAL_Y = -1.0;
export const GOAL_Z = 0;

// ── Checkpoints ──────────────────────────────────────────────────────────────
export const CHECKPOINT_RADIUS = 1.5;

// ── Scoring ──────────────────────────────────────────────────────────────────
export const CHECKPOINT_POINTS = 50;
export const GOAL_POINTS = 200;

// ── Colors ───────────────────────────────────────────────────────────────────
export const MARBLE_COLORS = ["#ff6b6b", "#4ecdc4", "#ffe66d"] as const;
export const CHECKPOINT_COLOR_INACTIVE = "#4488ff";
export const CHECKPOINT_COLOR_ACTIVE = "#44ff44";
export const GOAL_COLOR = "#ffd700";
export const SEESAW_COLOR = "#e07050";
export const BUMPER_COLOR = "#ff4488";
export const WALL_COLOR = "#2a2a3e";
