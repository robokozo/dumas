import { inject, onUnmounted } from "vue";
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

  const registered: Array<{ list: Array<unknown>; fn: unknown }> = [];

  onUnmounted(() => {
    for (const { list, fn } of registered) {
      const idx = list.indexOf(fn);
      if (idx !== -1) {
        list.splice(idx, 1);
      }
    }
  });

  return {
    sceneName: ctx.name,
    onSceneEnter: (fn) => {
      ctx.enterHooks.push(fn);
      registered.push({ list: ctx.enterHooks, fn });
    },
    onSceneExit: (fn) => {
      ctx.exitHooks.push(fn);
      registered.push({ list: ctx.exitHooks, fn });
    },
  };
}
