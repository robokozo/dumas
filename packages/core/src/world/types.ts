import type { World } from "bitecs";
import type { DeepReadonly, Ref, Slot } from "vue";
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
  /** Names of all currently mounted <Scene> components, in mount order. */
  scenes: DeepReadonly<Ref<Array<string>>>;
  /**
   * Transition to a named scene. Destroys non-persistent entities from the
   * current scene, moves persistent entities to the target spawn point,
   * and fires onSceneExit / onSceneEnter lifecycle hooks.
   */
  loadScene: (params: { name: string; options?: LoadSceneOptions }) => Promise<void>;
  /** Name of the currently active scene, or null before any scene is loaded. */
  activeScene: DeepReadonly<Ref<string | null>>;
  /** @internal Called by <Scene> on mount. */
  registerScene: (params: { name: string }) => void;
  /** @internal Called by <Scene> on unmount. */
  unregisterScene: (params: { name: string }) => void;
  /** @internal Called by <Scene> to register its #overlay slot for rendering outside TresCanvas. */
  registerOverlay: (params: { name: string; slot: Slot }) => void;
  /** @internal Called by <Scene> on unmount to remove its overlay slot. */
  unregisterOverlay: (params: { name: string }) => void;
}
