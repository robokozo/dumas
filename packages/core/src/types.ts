/**
 * A plain data store for one component type. All per-entity data lives in
 * arrays indexed by bitECS entity ID. No lifecycle methods — those live on
 * the ComponentFactory so per-call config (callbacks, options) is accessible.
 */
export interface ComponentStore {}

/**
 * A factory that creates a ComponentStore. Also carries optional lifecycle
 * hooks so that per-entity behaviour (Rapier body creation, callback wiring,
 * etc.) closes over the config passed to the factory call.
 *
 * `__type` is a stable Symbol shared by all factories of the same component
 * type. This lets createPhysics({ ... }) be called inline in component setup
 * without creating a fresh storeRegistry entry on every render.
 */
export interface ComponentFactory<S extends ComponentStore = ComponentStore> {
  (): S;
  __type?: symbol;
  /** Called by useEcsComponent synchronously in setup — inject() is valid here. */
  onMounted?(params: { eid: number; store: S }): void;
  /** Called by useEcsComponent in Vue's onUnmounted lifecycle. */
  onUnmounted?(params: { eid: number; store: S }): void;
}

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

export type RigidBodyType =
  | "dynamic"
  | "fixed"
  | "kinematicPositionBased"
  | "kinematicVelocityBased";
