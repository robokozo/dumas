<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, provide, useSlots } from "vue";
import { GAME_KEY, SCENE_KEY } from "../keys";
import type { SceneContext, SpawnPointRecord } from "./types";

const props = defineProps<{
  name: string;
  /** If true, this scene renders before any loadScene() call has been made. */
  default?: boolean;
}>();

const game = inject(GAME_KEY);
if (game === undefined) {
  throw new Error("[dumas] <Scene> must be placed inside a <Game> component.");
}

const slots = useSlots();

const isActive = computed(() => {
  if (game.activeScene.value === null) return props.default === true;
  return game.activeScene.value === props.name;
});

const spawnPoints = new Map<string, SpawnPointRecord>();

function registerSpawnPoint(record: SpawnPointRecord): void {
  spawnPoints.set(record.name, record);
}

function unregisterSpawnPoint({ name }: { name: string }): void {
  spawnPoints.delete(name);
}

const ctx: SceneContext = {
  name: props.name,
  isActive,
  registerSpawnPoint,
  unregisterSpawnPoint,
};

provide(SCENE_KEY, ctx);

onMounted(() => {
  game.registerScene({ name: props.name });
  if (props.default === true && game.activeScene.value === null) {
    game.loadScene({ name: props.name });
  }
  if (slots.overlay !== undefined) {
    game.registerOverlay({ name: props.name, slot: slots.overlay });
  }
});

onUnmounted(() => {
  game.unregisterScene({ name: props.name });
  game.unregisterOverlay({ name: props.name });
});
</script>

<template>
  <slot v-if="isActive" />
</template>
