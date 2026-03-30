import type { PhysicsContact, PhysicsContactEnd } from "./types";

/**
 * Plain collider configuration objects — no Vue, no Rapier imports.
 * Pass these into createPhysics({ colliders: { name: createXCollider(...) } }).
 *
 * Each collider can carry its own onCollision / onCollisionEnd callback that
 * fires only when that specific collider is contacted. The top-level
 * createPhysics({ onCollision }) fires for any collider on the entity.
 */

interface ColliderConfigBase {
  friction?: number;
  restitution?: number;
  mass?: number;
  density?: number;
  sensor?: boolean;
  /** Fires when this specific collider starts contacting another body. */
  onCollision?: (contact: PhysicsContact) => void;
  /** Fires when this specific collider stops contacting another body. */
  onCollisionEnd?: (contact: PhysicsContactEnd) => void;
}

export interface SphereColliderConfig extends ColliderConfigBase {
  shape: "ball";
  radius: number;
}

export interface CuboidColliderConfig extends ColliderConfigBase {
  shape: "cuboid";
  halfExtents: [number, number, number];
}

export interface CapsuleColliderConfig extends ColliderConfigBase {
  shape: "capsule";
  halfHeight: number;
  radius: number;
}

export interface ConeColliderConfig extends ColliderConfigBase {
  shape: "cone";
  halfHeight: number;
  radius: number;
}

export interface CylinderColliderConfig extends ColliderConfigBase {
  shape: "cylinder";
  halfHeight: number;
  radius: number;
}

export type ColliderConfig =
  | SphereColliderConfig
  | CuboidColliderConfig
  | CapsuleColliderConfig
  | ConeColliderConfig
  | CylinderColliderConfig;

export function createSphereCollider(
  config: Omit<SphereColliderConfig, "shape">,
): SphereColliderConfig {
  return { shape: "ball", ...config };
}

export function createCuboidCollider(
  config: Omit<CuboidColliderConfig, "shape">,
): CuboidColliderConfig {
  return { shape: "cuboid", ...config };
}

export function createCapsuleCollider(
  config: Omit<CapsuleColliderConfig, "shape">,
): CapsuleColliderConfig {
  return { shape: "capsule", ...config };
}

export function createConeCollider(config: Omit<ConeColliderConfig, "shape">): ConeColliderConfig {
  return { shape: "cone", ...config };
}

export function createCylinderCollider(
  config: Omit<CylinderColliderConfig, "shape">,
): CylinderColliderConfig {
  return { shape: "cylinder", ...config };
}
