import type { ComputedRef } from "vue";

export interface SceneEnterContext {
  /** The scene being entered. */
  sceneName: string;
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
  isActive: ComputedRef<boolean>;
}

// Lifecycle hook signatures exposed by useScene()
export type SceneEnterHook = (ctx: SceneEnterContext) => void | Promise<void>;
export type SceneExitHook = (ctx: SceneExitContext) => void | Promise<void>;
