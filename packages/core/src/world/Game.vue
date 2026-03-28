<script setup lang="ts">
import { provide, readonly, shallowRef, useAttrs } from "vue";
import { TresCanvas } from "@tresjs/core";
import { createWorld } from "bitecs";
import { GAME_KEY } from "../keys";
import type { ComponentFactory, ComponentStore } from "../types";
import type { GameContext } from "./types";
import type { LoadSceneOptions } from "../scene/types";

// Disable automatic attribute inheritance so we can forward attrs to TresCanvas
// manually — TresCanvasProps uses internal @tresjs/core types that can't be
// named in emitted declarations, so we avoid importing it here.
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const world = createWorld();
const storeRegistry = new Map<ComponentFactory, ComponentStore>();
const scenes = shallowRef<Array<string>>([]);
const activeScene = shallowRef<string | null>(null);

async function loadScene({ name }: { name: string; options?: LoadSceneOptions }): Promise<void> {
  // Implementation will live here — scene teardown, spawn point resolution,
  // lifecycle hook dispatch, and persistent entity relocation.
  activeScene.value = name;
}

function registerScene({ name }: { name: string }): void {
  scenes.value = [...scenes.value, name];
}

function unregisterScene({ name }: { name: string }): void {
  scenes.value = scenes.value.filter((s) => s !== name);
}

const ctx: GameContext = {
  world,
  storeRegistry,
  scenes: readonly(scenes),
  loadScene,
  activeScene: readonly(activeScene),
  registerScene,
  unregisterScene,
};

provide(GAME_KEY, ctx);
</script>

<template>
  <div v-bind="attrs" style="position: relative">
    <TresCanvas style="width: 100%; height: 100%">
      <slot />
    </TresCanvas>
    <div style="position: absolute; inset: 0; pointer-events: none">
      <slot name="overlay" />
    </div>
  </div>
</template>
