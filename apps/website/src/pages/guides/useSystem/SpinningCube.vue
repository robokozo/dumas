<script setup lang="ts">
import { shallowRef } from "vue";
import { useSystem } from "@dumas/core";

const CUBE_SIZE = 0.75;
const WAVE_SPEED = 2.5;
const WAVE_AMPLITUDE = 1.5;
const SPIN_SPEED = 1.2;

const props = defineProps<{ startX: number; color: string; phase: number }>();

const posY = shallowRef(Math.sin(props.phase) * WAVE_AMPLITUDE);
const rotY = shallowRef(0);

useSystem({
  fn: ({ delta, elapsed }) => {
    posY.value = Math.sin(elapsed * WAVE_SPEED + props.phase) * WAVE_AMPLITUDE;
    rotY.value += delta * SPIN_SPEED;
  },
});
</script>

<template>
  <TresMesh :position="[props.startX, posY, 0]" :rotation="[0, rotY, 0]">
    <TresBoxGeometry :args="[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]" />
    <TresMeshStandardMaterial :color="color" />
  </TresMesh>
</template>
