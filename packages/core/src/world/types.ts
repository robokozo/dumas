import type { World } from "bitecs";
import type { World as RapierWorld } from "@dimforge/rapier3d-compat";
import type { DeepReadonly, Ref, ShallowRef } from "vue";
import type { ComponentStore } from "../types";
import type { SceneContext } from "../scene/types";

export interface GameContext {
  /** The bitECS world instance. Use for ECS queries and component access. */
  world: World;
  /**
   * Per-game registry mapping component factories to their store instances.
   * Ensures each <Game> gets isolated store arrays — prevents eid collisions
   * when multiple games run on the same page.
   */
  storeRegistry: Map<object | symbol, ComponentStore>;
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
  registerScene: (params: { name: string; context: SceneContext }) => void;
  /** @internal Called by <Scene> on unmount. */
  unregisterScene: (params: { name: string }) => void;
  /** @internal Map of scene name → SceneContext, for hook lookup by loadScene. */
  sceneContexts: Map<string, SceneContext>;
  /**
   * The DOM element that scene overlay content is teleported into.
   * Scenes use `<Teleport :to="overlayEl">` to render overlay content
   * while preserving the Vue component tree for provide/inject.
   */
  overlayEl: ShallowRef<HTMLElement | null>;
  /**
   * @internal Maps Rapier collider handles to bitECS entity IDs.
   * Populated by createRigidBody's onMounted so that useCollision's
   * ECS filter can resolve which entity a collider belongs to.
   */
  colliderRegistry: Map<number, number>;
  /** @internal Called by createRigidBody's onMounted when a body is created. */
  registerCollider: (params: { handle: number; eid: number }) => void;
  /** @internal Called by createRigidBody's onUnmounted when a body is removed. */
  unregisterCollider: (params: { handle: number }) => void;
  /**
   * The active Rapier physics world, or null if usePhysics() has not been
   * called yet for this game instance.
   */
  physicsWorld: ShallowRef<RapierWorld | null>;
  /** @internal Called by usePhysics() to register the world after WASM init. */
  registerPhysicsWorld: (params: { world: ShallowRef<RapierWorld | null> }) => void;
  /**
   * Register a function to run every frame in the central game loop.
   * Lower priority numbers run first. Returns an unregister function.
   * @internal Called by useSystem, usePhysicsSync, useCollision, etc.
   */
  registerSystem: (params: {
    fn: (delta: number, elapsed: number) => void;
    priority?: number;
  }) => () => void;
}
