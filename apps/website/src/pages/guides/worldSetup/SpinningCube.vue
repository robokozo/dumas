<script setup lang="ts">
import { ref } from "vue";
import { useSystem } from "@dumas/core";
import type { Mesh } from "three";

const ROTATION_SPEED_Y = 0.8;
const ROTATION_SPEED_X = 0.3;

const cubeRef = ref<Mesh | null>(null);

useSystem({
  fn: ({ delta }) => {
    if (cubeRef.value !== null) {
      cubeRef.value.rotation.y += delta * ROTATION_SPEED_Y;
      cubeRef.value.rotation.x += delta * ROTATION_SPEED_X;
    }
  },
});
</script>

<template>
  <TresMesh ref="cubeRef">
    <TresBoxGeometry :args="[1.5, 1.5, 1.5]" />
    <TresMeshStandardMaterial color="#44aaff" />
  </TresMesh>
</template>
