export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

// Mirrors @tresjs/rapier RigidBody type prop values
export type RigidBodyType =
  | "dynamic"
  | "fixed"
  | "kinematicPositionBased"
  | "kinematicVelocityBased";
