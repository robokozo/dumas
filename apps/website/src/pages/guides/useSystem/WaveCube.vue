<script setup lang="ts">
import { shallowRef, inject, onUnmounted } from "vue";
import { useEntity, useEcsComponent, Transform } from "@dumas/core";
import { WAVE_REGISTRY_KEY } from "./waveRegistry";

const CUBE_SIZE = 0.75;
const WAVE_AMPLITUDE = 1.5;

const props = defineProps<{ startX: number; color: string; phase: number }>();

const { eid } = useEntity();

Transform.posX[eid] = props.startX;
Transform.posY[eid] = Math.sin(props.phase) * WAVE_AMPLITUDE;

const posY = shallowRef(Transform.posY[eid]);
const rotY = shallowRef(0);

// Attach Transform with no per-entity fn — WaveSystem drives all cubes.
useEcsComponent({ eid, components: [Transform] });

const registry = inject(WAVE_REGISTRY_KEY);
if (registry !== undefined) {
  registry.set(eid, { posY, rotY, phase: props.phase });
  onUnmounted(() => {
    registry.delete(eid);
  });
}
</script>

<template>
  <TresMesh :position="[props.startX, posY, 0]" :rotation="[0, rotY, 0]">
    <TresBoxGeometry :args="[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]" />
    <TresMeshStandardMaterial :color="color" />
  </TresMesh>
</template>
