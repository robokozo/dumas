<script setup lang="ts">
import { provide, ref } from "vue";
import { SCENE_KEY } from "../keys";
import type { SceneContext, SpawnPointRecord } from "./types";

const props = defineProps<{
  name: string;
}>();

const spawnPoints = new Map<string, SpawnPointRecord>();
const isActive = ref(false);

function registerSpawnPoint(record: SpawnPointRecord): void {
  spawnPoints.set(record.name, record);
}

function unregisterSpawnPoint({ name }: { name: string }): void {
  spawnPoints.delete(name);
}

const ctx: SceneContext = {
  name: props.name,
  get isActive() {
    return isActive.value;
  },
  registerSpawnPoint,
  unregisterSpawnPoint,
};

provide(SCENE_KEY, ctx);
</script>

<template>
  <!--
    TODO: Only render slot when this scene is active. On activation/deactivation
    fire onSceneEnter / onSceneExit hooks registered via useScene().
  -->
  <slot />
</template>
