<script setup lang="ts">
import { shallowRef } from "vue";
import { useEntity, useEcsComponent, Transform } from "@dumas/core";

const CUBE_SIZE = 0.75;
const WAVE_SPEED = 2.5;
const WAVE_AMPLITUDE = 1.5;
const SPIN_SPEED = 1.2;

const props = defineProps<{ startX: number; color: string; phase: number }>();

const { eid } = useEntity();

Transform.posX[eid] = props.startX;
Transform.posY[eid] = Math.sin(props.phase) * WAVE_AMPLITUDE;

const posY = shallowRef(Transform.posY[eid]);
const rotY = shallowRef(0);

useEcsComponent({
  eid,
  components: [Transform],
  fn: ({ elapsed, delta }) => {
    Transform.posY[eid] = Math.sin(elapsed * WAVE_SPEED + props.phase) * WAVE_AMPLITUDE;
    Transform.rotY[eid] += delta * SPIN_SPEED;
    posY.value = Transform.posY[eid];
    rotY.value = Transform.rotY[eid];
  },
});
</script>

<template>
  <TresMesh :position="[props.startX, posY, 0]" :rotation="[0, rotY, 0]">
    <TresBoxGeometry :args="[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]" />
    <TresMeshStandardMaterial :color="color" />
  </TresMesh>
</template>
