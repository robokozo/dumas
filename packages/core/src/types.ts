export interface ComponentStore {
  onMounted?: ({ eid }: { eid: number }) => void;
  onUnmounted?: ({ eid }: { eid: number }) => void;
}

/**
 * A factory function that creates a fresh ComponentStore instance.
 * Used as the identity key in the Game store registry — each <Game>
 * maintains its own instance per factory, preventing data collisions
 * when multiple games run on the same page.
 */
export type ComponentFactory<S extends ComponentStore = ComponentStore> = () => S;

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
