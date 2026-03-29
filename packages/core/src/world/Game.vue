<script setup lang="ts">
import { provide, readonly, shallowRef, useAttrs } from "vue";
import { TresCanvas } from "@tresjs/core";
import { createWorld } from "bitecs";
import { GAME_KEY } from "../keys";
import type { Slot, VNode } from "vue";
import type { ComponentFactory, ComponentStore } from "../types";
import type { GameContext } from "./types";

// Disable automatic attribute inheritance so we can forward attrs to TresCanvas
// manually — TresCanvasProps uses internal @tresjs/core types that can't be
// named in emitted declarations, so we avoid importing it here.
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const world = createWorld();
const storeRegistry = new Map<ComponentFactory, ComponentStore>();
const colliderRegistry = new Map<number, number>();
const sceneOverlays = shallowRef(new Map<string, Slot>());
const scenes = shallowRef<Array<string>>([]);
const activeScene = shallowRef<string | null>(null);
const transitionState = shallowRef<Record<string, unknown>>({});

async function loadScene({
  name,
  state = {},
}: {
  name: string;
  state?: Record<string, unknown>;
}): Promise<void> {
  // Implementation will live here — scene teardown, lifecycle hook dispatch,
  // and persistent entity relocation.
  transitionState.value = { from: activeScene.value, ...state };
  activeScene.value = name;
}

function registerScene({ name }: { name: string }): void {
  scenes.value = [...scenes.value, name];
}

function unregisterScene({ name }: { name: string }): void {
  scenes.value = scenes.value.filter((s) => s !== name);
}

function registerCollider({ handle, eid }: { handle: number; eid: number }): void {
  colliderRegistry.set(handle, eid);
}

function unregisterCollider({ handle }: { handle: number }): void {
  colliderRegistry.delete(handle);
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

// Renders the active scene's overlay slot from Game's DOM context so it
// never enters TresJS's custom renderer — Teleport from inside TresCanvas
// would route through Three.js createElement and fail on HTML elements.
const ActiveSceneOverlay = {
  render(): Array<VNode> | null {
    if (activeScene.value === null) return null;
    const slotFn = sceneOverlays.value.get(activeScene.value);
    if (slotFn === undefined) return null;
    return slotFn({ name: activeScene.value });
  },
};

const ctx: GameContext = {
  world,
  storeRegistry,
  colliderRegistry,
  scenes: readonly(scenes),
  loadScene,
  activeScene: readonly(activeScene),
  transitionState: readonly(transitionState),
  registerScene,
  unregisterScene,
  registerCollider,
  unregisterCollider,
  registerOverlay,
  unregisterOverlay,
};

provide(GAME_KEY, ctx);
</script>

<template>
  <div v-bind="attrs" style="position: relative">
    <TresCanvas style="width: 100%; height: 100%">
      <slot />
    </TresCanvas>
    <div style="position: absolute; inset: 0; pointer-events: none">
      <slot name="overlay" :active-scene="activeScene" :scenes="scenes" :load-scene="loadScene" />
      <component :is="ActiveSceneOverlay" />
    </div>
  </div>
</template>
