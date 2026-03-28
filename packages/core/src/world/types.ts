import type { World } from "bitecs";
import type { DeepReadonly, Ref } from "vue";
import type { ComponentFactory, ComponentStore } from "../types";
import type { LoadSceneOptions } from "../scene/types";

export interface GameContext {
  /** The bitECS world instance. Use for ECS queries and component access. */
  world: World;
  /**
   * Per-game registry mapping component factories to their store instances.
   * Ensures each <Game> gets isolated store arrays — prevents eid collisions
   * when multiple games run on the same page.
   */
  storeRegistry: Map<ComponentFactory, ComponentStore>;
  /**
   * Transition to a named scene. Destroys non-persistent entities from the
   * current scene, moves persistent entities to the target spawn point,
   * and fires onSceneExit / onSceneEnter lifecycle hooks.
   */
  loadScene: (params: { name: string; options?: LoadSceneOptions }) => Promise<void>;
  /** Name of the currently active scene, or null before any scene is loaded. */
  activeScene: DeepReadonly<Ref<string | null>>;
}
