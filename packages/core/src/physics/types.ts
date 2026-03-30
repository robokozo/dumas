import type { Collider } from "@dimforge/rapier3d-compat";
import type { Vec3 } from "../types";

/**
 * Contact data passed to onCollision callbacks on createPhysics and
 * individual collider configs.
 */
export interface PhysicsContact {
  /** The other Rapier Collider involved in the contact. */
  otherCollider: Collider;
  /** World-space contact normal pointing from self toward other. */
  normal: Vec3;
  /**
   * Name of the collider on this entity that was hit, as declared in
   * createPhysics({ colliders: { name: ... } }).
   */
  which: string;
  /** bitECS entity ID of the other entity, or null if it has no physics component. */
  otherEid: number | null;
}

/** Contact data passed to onCollisionEnd callbacks — normal not available once separated. */
export type PhysicsContactEnd = Omit<PhysicsContact, "normal">;
