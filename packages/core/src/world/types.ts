import type { World } from "bitecs";
import type { Vec3 } from "../types";
import type { LoadSceneOptions } from "../scene/types";

export interface WorldOptions {
  /** Gravity vector. Default: { x: 0, y: -9.81, z: 0 } */
  gravity?: Vec3;
  /**
   * Physics timestep in seconds. Default: 1/60.
   * Forwarded to <Physics> from @tresjs/rapier.
   */
  timestep?: number;
}

export interface WorldContext {
  /** The bitECS world instance. Use for ECS queries and component access. */
  ecsWorld: World;
  /**
   * Transition to a named scene. Destroys non-persistent entities from the
   * current scene, moves persistent entities to the target spawn point,
   * and fires onSceneExit / onSceneEnter lifecycle hooks.
   */
  loadScene: (params: { name: string; options?: LoadSceneOptions }) => Promise<void>;
  /** Name of the currently active scene, or null before any scene is loaded. */
  activeScene: string | null;
}
