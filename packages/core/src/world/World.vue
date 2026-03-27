<script lang="ts">
import type { Vec3 } from "../types";

// Module-scope constants for withDefaults factories — defineProps is hoisted
// outside setup() so factory functions cannot close over setup-scoped locals.
const DEFAULT_GRAVITY: Vec3 = { x: 0, y: -9.81, z: 0 };
const DEFAULT_TIMESTEP = 1 / 60;
</script>

<script setup lang="ts">
import { provide, ref, useAttrs } from "vue";
import { TresCanvas } from "@tresjs/core";
import { WORLD_KEY } from "../keys";
import { createEcsWorld } from "../ecs/world";
import type { WorldContext, WorldOptions } from "./types";
import type { LoadSceneOptions } from "../scene/types";

// Disable automatic attribute inheritance so we can forward attrs to TresCanvas
// manually — TresCanvasProps uses internal @tresjs/core types that can't be
// named in emitted declarations, so we avoid importing it here.
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const props = withDefaults(defineProps<WorldOptions>(), {
  gravity: () => DEFAULT_GRAVITY,
  timestep: () => DEFAULT_TIMESTEP,
});

const ecsWorld = createEcsWorld();
const activeScene = ref<string | null>(null);

async function loadScene({ name }: { name: string; options?: LoadSceneOptions }): Promise<void> {
  // Implementation will live here — scene teardown, spawn point resolution,
  // lifecycle hook dispatch, and persistent entity relocation.
  activeScene.value = name;
}

const ctx: WorldContext = {
  ecsWorld,
  loadScene,
  get activeScene() {
    return activeScene.value;
  },
};

provide(WORLD_KEY, ctx);
</script>

<template>
  <TresCanvas v-bind="attrs">
    <slot />
  </TresCanvas>
</template>
