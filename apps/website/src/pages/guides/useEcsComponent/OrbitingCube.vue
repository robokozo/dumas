<script setup lang="ts">
import { useEcsComponent, createTransform } from "@dumas/core";

const CUBE_SIZE = 0.75;
const WAVE_SPEED = 2.5;
const WAVE_AMPLITUDE = 1.5;
const SPIN_SPEED = 1.2;

const props = defineProps<{ startX: number; color: string; phase: number }>();

const { transform } = useEcsComponent({
  components: { transform: createTransform },
  fn: ({ transform, delta, elapsed }) => {
    transform.posY.value = Math.sin(elapsed * WAVE_SPEED + props.phase) * WAVE_AMPLITUDE;
    transform.rotY.value += delta * SPIN_SPEED;
  },
});

transform.posX.value = props.startX;
transform.posY.value = Math.sin(props.phase) * WAVE_AMPLITUDE;
</script>

<template>
  <TresMesh
    :position="[props.startX, transform.posY.value, 0]"
    :rotation="[0, transform.rotY.value, 0]"
  >
    <TresBoxGeometry :args="[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]" />
    <TresMeshStandardMaterial :color="color" />
  </TresMesh>
</template>
