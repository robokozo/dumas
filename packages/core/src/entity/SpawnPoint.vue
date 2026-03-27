<script setup lang="ts">
import { inject, onMounted, onUnmounted } from "vue";
import { SCENE_KEY } from "../keys";
import type { Vec3, Quat } from "../types";

const props = withDefaults(
  defineProps<{
    name: string;
    position?: Vec3;
    rotation?: Quat;
  }>(),
  {
    position: () => ({ x: 0, y: 0, z: 0 }),
    rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
  },
);

const scene = inject(SCENE_KEY);
if (scene === undefined) {
  throw new Error("[dumas] <SpawnPoint> must be placed inside a <Scene>.");
}

onMounted(() => {
  scene.registerSpawnPoint({
    name: props.name,
    position: props.position,
    rotation: props.rotation,
  });
});

onUnmounted(() => {
  scene.unregisterSpawnPoint({ name: props.name });
});
</script>

<template>
  <!-- SpawnPoint is a logical anchor — no visual output. -->
</template>
