import type { World } from "bitecs";
import type { DeepReadonly, Ref, ShallowRef, Slot } from "vue";
import type { ComponentFactory, ComponentStore } from "../types";

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
   * Transition to a named scene and fire onSceneExit / onSceneEnter lifecycle hooks.
   *
   * Pass `state` to hand arbitrary data to the incoming scene. It is available
   * immediately when the scene renders via `useGame().transitionState`.
   */
  loadScene: (params: { name: string; state?: Record<string, unknown> }) => Promise<void>;
  /** Name of the currently active scene, or null before any scene is loaded. */
  activeScene: DeepReadonly<Ref<string | null>>;
  /**
   * State passed to the most recent loadScene() call. Readable by any
   * component inside <Game> — use it to pass context from one scene to the
   * next (entry direction, inventory, quest flags, etc.).
   */
  transitionState: DeepReadonly<ShallowRef<Record<string, unknown>>>;
  /** @internal Called by <Scene> on mount. */
  registerScene: (params: { name: string }) => void;
  /** @internal Called by <Scene> on unmount. */
  unregisterScene: (params: { name: string }) => void;
  /** @internal Called by <Scene> to register its #overlay slot for rendering outside TresCanvas. */
  registerOverlay: (params: { name: string; slot: Slot }) => void;
  /** @internal Called by <Scene> on unmount to remove its overlay slot. */
  unregisterOverlay: (params: { name: string }) => void;
}
