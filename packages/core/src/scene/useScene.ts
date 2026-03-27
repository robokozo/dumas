import { inject } from "vue";
import { SCENE_KEY } from "../keys";
import type { SceneEnterHook, SceneExitHook } from "./types";

export interface UseSceneReturn {
  /** Register a callback that fires when this scene becomes active. */
  onSceneEnter: (fn: SceneEnterHook) => void;
  /** Register a callback that fires when this scene is being left. */
  onSceneExit: (fn: SceneExitHook) => void;
  /** The name of the current scene. */
  sceneName: string;
}

export function useScene(): UseSceneReturn {
  const ctx = inject(SCENE_KEY);
  if (ctx === undefined) {
    throw new Error("[dumas] useScene() must be called inside a <Scene> component.");
  }

  const enterHooks: Array<SceneEnterHook> = [];
  const exitHooks: Array<SceneExitHook> = [];

  return {
    sceneName: ctx.name,
    onSceneEnter: (fn) => {
      enterHooks.push(fn);
    },
    onSceneExit: (fn) => {
      exitHooks.push(fn);
    },
  };
}
