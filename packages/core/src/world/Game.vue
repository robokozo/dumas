<script setup lang="ts">
import { defineComponent, provide, readonly, shallowRef, useAttrs } from "vue";
import type { ShallowRef, Slot, VNode } from "vue";
import type { World as RapierWorld } from "@dimforge/rapier3d-compat";
import { TresCanvas, useLoop } from "@tresjs/core";
import { createWorld } from "bitecs";
import { GAME_KEY } from "../keys";
import type { ComponentStore } from "../types";
import type { SceneContext } from "../scene/types";
import type { GameContext } from "./types";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const world = createWorld();
const storeRegistry = new Map<object | symbol, ComponentStore>();
const colliderRegistry = new Map<number, number>();
const physicsWorldRef = shallowRef<RapierWorld | null>(null);
const sceneOverlays = shallowRef(new Map<string, Slot>());
const scenes = shallowRef<Array<string>>([]);
const activeScene = shallowRef<string | null>(null);
const transitionState = shallowRef<Record<string, unknown>>({});

// ─── system registry ──────────────────────────────────────────────────────────
// Sorted array of { fn, priority }. Rebuilt when dirty.

interface SystemEntry {
  fn: (delta: number, elapsed: number) => void;
  priority: number;
  addIndex: number;
}

let systemEntries: Array<SystemEntry> = [];
let addCount = 0;
let isDirty = false;

function registerSystem({
  fn,
  priority = 0,
}: {
  fn: (delta: number, elapsed: number) => void;
  priority?: number;
}): () => void {
  const entry: SystemEntry = { fn, priority, addIndex: addCount++ };
  systemEntries = [...systemEntries, entry];
  isDirty = true;

  return () => {
    systemEntries = systemEntries.filter((e) => e !== entry);
    isDirty = true;
  };
}

// ─── GameLoop — lives inside TresCanvas so useLoop() is valid ─────────────────
// Defined here so it closes over Game.vue's system registry and physics world.

const FIXED_TIMESTEP = 1 / 60;
const MAX_SUBSTEPS = 4;

const GameLoop = defineComponent({
  setup() {
    const { onBeforeRender } = useLoop();

    let physicsAccumulator = 0;

    onBeforeRender(({ delta, elapsed }) => {
      // Fixed-timestep physics stepping to prevent jitter
      const world = physicsWorldRef.value;
      if (world !== null) {
        physicsAccumulator += delta;
        // Cap to prevent spiral of death on long frames
        if (physicsAccumulator > FIXED_TIMESTEP * MAX_SUBSTEPS) {
          physicsAccumulator = FIXED_TIMESTEP * MAX_SUBSTEPS;
        }
        while (physicsAccumulator >= FIXED_TIMESTEP) {
          world.step();
          physicsAccumulator -= FIXED_TIMESTEP;
        }
      }

      if (isDirty) {
        systemEntries = [...systemEntries].sort((a, b) => {
          const diff = a.priority - b.priority;
          return diff !== 0 ? diff : a.addIndex - b.addIndex;
        });
        isDirty = false;
      }

      for (const entry of systemEntries) {
        entry.fn(delta, elapsed);
      }
    });

    return () => null;
  },
});

// ─── scene management ─────────────────────────────────────────────────────────

const sceneContexts = new Map<string, SceneContext>();
let isTransitioning = false;

async function loadScene({
  name,
  state = {},
}: {
  name: string;
  state?: Record<string, unknown>;
}): Promise<void> {
  if (isTransitioning) {
    return;
  }
  isTransitioning = true;

  const previousScene = activeScene.value;

  // Fire exit hooks on the scene being left
  if (previousScene !== null) {
    const exitCtx = sceneContexts.get(previousScene);
    if (exitCtx !== undefined) {
      for (const hook of exitCtx.exitHooks) {
        await hook({ sceneName: previousScene, nextScene: name });
      }
    }
  }

  transitionState.value = { from: previousScene, ...state };
  activeScene.value = name;

  // Fire enter hooks on the scene being entered
  const enterCtx = sceneContexts.get(name);
  if (enterCtx !== undefined) {
    for (const hook of enterCtx.enterHooks) {
      await hook({ sceneName: name });
    }
  }

  isTransitioning = false;
}

function registerScene({ name, context }: { name: string; context: SceneContext }): void {
  scenes.value = [...scenes.value, name];
  sceneContexts.set(name, context);
}

function unregisterScene({ name }: { name: string }): void {
  scenes.value = scenes.value.filter((s) => s !== name);
  sceneContexts.delete(name);
}

function registerCollider({ handle, eid }: { handle: number; eid: number }): void {
  colliderRegistry.set(handle, eid);
}

function unregisterCollider({ handle }: { handle: number }): void {
  colliderRegistry.delete(handle);
}

function registerPhysicsWorld({
  world: rapierWorld,
}: {
  world: ShallowRef<RapierWorld | null>;
}): void {
  physicsWorldRef.value = rapierWorld.value;
}

function registerOverlay({ name, slot }: { name: string; slot: Slot }): void {
  const next = new Map(sceneOverlays.value);
  next.set(name, slot);
  sceneOverlays.value = next;
}

function unregisterOverlay({ name }: { name: string }): void {
  const next = new Map(sceneOverlays.value);
  next.delete(name);
  sceneOverlays.value = next;
}

const ActiveSceneOverlay = defineComponent({
  render(): Array<VNode> | null {
    if (activeScene.value === null) return null;
    const slotFn = sceneOverlays.value.get(activeScene.value);
    if (slotFn === undefined) return null;
    return slotFn({ name: activeScene.value });
  },
});

const ctx: GameContext = {
  world,
  storeRegistry,
  colliderRegistry,
  physicsWorld: physicsWorldRef,
  scenes: readonly(scenes),
  loadScene,
  activeScene: readonly(activeScene),
  transitionState: readonly(transitionState),
  sceneContexts,
  registerScene,
  unregisterScene,
  registerCollider,
  unregisterCollider,
  registerPhysicsWorld,
  registerOverlay,
  unregisterOverlay,
  registerSystem,
};

provide(GAME_KEY, ctx);
</script>

<template>
  <div v-bind="attrs" style="position: relative">
    <TresCanvas style="width: 100%; height: 100%">
      <GameLoop />
      <slot />
    </TresCanvas>
    <div style="position: absolute; inset: 0; pointer-events: none">
      <slot name="overlay" :active-scene="activeScene" :scenes="scenes" :load-scene="loadScene" />
      <ActiveSceneOverlay />
    </div>
  </div>
</template>
