import type { Vec3, Quat } from "../types";

export interface LoadSceneOptions {
  /**
   * Name of the spawn point in the target scene where persistent entities
   * will be placed on arrival. Falls back to the scene's default spawn
   * point if omitted.
   */
  spawnPoint?: string;
  /** Arbitrary key/value data forwarded to the scene's onSceneEnter hook. */
  params?: Record<string, unknown>;
}

export interface SpawnPointRecord {
  name: string;
  position: Vec3;
  rotation: Quat;
}

export interface SceneEnterContext {
  /** The scene being entered. */
  sceneName: string;
  /** The spawn point used for this transition, or null if none matched. */
  spawnPoint: SpawnPointRecord | null;
  /** Arbitrary data forwarded from loadScene(). */
  params: Record<string, unknown>;
}

export interface SceneExitContext {
  /** The scene being left. */
  sceneName: string;
  /** The scene being transitioned to. */
  nextScene: string;
}

export interface SceneContext {
  /** This scene's registered name. */
  name: string;
  /** Whether this scene is the currently active one. */
  isActive: boolean;
  /** Called internally by <SpawnPoint> on mount. */
  registerSpawnPoint: (record: SpawnPointRecord) => void;
  /** Called internally by <SpawnPoint> on unmount. */
  unregisterSpawnPoint: (params: { name: string }) => void;
}

export type SceneEnterHook = (ctx: SceneEnterContext) => void | Promise<void>;
export type SceneExitHook = (ctx: SceneExitContext) => void | Promise<void>;
