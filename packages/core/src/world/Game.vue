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
const activeScene = shallowRef<string | null>(null);

async function loadScene({ name }: { name: string; options?: LoadSceneOptions }): Promise<void> {
  // Implementation will live here — scene teardown, spawn point resolution,
  // lifecycle hook dispatch, and persistent entity relocation.
  activeScene.value = name;
}

const ctx: GameContext = {
  world,
  storeRegistry,
  loadScene,
  activeScene: readonly(activeScene),
};

provide(GAME_KEY, ctx);
</script>

<template>
  <TresCanvas v-bind="attrs">
    <slot />
  </TresCanvas>
</template>
