import type { Vec3 } from "./types";

export const DEFAULT_GRAVITY: Vec3 = { x: 0, y: -9.81, z: 0 } as const;

export const DEFAULT_TIMESTEP = 1 / 60;

export const DEFAULT_RESTITUTION = 0.5;

export const DEFAULT_FRICTION = 0.5;

export const DEFAULT_DENSITY = 1.0;

// ZAII defaults for Transform component
// bitECS 0.4 zero-initializes all fields, so quaternion w and scale need explicit defaults
export const TRANSFORM_DEFAULTS = {
  rotW: 1,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
} as const;
